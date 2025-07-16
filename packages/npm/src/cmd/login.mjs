import { spawnSync } from 'node:child_process';

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

function login({ name, token }) {
  const content = `//npm.cnb.cool/${name}/-/packages/:_authToken=${token}`;

  spawnSync('echo', [content, ' >> .npmrc'], {
    cwd: process.cwd(),
    shell: true,
  });
}

export function handler(io) {
  if (io.cnb) {
    const { CNB_TOKEN: token } = process.env;

    if (token) {
      login({ name: io.cnb, token });
    } else {
      logger.fail('Missing $CNB_TOKEN environment variable');

      process.exitCode = 1;
    }
  }
}
