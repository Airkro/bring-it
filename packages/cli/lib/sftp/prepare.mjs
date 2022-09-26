import { existsSync, readdirSync } from 'node:fs';

import slash from 'slash';

import { logger } from './logger.mjs';

export function checkSource(source) {
  if (!existsSync(source)) {
    logger.fail(slash(source), 'is not exists');
    process.exitCode = 1;

    return false;
  }

  if (readdirSync(source).length === 0) {
    logger.fail(slash(source), 'is empty');
    process.exitCode = 1;

    return false;
  }

  return true;
}
