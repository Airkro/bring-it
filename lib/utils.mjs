/* eslint-disable max-classes-per-file, promise/param-names */
import pkg from 'chalk';
import { existsSync, readdirSync } from 'fs';

const { red, cyan, green } = pkg;

class Timeout {
  set(ms = 60 * 1000 * 5) {
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

export async function withTimeout(action) {
  const timeout = new Timeout();

  return Promise.race([
    timeout.set(),
    action().then(() => {
      timeout.clear();
    }),
  ]);
}

export function checkSource(source, logger) {
  if (!existsSync(source)) {
    logger.fail(source, 'is not exists');
    process.exitCode = 1;
    return false;
  }

  if (readdirSync(source).length === 0) {
    logger.fail(source, 'is empty');
    process.exitCode = 1;
    return false;
  }

  return true;
}

export class Logger {
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
