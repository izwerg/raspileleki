const dev = process.env.NODE_ENV === 'development';

export const config = {
  debug: true,

  tempSensor: { type: 'HDC1080', id: 0x4000, interval: 5000 },
  tempRelay: { type: 'MCP23008Relay', id: 0x2700, interval: 5000 },
  humidSensor: { type: 'HDC1080', id: 0x4001, interval: 5000 },
  tempMin: 27.0,
  tempMax: 27.3,

  sensorsPath: `/run/user/1000/raspileleki-sensors.json`,
};
