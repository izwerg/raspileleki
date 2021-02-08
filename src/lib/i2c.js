import { arch } from 'os';

import { logger } from './logger.js';

const busMock = {
  0x27: [0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
};

export async function openBus(busNumber = 1) {
  let bus = { // i2c-bus mock
    readByte: async (address, register) => busMock[address][register],
    writeByte: async (address, register, value) => { busMock[address][register] = value; },
    i2cRead: async (address, length, buffer) => { for (let i = 0; i < length; i++) { buffer[i] = busMock[address][i]; } },
    i2cWrite: async (address, length, buffer) => { for (let i = 0; i < length; i++) { busMock[address][i] = buffer[i]; } },
    close: async () => null,
  };

  if (arch() === 'arm') { // raspberrypi
    const i2c = await import('i2c-bus');
    bus = await i2c.openPromisified(busNumber);
    logger.info(`Connected to I2C bus #${busNumber} for arch ${arch()}.`);
  } else {
    logger.info(`Mocked I2C bus #${busNumber} for arch ${arch()}.`);
  }

  return bus;
}
