import { arch } from 'os';

import { logger } from './logger.js';

let bus;

export async function openBus(busNumber = 1) {
  if (bus) return bus;

  const regMocks = { 0x00: 0xff };

  bus = { // i2c-bus mock
    readByte: async (address, register) => regMocks[register],
    writeByte: async (address, register, value) => { regMocks[register] = value; },
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
