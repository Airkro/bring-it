import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { filter } from './filter.mjs';
import { getFileFromLastCommit, getLastCommitFiles } from './git.mjs';
import { logger } from './logger.mjs';
import { Exec } from './utils.mjs';

function readJSON(file) {
  return readFile(file, 'utf8')
    .then((raw) => JSON.parse(raw))
    .then(({ name, version, private: p = false, engines, publishConfig }) => ({
      pkg: file,
      dir: dirname(file),
      name,
      version,
      private: p,
      publishConfig,
      engines,
    }))
    .catch(() => false);
}

function getVersions(name, registry) {
  return Exec('npm', [
    'view',
    name,
    '--json',
    'versions',
    '--registry',
    registry,
  ])
    .catch((error) => {
      if (error.stderr && error.stderr.startsWith('npm ERR! code E404\n')) {
        logger.warn('[Fail to list version]', name);

        return '[]';
      }

      throw error;
    })
    .then((versions) => JSON.parse(versions))
    .then((versions) => (typeof versions === 'string' ? [versions] : versions))
    .catch(() => []);
}

async function publishReady(list) {
  const io = [];

  for (const item of list) {
    const okay = await readJSON(item);

    if (okay && filter(okay)) {
      io.push(okay);
      logger.okay('[Publish Allowed]', okay.name);
    }
  }

  return io;
}

async function versionChanged(list) {
  const io = [];

  for (const item of list) {
    const old = await getFileFromLastCommit(item.pkg)
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
    const verions = await getVersions(item.name, item.publishConfig.registry);

    if (verions && !verions.includes(item.version)) {
      io.push(item);
      logger.okay('[Not publish yet]', item.name);
    } else {
      logger.info('[Published, skip]', item.name);
    }
  }

  return io;
}

export async function scan() {
  logger.info('Scanning all package.json...');

  try {
    const list1 = await getLastCommitFiles();
    const list2 = await publishReady(list1);
    const list3 = await versionChanged(list2);
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
