/* eslint-disable max-classes-per-file, promise/param-names */
const { red, cyan, green } = require('chalk');

class Timeout {
  set(ms = 60 * 1000) {
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

async function withTimeout(action) {
  const timeout = new Timeout();

  return Promise.race([
    timeout.set(),
    action().then(() => {
      timeout.clear();
    }),
  ]);
}

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

module.exports = {
  Logger,
  withTimeout,
};
