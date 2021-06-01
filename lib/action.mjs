import { NodeSSH } from 'node-ssh';
import pAll from 'p-all';
import pRetry from 'p-retry';
import pSeries from 'p-series';
import { basename, resolve } from 'path';
import slash from 'slash';

import { scan } from './scan.mjs';
import { checkSource, Logger, withTimeout } from './utils.mjs';

const logger = new Logger();

const retryOption = { retries: 5 };

async function uploadAll(ssh, source, remote) {
  const sftp = await ssh.requestSFTP();

  function sendFile(file) {
    return ssh.putFile(file.local, file.remote, sftp).then(
      () => {
        logger.okay(file.name);
      },
      (error) => {
        logger.fail(file.name);
        throw error;
      },
    );
  }

  function sendGroup(group) {
    return pAll(
      group.map((file) => () => pRetry(() => sendFile(file), retryOption)),
      { concurrency: 10 },
    );
  }

  const groups = await scan(source, remote);

  return withTimeout(() =>
    pSeries(groups.map((group) => () => sendGroup(group))),
  );
}

export function action({
  keyPath,
  passphrase,
  remote = '/mnt/bring-it/',
  server: { hostname = '127.0.0.1', port = 22 } = {},
  target = '.bring-it',
  username = 'root',
}) {
  const source = slash(resolve(process.cwd(), target));
  if (checkSource(source, logger)) {
    const path = slash(basename(remote));

    const ssh = new NodeSSH();

    ssh
      .connect({
        host: hostname,
        port,
        username,
        passphrase,
        privateKey: keyPath,
        tryKeyboard: false,
      })
      .then(() => {
        logger.info('From:', source);
        logger.info('To:', `ssh://${username}@${hostname}:${port}/${path}`);

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
      .then(() => uploadAll(ssh, source, remote))
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
