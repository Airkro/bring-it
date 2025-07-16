export const command = 'publish';

export const describe = 'Publish npm packages when needed';

export function builder(cli) {
  cli
    .option('preview', {
      alias: 'p',
      describe: 'Preview mode',
      default: false,
      type: 'boolean',
    })
    .option('force', {
      alias: 'f',
      describe: 'Skip branch checking',
      default: false,
      type: 'boolean',
    })
    .option('provenance', {
      describe: 'Packages with provenance',
      default: false,
      type: 'boolean',
    });
}

export function handler(io) {
  import('../lib/action.mjs')
    .then(({ action }) => action(io))
    .catch((error) => {
      process.exitCode = 1;
      console.error(error);
    });
}
