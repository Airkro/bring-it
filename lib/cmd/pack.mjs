import { execFile } from 'child_process';

import { globbySync } from 'globby';

import { ignore } from '../utils/ignore.mjs';

export const command = 'pack [target]';

export const describe = 'Pack files when support';

function paramsError(message) {
  throw new Error(`Error: ${message}`);
}

function checkTarget(pattern) {
  const list = globbySync(pattern, {
    dot: true,
    ignore,
  });

  if (list.length > 0) {
    return pattern;
  }

  paramsError('no files targeting');
}

export function builder(cli) {
  cli
    .positional('target', {
      description: 'glob pattern of files or directories',
      coerce: checkTarget,
    })
    .options({
      name: {
        alias: 'n',
        description: 'archive output file name',
        default: 'pack',
      },
    });
}

export function handler({ target, name }) {
  execFile('zip', ['-r', '-q', `${name}.zip`, target], (error) => {
    if (error) {
      paramsError(error.message);
    }
  });

  execFile(
    'tar',
    ['-c', '-f', `${name}.tar`, '--wildcards', target],
    (error) => {
      if (error) {
        paramsError(error.message);
      }
    },
  );

  execFile(
    'tar',
    ['-c', '-f', `${name}.tar.gz`, '-z', '--wildcards', target],
    (error) => {
      if (error) {
        paramsError(error.message);
      }
    },
  );
}
