import fs from 'fs/promises';
import { interval } from 'rxjs';
import { distinct, exhaustMap, share } from 'rxjs/operators/index.js';

import { config } from '../config.js';
import { openBus } from './i2c.js';

export class Relay {
  constructor(address, register, mask) {
    this.address = address;
    this.register = register;
    this.mask = mask;
  }

  async read() {
    const bus = await openBus();
    const data = await bus.readByte(this.address, this.register);
    return !!(data & this.mask);
  }

  async write(state) {
    const bus = await openBus();
    const data = await bus.readByte(this.address, this.register);
    await bus.writeByte(this.address, this.register, state ? data | this.mask : data & ~this.mask);
  }

  state$ = interval(config.relayInterval)
    .pipe(
      exhaustMap(() => this.read()),
      distinct(),
      share(),
    );
}
