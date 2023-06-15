import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { logger } from './utils.mjs';

export function mergeConfig(configs) {
  return configs.map(
    ({
      cwd = '.',
      pattern = ['.'],
      extensions = [
        ['js', 'cjs', 'mjs', 'jsx'],
        ['ts', 'cts', 'mts', 'tsx'],
        ['wxs', 'qs'],
        ['html', 'htm', 'xhtml', 'xml', 'svg', 'vue'],
        ['css', 'less', 'scss', 'sass'],
        ['wxss', 'qss', 'ttss', 'jxss', 'acss'],
      ].flat(),
      ignore = ['dist'],
      title = '示例软件名称',
      version = 'v1.0',
    }) => ({
      title,
      version,
      cwd: resolve(process.cwd(), cwd),
      pattern,
      extensions,
      ignore,
    }),
  );
}

export function readConfig(configName) {
  return readFile(configName, 'utf8')
    .then((text) => JSON.parse(text))
    .catch((error) => {
      logger.warn(error.message);
      logger.info('Fallback to default configuration');

      return [{}];
    })
    .then(mergeConfig);
}
