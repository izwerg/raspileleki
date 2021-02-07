import pino from 'pino';
import { config } from '../config.js';

export const logger = pino({
  level: config.debug ? 'debug' : 'info',
  redact: { paths: ['hostname', 'pid'], remove: true },
  prettyPrint: {
    translateTime: 'yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
  },
});
