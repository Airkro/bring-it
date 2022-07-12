import { readFile } from 'fs/promises';
import { dirname } from 'path';

import isUrl from 'is-url';
import semver from 'semver';
import validate from 'validate-npm-package-name';

import { getFileFromLastCommit, getLastCommitFiles } from './git.mjs';
import { logger } from './logger.mjs';
import { Exec } from './utils.mjs';

function readJSON(file) {
  return readFile(file, 'utf8')
    .then((raw) => JSON.parse(raw))
    .then(({ name, version, private: p = false, publishConfig }) => ({
      pkg: file,
      dir: dirname(file),
      name,
      version,
      private: p,
      publishConfig,
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
      if (error.stderr.startsWith('npm ERR! code E404\n')) {
        return '[]';
      }

      throw error;
    })
    .then((versions) => JSON.parse(versions))
    .then((versions) => (typeof versions === 'string' ? [versions] : versions));
}

function filter(pkg) {
  return (
    pkg &&
    pkg.name &&
    validate(pkg.name).validForNewPackages &&
    pkg.version &&
    semver.valid(pkg.version) &&
    !pkg.private &&
    pkg.publishConfig &&
    pkg.publishConfig.registry &&
    isUrl(pkg.publishConfig.registry) &&
    (pkg.name.startsWith('@') ? pkg.publishConfig.access === 'public' : true)
  );
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

    if (old?.version ? old.version !== item.version : true) {
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
