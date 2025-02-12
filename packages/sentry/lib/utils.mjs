import { execFileSync } from 'node:child_process';
import { rm } from 'node:fs/promises';

import { ignore, Logger, readConfig } from '@bring-it/utils';
import spawn from '@npmcli/promise-spawn';
import { globby } from 'globby';

const logger = new Logger('sentry');

function commitHash() {
  return execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
}

function scan({ include }) {
  return globby(include, {
    ignore,
    onlyFiles: true,
    dot: true,
  })
    .then((list) => list.filter((item) => /\.map$/.test(item)))
    .then((list) => list.sort());
}

function createCli({ url, org, project, token }) {
  return function cli(...args) {
    return spawn('sentry-cli', ['releases', ...args], {
      stdio: 'inherit',
      env: {
        ...process.env,
        SENTRY_AUTH_TOKEN: token,
        SENTRY_URL: url,
        SENTRY_ORG: org,
        SENTRY_PROJECT: project,
        SENTRY_LOG_LEVEL: 'info',
      },
    }).then((io) => {
      if (io.stderr) {
        throw new Error('Command failed');
      }
    });
  };
}

export async function action({ name }) {
  try {
    const { [name]: current, ...all } = await readConfig('sentry', logger);

    const {
      url,
      org,
      project,
      token,
      include = 'dist/**',
    } = {
      ...all,
      ...current,
    };

    logger.json({
      url,
      org,
      project,
      name,
      include,
    });

    logger.task('scanning...');

    const list = await scan({ include });

    logger.info('found', list.length, 'files');

    for (const item of list) {
      logger.file(item);
    }

    if (list.length > 0) {
      const version = commitHash();

      logger.info('git commit hash', version);

      const cli = createCli({ url, org, project, token });

      logger.task('create release...');

      await cli('new', version);

      logger.okay('release created');

      logger.task('uploading...');

      const mode = process.env.BRANCH_NAME;

      await cli(
        'files',
        version,
        'upload-sourcemaps',
        include,
        '--dist',
        name,
        '--note',
        JSON.stringify({ name, mode }),
        '--no-sourcemap-reference',
        '--no-rewrite',
      );

      logger.okay('uploaded');

      logger.task('deploys', mode);

      await cli('deploys', version, 'new', '-e', mode, '-n', name);

      await cli('set-commits', '--local', version, '--ignore-missing');

      logger.task('finalize...');

      await cli('finalize', version);

      logger.okay('finalized');

      logger.task('delete files...');

      for (const item of list) {
        await rm(item, { force: true })
          .then(() => {
            logger.okay('[delete]', item);
          })
          .catch((error) => {
            logger.fail('[delete]', item, error.message);
          });
      }

      logger.okay('done');
    }
  } catch (error) {
    logger.fail(error.message);
  }
}
