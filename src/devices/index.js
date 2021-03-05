import { MCP23008Relay } from './mcp23008-relay.js';
import { HDC1080 } from './hdc1080.js';

const devices = { MCP23008Relay, HDC1080 };

export function createDevice(cfg) {
  return new devices[cfg.type](cfg);
}
