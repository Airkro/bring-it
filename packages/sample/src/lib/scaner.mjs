import { extname, join } from 'node:path';

import { ignore as defaultIgnore } from '@bring-it/utils';
import { globby } from 'globby';

import { logger } from './utils.mjs';

const ignore = [
  ...defaultIgnore,
  '**/.{gitattributes,gitkeep}',
  '**/.*ignore',
  '**/.best-shot/**',
  '**/.bring-it/**',
  '**/.editorconfig',
  '**/.github/**',
  '**/.npmrc',
  '**/*.env.*',
  '**/*.env',
  '**/dist/**',
  '**/License.*',
  '**/License',
  '**/package-lock.json',
  '**/pnpm-lock.yaml',
  '**/yarn.lock',
];

function find(key, config) {
  const patterns = config[key];

  return patterns.length > 0
    ? globby(patterns, {
        cwd: config.cwd,
        ignore: [...ignore, ...config.ignore],
        gitignore: true,
        onlyFiles: true,
        dot: true,
        caseSensitiveMatch: false,
      })
        .then((list) =>
          config.extensions.length > 0
            ? list.filter((item) => config.extensions.includes(extname(item)))
            : list,
        )
        .then((list) => list.sort())
        .then((list) => {
          for (const item of list) {
            logger.log(`[${key}]`, item);
          }

          return list;
        })
    : [];
}

export async function scaner(config) {
  const prologue = await find('prologue', config);
  const epilogue = await find('epilogue', config);
  const patterns = await find('patterns', config) //
    .then((list) =>
      list.filter(
        (item) => !prologue.includes(item) && !epilogue.includes(item),
      ),
    );

  function wrapper(list) {
    return list.map((name) => ({
      name,
      path: join(config.cwd, name),
    }));
  }

  return {
    prologue: wrapper(prologue),
    epilogue: wrapper(epilogue),
    patterns: wrapper(patterns),
  };
}
