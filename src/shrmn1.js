import { writeFile } from 'fs/promises';
import { Subject, combineLatest, timer, of } from 'rxjs';
import { takeUntil, concatMap, withLatestFrom, map, throttleTime, tap, exhaustMap, catchError } from 'rxjs/operators/index.js';

import { logger } from './lib/logger.js'
import { config } from './config.js';

import { createDevice } from './devices/index.js';

async function main() {
  process
    .on('SIGTERM', () => destroy())
    .on('SIGINT', () => destroy())
    .on('uncaughtException', (err) => (logger.error(err), destroy(1)));

  const destroyed$ = new Subject();

  logger.info('Process started.')

  const tempSensor = createDevice(config.tempSensor);
  const tempRelay = createDevice(config.tempRelay);
  const humidSensor = createDevice(config.humidSensor);

  combineLatest([tempSensor.data$, tempRelay.state$])
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

  const sensor$ = combineLatest([tempSensor.data$, humidSensor.data$, tempRelay.state$]);
    
  timer(500, 30000)
    .pipe(
      withLatestFrom(sensor$),
      map(([, data]) => data),
    )
    .subscribe(([temp, humid, heating]) => logger.info(`Sensors: temp=${temp}, humid=${humid}, heating=${heating}`));

    // TODO: create tmpfs for this file

  // sensor$
  //   .pipe(
  //     throttleTime(1000, undefined, { leading: false, trailing: true }),
  //     exhaustMap(([temp, humid, heating]) => writeFile(config.sensorsPath, JSON.stringify({ temp, humid, heating })).catch(err => logger.error(err, `${config.sensorsPath}`))),
  //   )
  //   .subscribe();

  function destroy(status = 0) {
    destroyed$.next();
    destroyed$.complete();
    tempRelay.write(false);
    setTimeout(_ => (logger.info('Process stopped.'), process.exit(status)), 100);
  }
}

main();

