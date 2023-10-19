export const command = 'sentry';

export const describe = 'Update sentry artifacts';

export function builder(cli) {
  cli.option('mode', {
    alias: 'm',
    describe: 'deploy mode',
    default: 'noop',
    type: 'string',
  });
}

export function handler(io) {
  import('./utils.mjs')
    .then(({ action }) => action(io))
    .catch((error) => {
      process.exitCode = 1;
      console.error(error);
    });
}
