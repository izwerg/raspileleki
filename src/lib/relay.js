import { interval } from 'rxjs';
import { distinct, exhaustMap, share } from 'rxjs/operators/index.js';

import { config } from '../config.js';
import { logger } from './logger.js';
import { openBus } from './i2c.js';

const IODIR = 0x00; // MCP23008 I/O DIRECTION (IODIR) REGISTER
const GPIO = 0x09; // MCP23008 PORT (GPIO) REGISTER

export class Relay {
  constructor(id) {
    this.address = (id >> 8) & 0xff;
    this.index = id & 0xff;
    this.mask = 1 << this.index;
  }

  async read() {
    const bus = await openBus();
    try {
      const data = await bus.readByte(this.address, GPIO);
      return !!(data & this.mask);
    } finally {
      bus.close();
    }
  }

  async write(state) {
    const bus = await openBus();
    try {
      const buf = Buffer.alloc(10);
      await bus.i2cRead(this.address, buf.length, buf);

      buf[IODIR] = buf[IODIR] & ~this.mask; // switch GPIO to write mode
      buf[GPIO] = state ? buf[GPIO] | this.mask : buf[GPIO] & ~this.mask;

      await bus.i2cWrite(this.address, buf.length, buf);
    } finally {
      bus.close();
    }
  }

  state$ = interval(config.relayInterval)
    .pipe(
      exhaustMap(() => this.read()),
      distinct(),
      share(),
    );
}
