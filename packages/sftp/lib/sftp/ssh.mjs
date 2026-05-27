import { existsSync } from 'node:fs';

import { NodeSSH } from 'node-ssh';
import { utils as ssh2Utils } from 'ssh2';

import { logger } from './logger.mjs';

export function SSH({ user, hostname, port, key }, callback) {
  const ssh = new NodeSSH();

  // Determine if key is a file path or inline key content
  let connectOptions;
  
  if (existsSync(key)) {
    // File exists, use as privateKeyPath
    connectOptions = { privateKeyPath: key };
  } else {
    // Treat as inline key content, validate format
    try {
      ssh2Utils.parseKey(key);
      connectOptions = { privateKey: key };
    } catch (error) {
      throw new Error(`Invalid private key format: ${error.message}`);
    }
  }

  return ssh
    .connect({
      host: hostname,
      port,
      username: user,
      tryKeyboard: false,
      keepaliveInterval: 30 * 1000,
      ...connectOptions,
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
