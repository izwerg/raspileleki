const dev = process.env.NODE_ENV === 'development';

export const config = {
  debug: true,
  relayInterval: 1000,
  ds18b20Id: '28-3c01d607e06a',
  ds18b20Interval: 1000,
  ds18b20Path: dev ? './src/stubs/ds18b20' : '/sys/bus/w1/devices/${id}/temperature',

  relays: [0x270000, 0x270001, 0x270002, 0x270003], // address + register + index
};
