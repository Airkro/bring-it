import { action } from './lib/sample.mjs';

export const command = 'sample';

export const describe = 'Generate code sample files';

export function builder(cli) {
  cli.option('config', {
    describe: 'Config file path',
    default: '.bring-it/sample.config.json',
    type: 'string',
  });
}

export function handler(io) {
  action(io).catch(console.error);
}
