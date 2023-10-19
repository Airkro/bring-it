import { execFileSync } from 'node:child_process';
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

function scan({ include, exclude }) {
  return globby(include, {
    ignore: [...ignore, ...exclude],
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

    const { auth, url, org, project, authToken, dsn, include, exclude } = {
      ...all,
      ...current,
    };

    const { default: SentryCli } = await import(
      /* webpackIgnore: true */ // eslint-disable-next-line import/no-unresolved
      '@sentry/cli'
    );

    const cli = new SentryCli('', {
      auth,
      dsn,
      url,
      org,
      project,
      authToken,
    }).releases;

    const version = commitHash();

    await cli.new(version);

    logger.info('uploading...');

    await cli.uploadSourceMaps(version, {
      include,
      ignoreFile: [...exclude, ...ignore],
      sourceMapReference: false,
    });

    await cli.newDeploy(version, { env: mode });

    await cli.finalize(version);

    const list = await scan({ include, exclude });

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
