import { arch } from 'os';

const busMock = {
  0x27: [0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
};

export async function openBus(busNumber = 1) {
  let bus = { // i2c-bus mock
    readByte: async (address, register) => busMock[address][register],
    writeByte: async (address, register, value) => { busMock[address][register] = value; },
    readI2cBlock: async (address, offset, length, buffer) => { for (let i = 0; i < length; i++) { buffer[i] = busMock[address][i]; } },
    writeI2cBlock: async (address, offset, length, buffer) => { for (let i = 0; i < length; i++) { busMock[address][i] = buffer[i]; } },
    close: async () => null,
  };

  if (arch() === 'arm') { // raspberrypi
    const i2c = await import('i2c-bus');
    bus = await i2c.openPromisified(busNumber);
  }

  return bus;
}
