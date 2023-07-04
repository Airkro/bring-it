import { action } from './npm/action.mjs';

export const command = 'npm';

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
    });
}

export function handler({ preview, force }) {
  action({ preview, force });
}
