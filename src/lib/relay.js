import fs from 'fs/promises';
import { interval } from 'rxjs';
import { distinct, exhaustMap, share } from 'rxjs/operators/index.js';

import { config } from '../config.js';
import { openBus } from './i2c.js';
import { logger } from './logger.js';

export class Relay {
  constructor(id) {
    this.address = (id >> 16) & 0xff;
    this.register = (id >> 8) & 0xff;
    this.index = id & 0xff;
    this.mask = 1 << this.index;
  }

  async read() {
    const bus = await openBus();
    const data = await bus.readByte(this.address, this.register);
    logger.debug(`Relay[${this.index}].read: 0x${data.toString(16)} -> ${!(data & this.mask)}.`);
    return !(data & this.mask);
  }

  async write(state) {
    const bus = await openBus();
    const data = await bus.readByte(this.address, this.register);
    const value = state ? data & ~this.mask : data | this.mask;
    await bus.writeByte(this.address, this.register, value);
    logger.debug(`Relay[${this.index}].write: 0x${value.toString(16)} -> ${state}`);
  }

  state$ = interval(config.relayInterval)
    .pipe(
      exhaustMap(() => this.read()),
      distinct(),
      share(),
    );
}
