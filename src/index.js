import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators/index.js';
import { logger } from './lib/logger.js'
import { Ds18b20 } from './lib/ds18b20.js';

process
  .on('SIGTERM', () => destroy())
  .on('SIGINT', () => destroy())
  .on('uncaughtException', (err) => (logger.error(err), destroy(1)));

logger.info('Process started.')

const destroyed$ = new Subject();

const sensor = new Ds18b20('28-3c01d607e06a');

sensor.temperature$
  .pipe(takeUntil(destroyed$))
  .subscribe(temp => {
    logger.info(`TEMP ${temp}`);
  });



function destroy(status = 0) {
  destroyed$.next();
  destroyed$.complete();
  setTimeout(_ => (logger.info('Process stopped.'), process.exit(status)), 100);
}
