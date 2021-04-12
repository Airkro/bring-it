const { NodeSSH } = require('node-ssh');
const { resolve, join, parse, relative } = require('path');

const slash = require('slash');

const { Logger, withTimeout } = require('./utils.cjs');

const logger = new Logger();

const order = [
  ['.svgz', '.svg'],
  ['.css'],
  ['.js'],
  ['.xhtml', '.html', '.htm'],
  ['.xml'],
];

const orderAll = order.flat();

const options = (target, types) => ({
  recursive: true,
  concurrency: 10,
  validate(itemPath) {
    const { ext } = parse(itemPath);
    return !ext || (types ? types.includes(ext) : !orderAll.includes(ext));
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

module.exports = {
  action({
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

    const ssh = new NodeSSH();

    const source = resolve(process.cwd(), target);
    const path = slash(join('/', remote).replace(/[/\\]+$/, ''));

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
  },
};
