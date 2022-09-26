import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { logger } from '../sftp/logger.mjs';
import { checkSource } from '../sftp/prepare.mjs';
import { checkServer, preset } from '../sftp/read-config.mjs';
import { SSH } from '../sftp/ssh.mjs';
import { upload } from '../sftp/upload.mjs';

export const command = 'sftp [server]';

export const describe = 'SFTP deployment command';

function parsePath(cwd = preset.cwd) {
  return resolve(
    process.cwd(),
    cwd.replace(/[/\\]+/g, '/').replace(/^\/|\/$/g, ''),
  );
}

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
        coerce: (cwd) => parsePath(cwd),
      },
      key: {
        alias: 'k',
        description: 'example: .ssh/id_*',
        requiresArg: true,
        demand: true,
      },
    });
}

export function handler({
  cwd = parsePath(),
  key,
  server: { user, hostname, port, path } = {},
}) {
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
