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

const isMovementPossible = (arrow, acc) => 
  stepByArrow[arrow].x + stepByArrow[acc].x === 0 &&
  stepByArrow[arrow].y + stepByArrow[acc].y === 0;

const main = ({DOM, Keys}) => {
  const arrow$ = Keys.down('left').merge(Keys.down('up')).merge(Keys.down('right')).merge(Keys.down('down'))
    .map(x => x.keyIdentifier.toLowerCase())
    .scan((acc, arrow) => isMovementPossible(arrow, acc) ? acc : arrow, 'right')
    .distinctUntilChanged();

  const level$ = Rx.Observable.interval(1000);

  const movement$ = level$.withLatestFrom(arrow$);

  const result$ = movement$
    .map(x => x[1])
    .map(x => stepByArrow[x])
    .scan(
      (acc, movement) => {
        const horizontalLocation = (acc.x + movement.x) % boardSize.horizontal;
        const verticalLocation = (acc.y + movement.y) % boardSize.vertical;
        return {
          x: horizontalLocation < 0 ? boardSize.horizontal - 1 : horizontalLocation,
          y: verticalLocation < 0 ? boardSize.vertical - 1 : verticalLocation
        }
      },
      {x: 4, y: 2});

  return {
    DOM: result$.map(head => {
      return div(_.range(boardSize.vertical)
        .map(row => div(_.range(boardSize.horizontal)
          .map(col => span(row === (boardSize.vertical - 1 - head.y) && col === head.x ? '[+]' : '[ ]')))));
    }),
    Log: result$
  };
};

const drivers = {
  DOM: makeDOMDriver('#root'),
  Keys: makeKeysDriver(),
  Log: msg$ => { msg$.subscribe(msg => console.log(msg)) }
}

Cycle.run(main, drivers);
