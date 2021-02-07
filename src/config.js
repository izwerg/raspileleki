const dev = process.env.NODE_ENV === 'development';

export const config = {
  debug: true,
  relayInterval: 1000,
  ds18b20Id: '28-3c01d607e06a',
  ds18b20Interval: 1000,
  ds18b20Path: dev ? './src/stubs/ds18b20' : '/sys/bus/w1/devices/${id}/temperature',

  relays: [0x2700, 0x2701, 0x2702, 0x2703], // address + index
};
