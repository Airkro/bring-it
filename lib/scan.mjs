import globby from 'globby';
import groupBy from 'lodash/groupBy.js';
import sortBy from 'lodash/sortBy.js';
import { join, parse } from 'path';
import slash from 'slash';

const order = [
  ['.svgz', '.svg'],
  ['.css'],
  ['.js'],
  ['.xhtml', '.html', '.htm'],
  ['.xml'],
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
  '**/.{cache,git,svn}/**',
  '**/.git{keep,ignore}',
  '**/node_modules/**',
];

export function scan(target, remote) {
  return globby('**', {
    cwd: target,
    ignore,
    onlyFiles: true,
    dot: true,
  })
    .then((files) => split(files))
    .then((groups) =>
      groups.map((files) =>
        files.map((file) => ({
          name: slash(file),
          local: slash(join(target, file)),
          remote: slash(join(remote, file)),
        })),
      ),
    );
}
