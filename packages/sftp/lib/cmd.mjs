import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { logger } from './sftp/logger.mjs';
import { checkSource } from './sftp/prepare.mjs';
import { checkServer, preset } from './sftp/read-config.mjs';

export const command = 'sftp [server]';

export const describe = 'SFTP deployment command';

function parsePath(cwd = preset.cwd) {
  return resolve(
    process.cwd(),
    cwd.replaceAll(/[/\\]+/g, '/').replaceAll(/^\/|\/$/g, ''),
  );
}

const {
  SSH_PRIVATE_KEY_PATH,
  ssh_private_key_path = SSH_PRIVATE_KEY_PATH,
  PRIVATE_KEY_PATH = ssh_private_key_path,
  private_key_path = PRIVATE_KEY_PATH,
} = process.env;

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
        demand: !private_key_path,
      },
      path: {
        alias: 'p',
        description: 'overriding server path',
        requiresArg: true,
      },
    });
}

export function handler({
  cwd = parsePath(),
  key = private_key_path,
  server,
  path: forcePath,
}) {
  if (!server) {
    throw new Error('Missing required positional: server');
  }

  const { user, hostname, port, path: filePath } = server;

  const path = forcePath ?? filePath;

  if (!key) {
    throw new Error('Missing required argument: key');
  }

  if (checkSource(cwd)) {
    logger.info('From:', pathToFileURL(cwd).toString());
    logger.info('To:', `sftp://${user}@${hostname}:${port}${path}`);

    const options = { hostname, port, user, key };

    import('./sftp/action.mjs')
      .then(({ action }) => action(options, { cwd, path }))
      .catch(console.error);
  }
}

process.on('SIGINT', () => {
  process.exit(1);
});
