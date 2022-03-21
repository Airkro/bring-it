import { resolve } from 'path';
import { pathToFileURL } from 'url';

import { logger } from '../logger.mjs';
import { checkSource } from '../prepare.mjs';
import { checkServer, preset } from '../read-config.mjs';
import { SSH } from '../ssh.mjs';
import { upload } from '../upload.mjs';

export const command = 'sftp [server]';

export const describe = 'SFTP deployment command';

export function builder(cli) {
  cli
    .positional('server', {
      description: [
        'URI as user@hostname[:port][/path]',
        `or Host section in '${preset.conf}'`,
      ].join('\r\n'),
      coerce: checkServer,
    })
    .options({
      cwd: {
        alias: 'c',
        description: `default: ${preset.cwd}`,
        requiresArg: true,
        coerce: (cwd = preset.cwd) =>
          resolve(
            process.cwd(),
            cwd.replace(/[/\\]+/g, '/').replace(/^\/|\/$/g, ''),
          ),
      },
      key: {
        alias: 'k',
        description: 'example: .ssh/id_rsa',
        requiresArg: true,
        demand: true,
      },
    });
}

export function handler({ cwd, key, server: { user, hostname, port, path } }) {
  if (checkSource(cwd)) {
    logger.info('From:', pathToFileURL(cwd).toString());
    logger.info('To:', `sftp://${user}@${hostname}:${port}${path}`);

    const options = { hostname, port, user, key };

    SSH(options, (ssh) => upload(ssh, cwd, path));
  }
}

process.on('SIGINT', () => {
  process.exit(1);
});
