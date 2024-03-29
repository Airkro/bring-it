import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { globby } from 'globby';

import { ignore as defaultIgnore } from '@bring-it/utils';

import { logger } from './utils.mjs';

const lineBreak = /(\r\n|\n|\r)+/;
const lineBreakAll = /^(\r\n|\n|\r)+$/;

function read(file, config) {
  return readFile(join(config.cwd, file), 'utf8');
}

export async function picker(lists, config) {
  const io = [];

  for (const file of lists) {
    if (io.length < 3050) {
      await read(file, config)
        .then((code) =>
          code
            .split(lineBreak)
            .filter((line) => !lineBreakAll.test(line))
            .filter((line) => !/\s*\/\//.test(line)),
        )
        .then((lines) => {
          io.push(...lines);
          logger.okay(file);
        })
        .catch((error) => {
          logger.fail(file);
          throw error;
        });
    } else {
      break;
    }
  }

  return io.join('\n').trim();
}

export function scan(config) {
  return globby(config.pattern, {
    cwd: config.cwd,
    ignore: [...defaultIgnore, ...config.ignore],
    gitignore: true,
    onlyFiles: true,
    dot: true,
    caseSensitiveMatch: false,
    expandDirectories: {
      extensions: config.extensions,
    },
  })
    .then((list) => list.sort())
    .then((list) => {
      for (const item of list) {
        logger.file(item);
      }

      return list;
    });
}
