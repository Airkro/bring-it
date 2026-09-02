# Command module template

File: `src/cmd.mjs` (or `lib/cmd.mjs`). Exports yargs-compatible command
fields. The `handler` must lazy-import the action module so failures are caught.

## Single command

```js
export const command = '<name> [target...]';

export const describe = '<short description>';

export function builder(cli) {
  cli
    .positional('target', {
      description: 'glob pattern of files or directories'
    })
    .options({
      name: {
        alias: 'n',
        description: 'output name',
        default: 'noop',
        type: 'string'
      }
    });
}

export function handler(io) {
  import('./lib/<name>.mjs')
    .then(({ action }) => action(io))
    .catch((error) => {
      process.exitCode = 1;
      console.error(error);
    });
}
```

## Nested subcommands (like `npm login` / `npm publish`)

```js
import * as login from './cmd/login.mjs';
import * as publish from './cmd/publish.mjs';

export const command = 'npm';

export const describe = 'npm commands';

export function builder(cli) {
  cli.command(login).command(publish);
}
```

Each subcommand module (`cmd/login.mjs`, `cmd/publish.mjs`) follows the
single-command shape above.
