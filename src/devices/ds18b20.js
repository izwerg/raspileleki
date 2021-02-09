import fs from 'fs/promises';
import { interval as rxInterval } from 'rxjs';
import { distinctUntilChanged, exhaustMap, share } from 'rxjs/operators/index.js';

import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export class Ds18b20 {
  constructor({ id, interval = 1000 }) {
    this.id = id;
    this.interval = interval;
    this.path = config.ds18b20Path.replace('${id}', this.id);

    this.temperature$ = rxInterval(this.interval)
      .pipe(
        exhaustMap(_ => this.read()),
        distinctUntilChanged(),
        share(),
      );
  }

  async read() {
    const data = await fs.readFile(this.path, { encoding: 'utf8' });
    return parseInt(data) / 1000;
  }
}
