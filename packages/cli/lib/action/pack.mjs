import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

import { globbySync } from 'globby';

import { ignore } from '@bring-it/utils';

function checkTarget(pattern, cwd) {
  if (pattern.length === 0) {
    throw new Error('Error: no pattern input');
  }

  const list = globbySync(pattern, {
    dot: true,
    ignore,
    cwd,
  });

  if (list.length > 0) {
    console.log(list);

    return list;
  }

  throw new Error('Error: no files targeting');
}

export async function action({ pattern, name, dir, cwd }) {
  const target = checkTarget(pattern, cwd);

  const filename = resolve(process.cwd(), dir, name);

  try {
    execFileSync('ls', [dir]);
  } catch {
    execFileSync('mkdir', ['-p', dir]);
  }

  function exec(command, args) {
    execFileSync(command, args, { cwd });
  }

  exec('tar', ['-c', '-f', `${filename}.tar`, ...target]);

  exec('tar', ['-c', '-f', `${filename}.tar.gz`, '-z', ...target]);

  exec('zip', ['-r', '-FS', '-q', `${filename}.zip`, ...target]);
}
