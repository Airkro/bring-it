import { resolve } from 'path';

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
          description: `URI as user@hostname[:port][/path]\r\nor Host config name in '${preset.conf}'`,
          coerce: checkServer,
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
      key: {
        alias: 'k',
        description: description('.ssh/id_rsa', 'example'),
        requiresArg: true,
        demand: true,
      },
    });

  return cli;
}
