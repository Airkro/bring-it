import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

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

  const filename = join(dir, name);

  try {
    execFileSync('ls', [dir]);
  } catch {
    execFileSync('mkdir', ['-p', dir]);
  }

  execFileSync('tar', ['-c', '-f', `${filename}.tar`, ...target]);

  execFileSync('tar', ['-c', '-f', `${filename}.tar.gz`, '-z', ...target]);

  execFileSync('zip', ['-r', '-q', `${filename}.zip`, ...target]);
}
