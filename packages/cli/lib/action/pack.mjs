import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { ignore as defaultIgnore } from '@bring-it/utils';
import { globbySync } from 'globby';

function checkTarget(pattern, cwd, ignore) {
  if (pattern.length === 0) {
    throw new Error('Error: no pattern input');
  }

  const list = globbySync(pattern, {
    dot: true,
    ignore: ignore ? defaultIgnore : [],
    cwd,
  });

  if (list.length > 0) {
    console.log(list);

    return list;
  }

  throw new Error('Error: no files targeting');
}

export async function action({ pattern, name, dir, cwd, ignore }) {
  const target = checkTarget(pattern, cwd, ignore);

  const filename = resolve(process.cwd(), dir, name);

  try {
    execFileSync('ls', [dir]);
  } catch {
    mkdirSync(dir, { recursive: true });
  }

  function exec(command, args) {
    execFileSync(command, args, { cwd });
  }

  exec('tar', ['-c', '-f', `${filename}.tar`, ...target]);

  exec('tar', ['-c', '-f', `${filename}.tar.gz`, '-z', ...target]);

  exec('zip', ['-r', '-FS', '-q', `${filename}.zip`, ...target]);
}
