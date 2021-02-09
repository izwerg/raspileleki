import { Subject, combineLatest } from 'rxjs';
import { takeUntil, concatMap } from 'rxjs/operators/index.js';

import { logger } from './lib/logger.js'
import { config } from './config.js';

import devices from './devices/index.js';

async function main() {
  process
    .on('SIGTERM', () => destroy())
    .on('SIGINT', () => destroy())
    .on('uncaughtException', (err) => (logger.error(err), destroy(1)));

  const destroyed$ = new Subject();

  logger.info('Process started.')

  const tempSensor = new devices[config.tempSensor.type](config.tempSensor);
  const tempRelay = new devices[config.tempRelay.type](config.tempRelay);

  combineLatest([tempSensor.temperature$, tempRelay.state$])
    .pipe(takeUntil(destroyed$))
    .pipe(concatMap(async arr => {
      const [temp, state] = arr;
      if (temp >= config.tempMax && state) {
        await tempRelay.write(false);
        logger.info(`Heating OFF (t=${temp})`);
      } else if (temp <= config.tempMin && !state) {
        await tempRelay.write(true);
        logger.info(`Heating ON (t=${temp})`);
      }
    }))
    .subscribe();

  function destroy(status = 0) {
    destroyed$.next();
    destroyed$.complete();
    setTimeout(_ => (logger.info('Process stopped.'), process.exit(status)), 100);
  }
}

main();
