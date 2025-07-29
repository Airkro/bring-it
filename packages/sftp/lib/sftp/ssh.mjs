import { NodeSSH } from 'node-ssh';

import { logger } from './logger.mjs';

export function SSH({ user, hostname, port, key }, callback) {
  const ssh = new NodeSSH();

  return ssh
    .connect({
      host: hostname,
      port,
      username: user,
      tryKeyboard: false,
      keepaliveInterval: 30 * 1000,
      ...(key.startsWith('-----BEGIN RSA PRIVATE KEY-----')
        ? { privateKey: key }
        : { privateKeyPath: key }),
    })
    .then(() => {
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
        // eslint-disable-next-line unicorn/no-process-exit, n/no-process-exit
        process.exit();
      });
    })
    .then(() => callback(ssh))
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
