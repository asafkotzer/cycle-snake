const {span, div, input, makeDOMDriver} = CycleDOM;
import {makeKeysDriver} from 'cycle-keys';
import _ from 'lodash';

const interval = 100;
const boardStyle = {style: { 'display': 'inline-block', 'border-width': '1px', 'border-style': 'solid', 'padding': '5px' }};
const rowStyle = {style: { height: '10px' }};
const boardSize = { horizontal: 20, vertical: 20 };
const stepByArrow = {
  left:  { x: -1, y: 0  },
  up:    { x: 0,  y: 1  },
  right: { x: 1,  y: 0  },
  down:  { x: 0,  y: -1 },
}

const isMovementPossible = (acc, arrow) => 
  stepByArrow[arrow].x + stepByArrow[acc].x === 0 &&
  stepByArrow[arrow].y + stepByArrow[acc].y === 0;

const move = (previous, head, previousToken) => {
  let snake = previous.map((_, i, arr) =>
  i === 0 ? {
    x: head.x < 0 ? boardSize.horizontal - 1 : head.x,
    y: head.y < 0 ? boardSize.vertical - 1 : head.y 
  } : arr[i-1]);

  let token = previousToken;
  if (snake[0].x === token.x && snake[0].y === token.y) {
    do {
      token = {
        x: _.random(boardSize.horizontal - 1),
        y: _.random(boardSize.vertical - 1)
      };
    } while (_.some(snake, cell => token.x === cell.x && token.y === cell.y))
    snake = snake.concat(previous[previous.length - 1]);
  }

  return [snake, token];
};

const shouldDraw = (board, row, col) => _.some(
  board.snake.concat(board.token),
  p => p.x === col && (boardSize.vertical - 1 - p.y) === row);

const getError = (snake, head) => {
  if (_.some(_.tail(snake), cell => head.x === cell.x && head.y === cell.y)) return 'self';
  if (head.x >= boardSize.horizontal || head.y >= boardSize.vertical) return 'wall';
  if (head.x < 0 || head.y < 0) return 'wall';
  return null;
};

const main = ({DOM, Keys}) => {
  const arrow$ = Keys.down('left').merge(Keys.down('up')).merge(Keys.down('right')).merge(Keys.down('down'))  
    .map(x => x.keyIdentifier.toLowerCase())
    .scan((acc, arrow) => isMovementPossible(acc, arrow) ? acc : arrow, 'right')
    .distinctUntilChanged();

  const movement$ = Rx.Observable.interval(interval)
    .withLatestFrom(arrow$)
    .map(x => x[1])
    .map(x => stepByArrow[x])
    .scan(
      (acc, movement) => {
        const head = {
          x: acc.snake[0].x + movement.x,
          y: acc.snake[0].y + movement.y
        };

        const [snake, token] = move(acc.snake, head, acc.token);
        
        return {
          snake,
          token,
          error: getError(snake, head)
        };
      },
      {snake: [{x: 4, y: 2}, {x: 3, y:2}, {x: 2, y:2}], token: {x: 7, y: 2}})
    .takeWhile(board => !board.error) 

  return {
    DOM: movement$.map(board => {
      return div(boardStyle, _.range(boardSize.vertical)
        .map(row => div(rowStyle, _.range(boardSize.horizontal)
          .map(col => div({style: { display: 'inline-block', width: '10px', height: '10px', 'background-color': shouldDraw(board, row, col) ? 'gray' : 'white'}})))));
    }),
    Log: movement$
  };
};

const drivers = {
  DOM: makeDOMDriver('#root'),
  Keys: makeKeysDriver(),
  Log: msg$ => { msg$.subscribe(msg => console.log(msg)) }
}

Cycle.run(main, drivers);
