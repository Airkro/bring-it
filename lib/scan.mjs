import { join, parse } from 'path';

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

const ignore = [
  '**/.{cache,git,svn,ssh,yarn}/**',
  '**/.{npm,yarn}rc',
  '**/.env.*',
  '**/.env',
  '**/.git{keep,ignore}',
  '**/{node,web}_modules/**',
  '**/*.{pem,ppk}',
  '**/id_{d,r}sa',
  '**/ssh*config',
  '**/sshd*config',
];

export function scan(dir, remote) {
  return globby('**', {
    cwd: dir,
    ignore,
    onlyFiles: true,
    dot: true,
  })
    .then((files) => split(files))
    .then((groups) =>
      groups.map((files) =>
        files.map((file) => ({
          name: slash(file),
          local: join(dir, file),
          remote: join(remote, file),
        })),
      ),
    );
}
