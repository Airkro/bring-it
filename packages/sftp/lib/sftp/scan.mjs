import { join, parse } from 'node:path';

import { ignore } from '@bring-it/utils';
import { globby } from 'globby';
import groupBy from 'lodash/groupBy.js';
import sortBy from 'lodash/sortBy.js';
import slash from 'slash';

const order = [
  ['.svgz', '.svg'],
  ['.css'],
  ['.js', '.mjs', '.cjs'],
  ['.xhtml', '.html', '.htm'],
  ['.xml', '.json', '.yml', '.yaml'],
];

function split(files) {
  return sortBy(
    Object.entries(
      groupBy(files, (file) => {
        const { ext } = parse(file);
        const index = order.findIndex((groups) => groups.includes(ext));

        return index === -1 ? '' : index;
      }),
    ),
    ([index]) => index,
  ).map(([_, group]) => group);
}

export function scan({ CWD, path, include, exclude }) {
  return globby(include.split(','), {
    cwd: CWD,
    ignore: [...ignore, ...exclude.split(',')],
    onlyFiles: true,
    dot: true,
  })
    .then((files) => split(files))
    .then((groups) =>
      groups.map((files) =>
        files.map((file) => ({
          name: slash(file),
          local: slash(join(CWD, file)),
          remote: slash(join(path, file)),
        })),
      ),
    );
}
