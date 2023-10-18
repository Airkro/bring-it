import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

import { Logger } from '@bring-it/utils';

const logger = new Logger('sentry');

function commitHash() {
  return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
}

function readConfig(configName) {
  return readFile(configName, 'utf8')
    .then((text) => JSON.parse(text))
    .catch((error) => {
      logger.warn(error.message);
      logger.info('Fallback to default configuration');

      return {};
    });
}

export async function action({ config, mode }) {
  const { '*': all, [mode]: current } = await readConfig(config);

  const { url, org, project, authToken, globs } = { ...all, ...current };

  const io = {
    url,
    org,
    project,
    authToken,
    globs,
    release: {
      name: commitHash(),
      deploy: {
        env: mode,
      },
    },
  };

  console.log(io);
}
