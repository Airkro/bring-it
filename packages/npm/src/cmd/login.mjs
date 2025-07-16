import { execaSync } from 'execa';

import { logger } from '../lib/logger.mjs';

export const command = 'login';

export const describe = 'Auto login to npm';

export function builder(cli) {
  cli.option('cnb', {
    describe: 'CNB npm registry name',
    type: 'string',
    coerce: (value) => value.trim(),
    normalize: true,
    requiresArg: true,
    nargs: 1,
  });
}

function login({ name }) {
  execaSync(
    'pnpm',
    [
      'config',
      `'//npm.cnb.cool/${name}/-/packages/:_authToken'`,
      "'$CNB_TOKEN'",
      '--location',
      'project',
    ],
    {
      stdout: 'inherit',
      stderr: 'inherit',
      cwd: process.cwd(),
    },
  );
}

export function handler(io) {
  if (io.cnb) {
    const { $CNB_TOKEN: token } = process.env;

    if (token) {
      login({ name: io.cnb });
    } else {
      logger.error('Missing $CNB_TOKEN environment variable');

      process.exitCode = 1;
    }
  }
}
