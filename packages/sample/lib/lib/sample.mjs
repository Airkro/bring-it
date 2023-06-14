import { ignore as defaultIgnore } from '@bring-it/utils';
import { globby } from 'globby';

import { readConfig } from './config.mjs';
import { pdf } from './pdf.mjs';
import { picker } from './picker.mjs';

function scan(config) {
  return globby(config.pattern, {
    cwd: config.cwd,
    ignoreFiles: [...defaultIgnore, ...config.ignore],
    gitignore: true,
    onlyFiles: true,
    dot: true,
  }).then((list) => list.sort());
}

export async function action({ config: configName }) {
  const configs = await readConfig(configName);

  for (const config of configs) {
    const files = await scan(config);
    const code = await picker(files);

    await pdf(code, config);
  }
}
