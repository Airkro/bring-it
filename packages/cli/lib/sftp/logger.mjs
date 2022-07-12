import chalk from 'chalk';

const { red, cyan, green, yellow, magenta } = chalk;

const OKAY = green('[okay]');
const FAIL = red('[fail]');
const WARN = yellow('[warn]');

class Logger {
  constructor(name) {
    this.name = `[${cyan('bring-it')}:${magenta(name)}]`;
  }

  okay(...message) {
    this.log(OKAY, ...message);
  }

  fail(...message) {
    this.log(FAIL, ...message);
  }

  warn(...message) {
    this.log(WARN, ...message);
  }

  info(...message) {
    this.log('[info]', ...message);
  }

  log(...message) {
    console.log(this.name, ...message);
  }
}

export const logger = new Logger('sftp');
