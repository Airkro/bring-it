import { preset } from './sftp/lib.mjs';

export const command = 'sftp [server]';

export const describe = 'SFTP deployment command';

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
    })
    .options({
      cwd: {
        alias: 'c',
        description: `default: ${preset.cwd}`,
        requiresArg: true,
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

export function handler({ cwd, key = private_key_path, server, path }) {
  if (!server) {
    throw new Error('Missing required positional: server');
  }

  if (!key) {
    throw new Error('Missing required argument: key');
  }

  import('./sftp/action.mjs')
    .then(({ action }) => action({ server, cwd, path, key }))
    .catch((error) => {
      process.exitCode = 1;
      console.error(error);
    });
}
