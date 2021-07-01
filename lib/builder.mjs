import { join, resolve } from 'path';

import { checkServer, preset } from './read-config.mjs';
import { description } from './utils.mjs';

export function builder(cli) {
  cli
    .wrap(null)
    .usage('Usage: $0 <server>')
    .command(
      '$0 [server]',
      '',
      (yargs) =>
        yargs.positional('server', {
          description: `SFTP-URI as user@hostname[:port] or\r\nHost config name in '${preset.conf}'`,
          coerce: checkServer,
          demand: true,
        }),
      () => {},
    )
    .options({
      cwd: {
        alias: 'c',
        description: description(preset.cwd, 'default'),
        requiresArg: true,
        coerce: (cwd = preset.cwd) => resolve(process.cwd(), cwd),
      },
      dir: {
        alias: 'd',
        description: description(preset.dir, 'default'),
        requiresArg: true,
        coerce: (dir = preset.dir) => join('/', dir.replace(/[/\\]+$/, '')),
      },
      key: {
        alias: 'k',
        description: description('.ssh/key.pem', 'example'),
        requiresArg: true,
        demand: true,
      },
    });

  return cli;
}
