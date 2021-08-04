import { pathToFileURL } from 'url';

import { logger } from './lib/logger.mjs';
import { checkSource } from './lib/prepare.mjs';
import { SSH } from './lib/ssh.mjs';
import { upload } from './lib/upload.mjs';

export function action({ cwd, key, server: { user, hostname, port, path } }) {
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
