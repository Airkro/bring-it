import { existsSync } from 'node:fs';

import { NodeSSH } from 'node-ssh';

import { logger } from './logger.mjs';

export function SSH({ user, hostname, port, key }, callback) {
  const ssh = new NodeSSH();

  // Initialize connect options with common settings
  const connectOptions = {
    host: hostname,
    port,
    username: user,
    tryKeyboard: false,
    keepaliveInterval: 30 * 1000,
  };

  // Determine if key is a file path or inline key content
  if (existsSync(key)) {
    connectOptions.privateKeyPath = key;
  } else {
    connectOptions.privateKey = key;
  }

  return ssh
    .connect(connectOptions)
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
