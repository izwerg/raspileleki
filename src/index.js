import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators/index.js';

import { logger } from './lib/logger.js'
import { config } from './config.js';

import { Ds18b20 } from './lib/ds18b20.js';

import { openBus } from './lib/i2c.js';
import { Relay } from './lib/relay.js';

process
  .on('SIGTERM', () => destroy())
  .on('SIGINT', () => destroy())
  .on('uncaughtException', (err) => (logger.error(err), destroy(1)));

const destroyed$ = new Subject();

function destroy(status = 0) {
  destroyed$.next();
  destroyed$.complete();
  setTimeout(_ => (logger.info('Process stopped.'), process.exit(status)), 100);
}
  
async function main() {
  logger.info('Process started.')

  const bus = await openBus();

  const sensor = new Ds18b20(config.ds18b20Id);
  const relay = new Relay(bus, config.relays[0]);

  combineLatest([sensor.temperature$, relay.state$])
  .pipe(takeUntil(destroyed$))
  .subscribe(arr => {
    const [temp, state] = arr;
    logger.info(`t=${temp}, s=${state}`);
  })

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

}

main();
