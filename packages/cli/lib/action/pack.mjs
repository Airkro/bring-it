import { execFile } from 'node:child_process';

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
    return pattern;
  }

  throw new Error('Error: no files targeting');
}

export async function action({ pattern, name }) {
  const target = checkTarget(pattern);

  let io;

  execFile('tar', ['-c', '-f', `${name}.tar`, ...target], (error) => {
    if (error) {
      io = error;
    }
  });

  execFile('tar', ['-c', '-f', `${name}.tar.gz`, '-z', ...target], (error) => {
    if (error) {
      io = error;
    }
  });

  execFile('zip', ['-r', '-q', `${name}.zip`, ...target], (error) => {
    if (error) {
      io = error;
    }
  });

  if (io) {
    throw new Error(`Error: ${io.message}`);
  }
}
