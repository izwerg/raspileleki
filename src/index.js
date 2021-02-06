import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators/index.js';
import { logger } from './lib/logger.js'
import { Ds18b20 } from './lib/ds18b20.js';
import { Relay } from './lib/relay.js';

process
  .on('SIGTERM', () => destroy())
  .on('SIGINT', () => destroy())
  .on('uncaughtException', (err) => (logger.error(err), destroy(1)));

logger.info('Process started.')

const destroyed$ = new Subject();

const sensor = new Ds18b20('28-3c01d607e06a'); // TODO: config
const relay = new Relay(0x27, 0x00, 0x01); // TODO: config

// sensor.temperature$
//   .pipe(takeUntil(destroyed$))
//   .subscribe(temp => {
//     logger.info(`TEMP ${temp}`);
//   });

// relay.state$
//   .pipe(takeUntil(destroyed$))
//   .subscribe(state => {
//     logger.info(`RELAY ${state}`);
//   });

combineLatest([sensor.temperature$, relay.state$])
  .pipe(takeUntil(destroyed$))
  .subscribe(arr => {
    const [temp, state] = arr;
    logger.info(`t=${temp}, s=${state}`);
  })

function destroy(status = 0) {
  destroyed$.next();
  destroyed$.complete();
  setTimeout(_ => (logger.info('Process stopped.'), process.exit(status)), 100);
}
