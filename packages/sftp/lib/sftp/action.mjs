import { normalize, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import slash from 'slash';

import { preset } from './lib.mjs';
import { logger } from './logger.mjs';
import { checkSource } from './prepare.mjs';
import { checkServer } from './read-config.mjs';

function parsePath(cwd = preset.cwd) {
  return resolve(
    process.cwd(),
    slash(normalize(cwd)).replaceAll(/^\/|\/$/g, ''),
  );
}

// eslint-disable-next-line consistent-return
export async function action({ key, server, cwd: forceCWD, path: forcePath }) {
  const {
    user,
    hostname,
    port,
    path: filePath,
    cwd,
    include = '**',
    exclude = '*.map',
  } = checkServer(server);

  const path = parsePath(forcePath ?? filePath);

  const CWD = parsePath(forceCWD ?? cwd);

  if (checkSource(CWD)) {
    logger.info('From:', pathToFileURL(CWD).toString());
    logger.info('To:', `sftp://${user}@${hostname}:${port}${path}`);
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
