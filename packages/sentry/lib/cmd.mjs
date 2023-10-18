import { action } from './utils.mjs';

export const command = 'sentry';

export const describe = 'Update sentry artifacts';

export function builder(cli) {
  cli
    .option('config', {
      alias: 'c',
      describe: 'Config file path',
      default: '.bring-it/sentry.config.json',
      type: 'string',
    })
    .option('mode', {
      alias: 'm',
      describe: 'deploy mode',
      default: 'noop',
      type: 'string',
    });
}

export function handler(io) {
  action(io).catch(console.error);
}
