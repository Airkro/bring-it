import { resolve } from 'path';

import { checkServer, preset } from './read-config.mjs';

export function builder(cli) {
  cli
    .wrap(null)
    .usage('Usage: $0 <server>')
    .command(
      '$0 [server]',
      '',
      (yargs) =>
        yargs.positional('server', {
          description: [
            'URI as user@hostname[:port][/path]',
            `or Host config name in '${preset.conf}'`,
          ].join('\r\n'),
          coerce: checkServer,
        }),
      () => {},
    )
    .options({
      cwd: {
        alias: 'c',
        description: `default: ${preset.cwd}`,
        requiresArg: true,
        coerce: (cwd = preset.cwd) =>
          resolve(process.cwd(), cwd.replace(/[/\\]+$/g, '')),
      },
      key: {
        alias: 'k',
        description: 'example: .ssh/id_rsa',
        requiresArg: true,
        demand: true,
      },
    });

  return cli;
}
