import { execFile } from 'node:child_process';

import { ignore } from '@bring-it/utils';
import { globbySync } from 'globby';

export const command = 'pack [target...]';

export const describe = 'Pack files when support';

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

export function builder(cli) {
  cli
    .positional('target', {
      description: 'glob pattern of files or directories',
      coerce: checkTarget,
    })
    .default('target')
    .options({
      name: {
        alias: 'n',
        description: 'archive output file name',
        default: 'pack',
      },
    });
}

export function handler({ target = [], name }) {
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