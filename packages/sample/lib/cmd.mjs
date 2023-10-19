export const command = 'sample';

export const describe = 'Generate code sample files';

export function builder(cli) {
  cli.option('config', {
    alias: 'c',
    describe: 'Config file path',
    default: '.bring-it/sample.config.json',
    type: 'string',
  });
}

export function handler(io) {
  import('./lib/sample.mjs')
    .then(({ action }) => action(io))
    .catch(console.error);
}
