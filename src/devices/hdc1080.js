import { timer } from 'rxjs';
import { distinctUntilChanged, exhaustMap, share } from 'rxjs/operators/index.js';

import { openBus } from '../lib/i2c.js';
import { logger } from '../lib/logger.js';

const TMP = 0x00; // Temperature Register
const HUM = 0x01; // Humidity Register
const CFG = 0x02; // Configuration Register
const delay = 15; // ms

export class HDC1080 {
  constructor({ id, interval = 1000 }) {
    this.address = (id >> 8) & 0xff;
    this.register = id & 0xff;
    this.interval = interval;

    this.data$ = timer(100, this.interval)
      .pipe(
        exhaustMap(() => this.read()),
        distinctUntilChanged(),
        share(),
      );
  }

  async read() {
    const bus = await openBus();
    try {
      // await bus.writeWord(this.address, CFG, 0b0000010100000000);
      // await timer(delay).toPromise();

      await bus.i2cWrite(this.address, 1, Buffer.from([this.register])); // trigger measurement
      await timer(delay).toPromise();

      const buf = Buffer.alloc(2);
      await bus.i2cRead(this.address, buf.length, buf); // read results
      await timer(delay).toPromise();

      let data;
      if (this.register === TMP) {
        data = ((((buf[0] << 8) + buf[1]) / 65536) * 165) - 40;
      } else {
        data = ((((buf[0] << 8) + buf[1]) / 65536) * 100)
      }
      return Math.round(data * 100) / 100;
    } catch (err) {
      logger.error(err, `HDC1080[0x${this.address.toString(16)} 0x${this.register.toString(16)}]`);
      return 666;
    } finally {
      bus.close();
    }
  }
}
