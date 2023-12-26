export const command = 'notify';

export const describe = 'Send releases notifications';

export function builder(cli) {
  cli.option('name', {
    alias: 'n',
    describe: 'notify name',
    default: 'noop',
    type: 'string',
  });
}

export function handler(io) {
  import('./action.mjs')
    .then(({ action }) => action(io))
    .catch((error) => {
      process.exitCode = 1;
      console.error(error);
    });
}
