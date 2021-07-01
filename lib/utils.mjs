/* eslint-disable promise/param-names */
import { existsSync, readdirSync } from 'fs';

import chalk from 'chalk';
import slash from 'slash';

export const { red, cyan, green, gray } = chalk;

class Logger {
  constructor() {
    this.name = cyan('[bring-it]');
    this.OKAY = green('[okay]');
    this.FAIL = red('[fail]');
  }

  okay(...message) {
    this.log(this.OKAY, ...message);
  }

  fail(...message) {
    this.log(this.FAIL, ...message);
  }

  info(...message) {
    this.log('[info]', ...message);
  }

  log(key, ...message) {
    console.log(this.name, key, ...message);
  }
}

export const logger = new Logger();

class Timeout {
  set(ms) {
    return new Promise((_, reject) => {
      this.mark = setTimeout(() => {
        reject(new Error('timeout...'));
      }, ms);
    });
  }

  clear() {
    clearTimeout(this.mark);
  }
}

export async function withTimeout(action, ms = 60 * 1000 * 5) {
  const timeout = new Timeout();

  return Promise.race([
    timeout.set(ms),
    action().then(() => {
      timeout.clear();
    }),
  ]);
}

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

export function description(string, label) {
  return `${gray(`${label}:`)} ${string}`;
}
