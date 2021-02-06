import fs from 'fs/promises';
import { interval } from 'rxjs';
import { exhaustMap, share } from 'rxjs/operators/index.js';

import { config } from '../config.js';

export class Ds18b20 {
  constructor(id) {
    this.id = id;
    this.path = config.ds18b20Path.replace('${id}', this.id);
  }

  async read() {
    const data = await fs.readFile(this.path, { encoding: 'utf8' });
    return parseInt(data) / 1000;
  }

  get temperature$() {
    return interval(config.ds18b20Interval)
    .pipe(
      exhaustMap(_ => this.read()),
      share(),
    );
  }
}
