export const command = 'sentry';

export const describe = 'Update sentry artifacts';

export function builder(cli) {
  cli.option('name', {
    alias: 'n',
    describe: 'deploy name',
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
