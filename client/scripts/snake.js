const {h1, div, input, makeDOMDriver} = CycleDOM;
import {makeKeysDriver} from 'cycle-keys';

const main = ({DOM, Keys}) => {
  const arrow$ = Keys.down('left').merge(Keys.down('up')).merge(Keys.down('right')).merge(Keys.down('down'))
    .map(x => x.keyIdentifier)
    .distinctUntilChanged();

  const level$ = Rx.Observable.interval(1000);

  const movement$ = level$.withLatestFrom(arrow$);

  return {
    DOM: movement$.map(x => div([h1(`Moving ${x}`)])),
    Log: movement$
  };
};

const drivers = {
  DOM: makeDOMDriver('#root'),
  Keys: makeKeysDriver(),
  Log: msg$ => { msg$.subscribe(msg => console.log(msg)) }
}

Cycle.run(main, drivers);