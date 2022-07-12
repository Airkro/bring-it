import { action } from '../npm/action.mjs';

export const command = 'npm';

export const describe = 'Publish npm packages when needed';

export function builder(cli) {
  cli.option('preview', {
    describe: 'Preview mode',
    default: false,
    type: 'boolean',
  });
}

export function handler({ preview }) {
  action({ preview });
}
