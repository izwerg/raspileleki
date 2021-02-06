import fs from 'fs/promises';

export class Ds18b20 {
  constructor(id) {
    this.id = id;
  }

  async read() {
    return fs.readFile(`/sys/bus/w1/devices/${this.id}/temperature`);
  }
}

const sensor = new Ds18b20('28-3c01d607e06a');

const temp = await sensor.read();

console.log('tmp', temp);
