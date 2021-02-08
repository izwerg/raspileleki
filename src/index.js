import { Subject, combineLatest } from 'rxjs';
import { takeUntil, concatMap } from 'rxjs/operators/index.js';

import { logger } from './lib/logger.js'
import { config } from './config.js';

import { Ds18b20 } from './lib/ds18b20.js';

import { Relay } from './lib/relay.js';
  
async function main() {
  process
  .on('SIGTERM', () => destroy())
  .on('SIGINT', () => destroy())
  .on('uncaughtException', (err) => (logger.error(err), destroy(1)));

  const destroyed$ = new Subject();

  logger.info('Process started.')

  const sensor = new Ds18b20(config.ds18b20Id);
  const heater = new Relay(config.relays[0]);

  console.time('HEATER.READ TIME');
  const blah = await heater.read();
  console.timeEnd('HEATER.READ TIME');
  console.log('HEATER', blah);
  console.log('---------');
  await new Promise(resolve => setTimeout(resolve, 100));
  console.time('HEATER.WRITE TIME');
  await heater.write(true);
  console.timeEnd('HEATER.WRITE TIME');
  console.log('---------');
  await new Promise(resolve => setTimeout(resolve, 100));
  console.time('HEATER.READ TIME');
  const blah1 = await heater.read();
  console.timeEnd('HEATER.READ TIME');
  console.log('HEATER', blah1);


  // combineLatest([sensor.temperature$, relay.state$])
  // .pipe(takeUntil(destroyed$))
  // .pipe(concatMap(async arr => {
  //   const [temp, state] = arr;
  //   logger.info(`t=${temp}, s=${state}`);
  //   if (state) {
  //     if (temp >= config.tempMax) {
  //       await relay.write(false);
  //     }
  //   } else {
  //     if (temp <= config.tempMin) {
  //       await relay.write(true);
  //     }
  //   }
  // }))
  // .subscribe();

  // sensor.temperature$
  //   .pipe(takeUntil(destroyed$))
  //   .subscribe(temp => {
  //     logger.info(`TEMP ${temp}`);
  //     logger.info(`-----------`);
  //   });

// relay.state$
//   .pipe(takeUntil(destroyed$))
//   .subscribe(state => {
//     logger.info(`RELAY ${state}`);
//   });

  function destroy(status = 0) {
    destroyed$.next();
    destroyed$.complete();
    setTimeout(_ => (logger.info('Process stopped.'), process.exit(status)), 100);
    // bus.close();
  }
}

main();
