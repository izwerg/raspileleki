import fs from 'fs/promises';
import { interval } from 'rxjs';
import { distinct, exhaustMap, share } from 'rxjs/operators/index.js';

import { config } from '../config.js';
import { logger } from './logger.js';

const IODIR = 0x00; // MCP23008 I/O DIRECTION (IODIR) REGISTER
const GPIO = 0x09; // MCP23008 PORT (GPIO) REGISTER

export class Relay {
  constructor(bus, id) {
    this.bus = bus;
    this.address = (id >> 8) & 0xff;
    this.index = id & 0xff;
    this.mask = 1 << this.index;
  }

  async init() {
    if (this.initialized) return;
    const data = await bus.readByte(this.address, IODIR);
    await bus.writeByte(this.address, IODIR, data & ~this.mask);
    this.initialized = true;
  }

  async read() {
    await this.init();
    const data = await bus.readByte(this.address, GPIO);
    logger.debug(`Relay[${this.index}].read: 0x${data.toString(16)} -> ${!(data & this.mask)}.`);
    return !(data & this.mask);
  }

  async write(state) {
    await this.init();
    const data = await bus.readByte(this.address, GPIO);
    const value = state ? data & ~this.mask : data | this.mask;
    await bus.writeByte(this.address, GPIO, value);
    logger.debug(`Relay[${this.index}].write: 0x${value.toString(16)} -> ${state}`);
  }

  state$ = interval(config.relayInterval)
    .pipe(
      exhaustMap(() => this.read()),
      distinct(),
      share(),
    );
}
