import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import { globbySync } from 'globby';

import { ignore } from '@bring-it/utils';

function checkTarget(pattern) {
  if (pattern.length === 0) {
    throw new Error('Error: no pattern input');
  }

  const list = globbySync(pattern, {
    dot: true,
    ignore,
  });

  if (list.length > 0) {
    console.log(list);

    return list;
  }

  throw new Error('Error: no files targeting');
}

export async function action({ pattern, name, dir }) {
  const target = checkTarget(pattern);

  const filename = resolve(process.cwd(), dir, name);

  try {
    execFileSync('ls', [dir]);
  } catch {
    execFileSync('mkdir', ['-p', dir]);
  }

  execFileSync('tar', ['-c', '-f', `${filename}.tar`, ...target]);

  execFileSync('tar', ['-c', '-f', `${filename}.tar.gz`, '-z', ...target]);

  execFileSync('zip', ['-r', '-FS', '-q', `${filename}.zip`, ...target]);
}
