import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators/index.js';

import { logger } from './lib/logger.js'
import { config } from './config.js';

import { Ds18b20 } from './lib/ds18b20.js';
import { Relay } from './lib/relay.js';

process
  .on('SIGTERM', () => destroy())
  .on('SIGINT', () => destroy())
  .on('uncaughtException', (err) => (logger.error(err), destroy(1)));

logger.info('Process started.')

const destroyed$ = new Subject();

const sensor = new Ds18b20(config.ds18b20Id);
const relay = new Relay(config.relays[0]);

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
