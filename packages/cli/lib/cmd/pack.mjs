export const command = 'pack [pattern...]';

export const describe = 'Pack files when support';

export function builder(cli) {
  cli
    .positional('pattern', {
      description: 'glob pattern of files or directories',
    })
    .options({
      name: {
        alias: 'n',
        description: 'archive output file name',
        default: 'pack',
      },
      dir: {
        alias: 'd',
        description: 'archive output path name',
        default: '.bring-it',
      },
    });
}

export function handler(io) {
  import('../action/pack.mjs')
    .then(({ action }) => action(io))
    .catch(console.error);
}
