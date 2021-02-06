import { arch } from 'os';

let bus;

export async function openBus(busNumber = 1) {
  if (bus) return bus;

  if (arch() === 'arm') { // raspberrypi
    const i2c = await import('i2c-bus');
    bus = await i2c.openPromisified(busNumber);
  }

  bus = { // i2c-bus mock
    readByte: (address, register) => 0b00001111,
  };

  return bus;
}
