import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { filter } from './filter.mjs';
import {
  getFileContentFromLastCommit,
  getLastCommitFiles,
  packageManagerVersion,
} from './git.mjs';
import { logger } from './logger.mjs';
import { readNpmToken } from './token.mjs';

function readJSON(file) {
  return readFile(file, 'utf8')
    .then((raw) => JSON.parse(raw))
    .then(
      ({
        name,
        version,
        private: p = false,
        engines,
        publishConfig,
        packageManager = 'npm',
      }) => ({
        pkg: file,
        dir: dirname(file),
        name,
        version,
        private: p,
        publishConfig,
        engines,
        packageManager: packageManager.split('@')[0],
      }),
    )
    .catch(() => false);
}

function getVersions(name, registry, token = '') {
  fetch(new URL(name, registry).href, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 401) {
          const NPM_TOKEN = await readNpmToken();

          return getVersions(name, registry, NPM_TOKEN);
        }

        return [];
      }

      return response.json();
    })
    .then((data) => Object.keys(data.versions))
    .catch(() => {
      logger.warn('[Fail to list version]', name);

      return [];
    });
}

async function publishReady(list) {
  const io = [];

  for (const item of list) {
    const okay = await readJSON(item);

    const version = await packageManagerVersion(okay.packageManager);

    if (okay && filter(okay, { packageManager: { version } })) {
      io.push(okay);
      logger.okay('[Publish Allowed]', okay.name);
    }
  }

  return io;
}

async function versionChanged(list) {
  const io = [];

  for (const item of list) {
    const old = await getFileContentFromLastCommit(item.pkg)
      .then((raw) => JSON.parse(raw))
      .catch(() => false);

    if (!old) {
      io.push(item);
      logger.okay('[First commit]', item.pkg);
    } else if (old?.version ? old.version !== item.version : true) {
      io.push(item);
      logger.okay('[Version changed]', item.pkg);
    }
  }

  return io;
}

async function publishable(list) {
  const io = [];

  for (const item of list) {
    // TODO
    if (item.publishConfig.registry.includes('registry.npmjs.org')) {
      const versions = await getVersions(
        item.name,
        item.publishConfig.registry,
      );

      if (versions && !versions.includes(item.version)) {
        io.push(item);
        logger.okay('[Not publish yet]', item.name);
      } else {
        logger.info('[Published, skip]', item.name);
      }
    } else {
      io.push(item);
      logger.okay('[May publishable]', item.name);
    }
  }

  return io;
}

export async function scan({ force }) {
  logger.task('Scanning all package.json...');

  try {
    const list1 = await getLastCommitFiles({ force });
    const list2 = await publishReady(list1);
    const list3 = force ? list2 : await versionChanged(list2);
    const list4 = await publishable(list3);
    logger.info(
      list4.length > 0 ? list4.length : 'No',
      list4.length === 1 ? 'package' : 'packages',
      'need to publish',
    );

    return list4;
  } catch (error) {
    logger.fail('Scanning failed');
    logger.fail(error.message);

    return [];
  }
}
