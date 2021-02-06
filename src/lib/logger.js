import pino from 'pino';

export const logger = pino({
  redact: { paths: ['hostname', 'pid'], remove: true },
  prettyPrint: {
    translateTime: 'yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
  },
});
