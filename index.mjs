import { pathToFileURL } from 'url';

import { NodeSSH } from 'node-ssh';
import slash from 'slash';

import { uploadAll } from './lib/upload.mjs';
import { checkSource, logger } from './lib/utils.mjs';

export function action({
  cwd,
  key,
  server: { user, hostname, port, path: dir },
}) {
  if (checkSource(cwd)) {
    const ssh = new NodeSSH();

    ssh
      .connect({
        host: hostname,
        port,
        username: user,
        privateKey: key,
        tryKeyboard: false,
      })
      .then(() => {
        logger.info('From:', pathToFileURL(cwd).toString());
        logger.info(
          'To:',
          new URL(slash(dir), `sftp://${user}@${hostname}:${port}`).toString(),
        );

        logger.info('Connection:', 'start');

        ssh.connection.on('error', (error) => {
          process.exitCode = 1;
          logger.fail(error.message);
          ssh.dispose();
        });

        ssh.connection.on('end', () => {
          logger.info('Connection:', 'end');
        });

        ssh.connection.on('close', () => {
          logger.info('Connection:', 'close');
          // eslint-disable-next-line unicorn/no-process-exit
          process.exit();
        });
      })
      .then(() => uploadAll(ssh, cwd, dir))
      .catch((error) => {
        process.exitCode = 1;
        setTimeout(() => {
          logger.fail(error.message);
        }, 0);
      })
      .finally(() => {
        ssh.dispose();
      });
  }
}

process.on('SIGINT', () => {
  process.exit(1);
});
