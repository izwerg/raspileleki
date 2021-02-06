const dev = process.env.NODE_ENV === 'development';

export const config = {
  ds18b20Interval: 1000,
  ds18b20Path: dev ? './src/stubs/ds18b20' : '/sys/bus/w1/devices/${id}/temperature',
};
