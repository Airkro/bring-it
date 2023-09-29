import { resolve } from 'node:path';

import { logger } from './logger.mjs';
import { Exec } from './utils.mjs';

function Git(...arg) {
  return Exec('git', arg);
}

async function doAction(condition, okay, fail) {
  if (await condition) {
    logger.okay(okay);

    return true;
  }

  logger.fail(fail);

  return false;
}

export async function packageManagerVersion(packageManager = 'npm') {
  return Exec(packageManager, ['-v']);
}

export function gitSupport() {
  return doAction(
    Git('--version').then(Boolean),
    'Git is ready',
    'Git is not installed',
  );
}

export function isGitDir() {
  return doAction(
    Git('rev-parse', '--is-inside-work-tree').then(
      (stdout) => stdout === 'true',
    ),
    'Current directory inside a git repo',
    'Current directory not inside a git repo',
  );
}

export function isGitRoot() {
  return doAction(
    Git('rev-parse', '--show-toplevel').then(
      (stdout) => resolve(stdout) === resolve(process.cwd()),
    ),
    'Current directory is the git root',
    'Current directory is not the git root',
  );
}

const pattern = [
  'M .npmrc',
  'MM .npmrc',
  'U .npmrc',
  'R .npmrc',
  'A .npmrc',
  '?? .npmrc',
];

export function isGitClean() {
  return doAction(
    Git('status', '--porcelain')
      .then((stdout) =>
        stdout
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line && !pattern.includes(line)),
      )
      .then((stdout) => {
        if (stdout.length === 0) {
          return true;
        }

        console.info(stdout.join('\n'));

        return false;
      }),
    'Current directory is a clean repo',
    'Current directory is not a clean repo',
  );
}

async function getCurrentBranch() {
  const branch = await Git('rev-parse', '--abbrev-ref', 'HEAD');

  if (branch === 'HEAD') {
    const io = await Git('name-rev', '--name-only', 'HEAD');

    return io.replace(/^remotes\/origin\//, '');
  }

  return branch;
}

const allowed = ['main', 'master', 'release'];

export async function branchCanRelease() {
  return doAction(
    getCurrentBranch().then((branch) => allowed.includes(branch)),
    `Current branch match \`${allowed.join('/')}\``,
    `Current branch not match \`${allowed.join('/')}\``,
  );
}

export function getFileContentFromLastCommit(filename) {
  return Git('show', `HEAD~1:${filename}`);
}

function getChangedPackageFiles() {
  return Git(
    'diff',
    'HEAD~1',
    'HEAD',
    '--name-only',
    '--ignore-blank-lines',
    '--ignore-cr-at-eol',
    '--ignore-space-at-eol',
    '--diff-filter=d',
    'package.json',
    '*/package.json',
  );
}

function getAllPackages() {
  return Git('ls-files', 'package.json', '*/package.json');
}

export async function getLastCommitFiles({ force }) {
  const io = Git('cat-file', '-t', 'HEAD~1').then(
    force ? getAllPackages : getChangedPackageFiles,
    getAllPackages,
  );

  const list = await io.then((raw) => (raw ? raw.split('\n') : []));

  for (const pkg of list) {
    logger.okay(force ? '[Forcing scan]' : '[Latest Modified]', pkg);
  }

  return list;
}
