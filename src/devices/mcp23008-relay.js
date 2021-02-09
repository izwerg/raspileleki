import { interval as rxInterval } from 'rxjs';
import { distinctUntilChanged, exhaustMap, share } from 'rxjs/operators/index.js';

import { openBus } from '../lib/i2c.js';

const IODIR = 0x00; // MCP23008 I/O DIRECTION (IODIR) REGISTER
const GPIO = 0x09; // MCP23008 PORT (GPIO) REGISTER

export class Mcp23008Relay {
  constructor({ id, interval = 1000 }) {
    this.address = (id >> 8) & 0xff;
    this.index = id & 0xff;
    this.mask = 1 << this.index;
    this.interval = interval;

    this.state$ = rxInterval(this.interval)
      .pipe(
        exhaustMap(() => this.read()),
        distinctUntilChanged(),
        share(),
      );
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
      await bus.readI2cBlock(this.address, 0, buf.length, buf);

      buf[IODIR] = buf[IODIR] & ~this.mask; // switch GPIO to write mode
      buf[GPIO] = state ? buf[GPIO] | this.mask : buf[GPIO] & ~this.mask;

      await bus.writeI2cBlock(this.address, 0, buf.length, buf);
    } finally {
      bus.close();
    }
  }
}
