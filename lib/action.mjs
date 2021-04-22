import fs from 'fs';
import { NodeSSH } from 'node-ssh';
import { join, parse, relative, resolve } from 'path';
import slash from 'slash';

import { Logger, withTimeout } from './utils.mjs';

const logger = new Logger();

const order = [
  ['.svgz', '.svg'],
  ['.css'],
  ['.js'],
  ['.xhtml', '.html', '.htm'],
  ['.xml'],
];

const orderAll = order.flat();

function isDir(path) {
  return fs.statSync(path).isDirectory();
}

const options = (target, types) => ({
  recursive: true,
  concurrency: 10,
  validate(itemPath) {
    const { ext } = parse(itemPath);
    if (
      itemPath.endsWith('.gitkeep') ||
      itemPath.endsWith('.gitignore') ||
      itemPath.endsWith('.git') ||
      itemPath.endsWith('.svn')
    ) {
      return false;
    }
    if (isDir(itemPath)) {
      return true;
    }
    if (types) {
      return types.includes(ext);
    }
    return !orderAll.includes(ext);
  },
  tick(localPath, remotePath, error) {
    if (error) {
      logger.fail(localPath);
      logger.fail(error.message);
    } else {
      logger.okay(relative(target, localPath));
    }
  },
});

function upload(ssh, target, remote, types) {
  return ssh
    .putDirectory(target, remote, options(target, types))
    .then((success) => {
      if (!success) {
        throw new Error('upload');
      }
    });
}

function uploadAll(ssh, target, remote) {
  return withTimeout(() =>
    order.reduce(
      (chain, types) => chain.then(() => upload(ssh, target, remote, types)),
      upload(ssh, target, remote),
    ),
  );
}

// eslint-disable-next-line consistent-return
export function action({
  keyPath,
  passphrase,
  remote = '/mnt/bring-it/',
  server: { hostname = '127.0.0.1', port = 22 } = {},
  target = '.bring-it',
  username = 'root',
}) {
  if (!keyPath) {
    logger.fail('Missing required argument: key-path');
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  const source = resolve(process.cwd(), target);

  if (!fs.existsSync(source)) {
    logger.info(source, 'is not exists');
    return false;
  }

  if (fs.readdirSync(source).length === 0) {
    logger.info(source, 'is empty');
    return false;
  }

  const path = slash(join('/', remote).replace(/[/\\]+$/, ''));

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
      logger.info('To:', `ssh://${username}@${hostname}:${port}${path}`);

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
    .then(() => uploadAll(ssh, source, path))
    .catch((error) => {
      logger.fail(error.message);
      process.exitCode = 1;
    })
    .finally(() => {
      ssh.dispose();
    });
}

process.on('SIGINT', () => {
  process.exit(1);
});
