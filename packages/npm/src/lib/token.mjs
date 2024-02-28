import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

import ini from 'ini';

function readFromPath(base) {
  return readFile(join(base, '.npmrc'), 'utf8').then(ini.parse);
}

export function readNpmToken(registry = 'https://registry.npmjs.org/') {
  return Promise.allSettled([
    readFromPath(homedir()),
    readFromPath(process.cwd()),
  ])
    .then(([globalConfig, localConfig]) => ({
      ...globalConfig.value,
      ...localConfig.value,
    }))
    .then((data) => {
      const { host, pathname } = new URL(registry);

      return data[`//${host + pathname}:_authToken`];
    })
    .catch(() => {});
}
