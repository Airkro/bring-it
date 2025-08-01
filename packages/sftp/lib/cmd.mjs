import { preset } from './sftp/lib.mjs';

export const command = 'sftp [server]';

export const describe = 'SFTP deployment command';

const {
  SSH_PRIVATE_KEY_PATH,
  ssh_private_key_path = SSH_PRIVATE_KEY_PATH,
  SSH_PRIVATE_KEY,
  ssh_private_key = SSH_PRIVATE_KEY || ssh_private_key_path,
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
      key: {
        alias: 'k',
        description: 'example: .ssh/id_*',
        requiresArg: true,
        demand: !ssh_private_key,
      },
    });
}

export function handler({ key = ssh_private_key.trim(), server }) {
  if (!server) {
    throw new Error('Missing required positional: server');
  }

  if (!key) {
    throw new Error('Missing required argument: key');
  }

  import('./sftp/action.mjs')
    .then(({ action }) => action({ server, key }))
    .catch((error) => {
      process.exitCode = 1;
      console.error(error);
    });
}
