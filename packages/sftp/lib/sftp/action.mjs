import { normalize, resolve } from 'node:path';

import slash from 'slash';

import { logger } from './logger.mjs';
import { checkSource } from './prepare.mjs';
import { checkServer } from './read-config.mjs';

// eslint-disable-next-line consistent-return
export async function action({ key, server }) {
  const {
    user,
    hostname,
    port,
    path: filePath,
    cwd,
    include = '**',
    exclude = '*.map',
  } = checkServer(server);

  const path = slash(normalize(filePath));

  const CWD = slash(resolve(normalize(cwd)));

  if (checkSource(CWD)) {
    logger.info('From:', CWD);
    logger.info(
      'To:',
      new URL(path, `sftp://${user}@${hostname}:${port}`).href,
    );
    logger.info('Include:', include);
    logger.info('Exclude:', exclude);

    const options = { hostname, port, user, key };

    const { SSH } = await import('./ssh.mjs');
    const { upload } = await import('./upload.mjs');

    return SSH(options, (ssh) => upload(ssh, { CWD, path, include, exclude }));
  }
}

process.on('SIGINT', () => {
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
});
