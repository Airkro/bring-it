import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { preset } from './lib.mjs';
import { logger } from './logger.mjs';
import { checkSource } from './prepare.mjs';
import { checkServer } from './read-config.mjs';

function parsePath(cwd = preset.cwd) {
  return resolve(
    process.cwd(),
    cwd.replaceAll(/[/\\]+/g, '/').replaceAll(/^\/|\/$/g, ''),
  );
}

// eslint-disable-next-line consistent-return
export async function action({ key, cwd, server, path: forcePath }) {
  const { user, hostname, port, path: filePath } = checkServer(server);

  const path = forcePath ?? filePath;

  const CWD = parsePath(cwd);

  if (checkSource(CWD)) {
    logger.info('From:', pathToFileURL(CWD).toString());
    logger.info('To:', `sftp://${user}@${hostname}:${port}${path}`);

    const options = { hostname, port, user, key };

    const { SSH } = await import('./ssh.mjs');
    const { upload } = await import('./upload.mjs');

    return SSH(options, (ssh) => upload(ssh, CWD, path));
  }
}

process.on('SIGINT', () => {
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
});
