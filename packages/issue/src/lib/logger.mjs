import { Logger } from '@bring-it/utils';

// Reuse the branded `[bring-it:issue]` prefix, but route every diagnostic
// message to stderr so the generated issue link stays the only thing on
// stdout (the command is meant to be piped into `gh` or copied directly).
const base = new Logger('issue');

export const logger = {
  get name() {
    return base.name;
  },
  log(...message) {
    console.error(base.name, ...message);
  },
  info(...message) {
    console.error(base.name, '[info]', ...message);
  },
  warn(...message) {
    console.error(base.name, '[warn]', ...message);
  },
  okay(...message) {
    console.error(base.name, '[okay]', ...message);
  },
  fail(...message) {
    console.error(base.name, '[fail]', ...message);
  },
};
