import { execFile, execFileSync } from 'node:child_process';
import { rm } from 'node:fs/promises';

import { ignore, Logger, readJSON } from '@bring-it/utils';
import { globby } from 'globby';

const logger = new Logger('sentry');

function commitHash() {
  return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
}

function readConfig(configName) {
  return readJSON(configName, logger);
}

function scan({ include }) {
  return globby(include, {
    ignore,
    gitignore: true,
    onlyFiles: true,
    dot: true,
  })
    .then((list) => list.filter((item) => /\.map$/.test(item)))
    .then((list) => list.sort());
}

export async function action({ mode }) {
  try {
    const { [mode]: current, ...all } = await readConfig(
      '.bring-it/sentry.config.json',
    );

    const {
      url,
      org,
      project,
      authToken,
      include = 'dist/**',
    } = {
      ...all,
      ...current,
    };

    const version = commitHash();

    // eslint-disable-next-line no-inner-declarations
    function cli(...args) {
      return execFile(
        'sentry-cli',
        ['releases', ...args, '--url', url, '--org', org, '--project', project],
        {
          env: {
            SENTRY_AUTH_TOKEN: authToken,
            SENTRY_LOG_LEVEL: 'debug',
          },
        },
      );
    }

    await cli('finalize', version);

    logger.info('uploading...');

    await cli(
      'files',
      version,
      'upload-sourcemaps',
      include,
      '--no-sourcemap-reference',
    );

    await cli('deploys', version, 'new', '-e', mode);

    const list = await scan({ include });

    for (const item of list) {
      rm(item, { force: true })
        .then(() => {
          logger.okay('[delete]', item);
        })
        .catch((error) => {
          logger.fail('[delete]', item, error.message);
        });
    }
  } catch (error) {
    logger.fail(error);
  }
}
