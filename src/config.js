const dev = process.env.NODE_ENV === 'development';

export const config = {
  debug: true,
  ds18b20Path: dev ? './src/stubs/ds18b20' : '/sys/bus/w1/devices/${id}/temperature',

  tempSensor: { type: 'Ds18b20', id: '28-3c01d607e06a', r: 1000 },
  tempRelay: { type: 'Mcp23008Relay', id: 0x2700, interval: 1000 },
  tempMin: 27,
  tempMax: 27.5,
};
