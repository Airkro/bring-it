import chalk from 'chalk';

const { red, cyan, green, yellow, magenta } = chalk;

const OKAY = green('[okay]');
const FAIL = red('[fail]');
const WARN = yellow('[warn]');

export class Logger {
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

  task(...message) {
    this.log('[task]', ...message);
  }

  info(...message) {
    this.log('[info]', ...message);
  }

  log(...message) {
    console.log(this.name, ...message);
  }
}

export const ignore = [
  '**/.{cache,git,svn,ssh,yarn}/**',
  '**/.{npm,yarn}rc',
  '**/.env.*',
  '**/.env',
  '**/.git{keep,ignore}',
  '**/{node,web}_modules/**',
  '**/*.{pem,ppk}',
  '**/id_{d,r}sa',
  '**/ssh*config',
  '**/sshd*config',
];
