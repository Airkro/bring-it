import { resolve } from 'node:path';

import { readJSON } from '@bring-it/utils';

import { logger } from './utils.mjs';

function checkString(input, name) {
  if (typeof input !== 'string') {
    throw new TypeError(`${name} must be a string`);
  }
}

function checkArray(input, name, string = true) {
  if (!Array.isArray(input)) {
    throw new TypeError(`${name} must be an array`);
  }

  if (string) {
    input.forEach((item, index) => {
      checkString(item, `${name}[${index}]`);
    });
  }
}

export function mergeConfig(group) {
  checkArray(group, 'group', false);

  return group.map(
    (
      {
        title = '示例软件名称',
        version = 'v1.0',
        cwd = '.',
        pattern = ['.'],
        ignore = ['dist'],
        extensions = [
          ['js', 'cjs', 'mjs', 'jsx'],
          ['ts', 'cts', 'mts', 'tsx'],
          ['wxs', 'qs'],
          ['html', 'htm', 'xhtml', 'xml', 'svg', 'vue'],
          ['css', 'less', 'scss', 'sass'],
          ['wxss', 'qss', 'ttss', 'jxss', 'acss'],
        ].flat(),
      },
      index,
    ) => {
      checkString(title, `group[${index}].title`);
      checkString(version, `group[${index}].version`);
      checkString(cwd, `group[${index}].cwd`);
      checkArray(pattern, `group[${index}].pattern`);
      checkArray(extensions, `group[${index}].extensions`);
      checkArray(ignore, `group[${index}].ignore`);

      return {
        title,
        version,
        cwd: resolve(process.cwd(), cwd),
        pattern,
        extensions,
        ignore,
      };
    },
  );
}

export function readConfig(configName) {
  return readJSON(configName, logger).then(({ group = [{}] }) =>
    mergeConfig(group),
  );
}
