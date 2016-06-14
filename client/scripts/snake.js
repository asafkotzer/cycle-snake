const {span, div, input, makeDOMDriver} = CycleDOM;
import {makeKeysDriver} from 'cycle-keys';
import _ from 'lodash';

const boardSize = { horizontal: 9, vertical: 5 };
const stepByArrow = {
  left:  { x: -1, y: 0  },
  up:    { x: 0,  y: 1  },
  right: { x: 1,  y: 0  },
  down:  { x: 0,  y: -1 },
}
const length = 3;

const isMovementPossible = (arrow, acc) => 
  stepByArrow[arrow].x + stepByArrow[acc].x === 0 &&
  stepByArrow[arrow].y + stepByArrow[acc].y === 0;

const main = ({DOM, Keys}) => {
  const arrow$ = Keys.down('left').merge(Keys.down('up')).merge(Keys.down('right')).merge(Keys.down('down'))
    .map(x => x.keyIdentifier.toLowerCase())
    .scan((acc, arrow) => isMovementPossible(arrow, acc) ? acc : arrow, 'right')
    .distinctUntilChanged();

  const movement$ = Rx.Observable.interval(1000)
    .withLatestFrom(arrow$)
    .map(x => x[1])
    .map(x => stepByArrow[x])
    .scan(
      (acc, movement) => {
        const headX = (acc.snake[0].x + movement.x) % boardSize.horizontal;
        const headY = (acc.snake[0].y + movement.y) % boardSize.vertical;

        const snake = acc.snake.map((_, i, arr) =>
          i === 0 ? {
            x: headX < 0 ? boardSize.horizontal - 1 : headX,
            y: headY < 0 ? boardSize.vertical - 1 : headY 
          } : arr[i-1]
        );

        let token = acc.token;
        if (snake[0].x === token.x && snake[0].y === token.y) {
          do {
            token = {
              x: _.random(boardSize.horizontal - 1),
              y: _.random(boardSize.vertical - 1)
            };
          } while (_.some(snake, cell => token.x === cell.x && token.y === cell.y))
          snake.push(acc.snake[acc.snake.length - 1]);
        }

        return {
          snake,
          token
        };
      },
      {snake: [{x: 4, y: 2}, {x: 3, y:2}, {x: 2, y:2}], token: {x: 7, y: 2}});

  return {
    DOM: movement$.map(board => {
      return div(_.range(boardSize.vertical)
        .map(row => div(_.range(boardSize.horizontal)
           .map(col => span(_.some(board.snake.concat(board.token), p => p.x === col && (boardSize.vertical - 1 - p.y) === row) ? '[+]' : '[ ]')))));
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
