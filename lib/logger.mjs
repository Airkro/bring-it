import chalk from 'chalk';

const { red, cyan, green } = chalk;

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
