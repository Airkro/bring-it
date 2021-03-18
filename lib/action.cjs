const Client = require('ssh2-sftp-client');

const { name } = require('../package.json');

module.exports = {
  action({
    server: { host, port } = {},
    username = 'root',
    passphrase,
    privateKey,
    target = process.cwd(),
    remote = '/mnt/bring-it',
  }) {
    const sftp = new Client(name);

    sftp
      .connect({
        host,
        port,
        username,
        passphrase,
        privateKey,
      })
      .then(() =>
        sftp.uploadDir(
          target,
          remote,
          /(?!(\.git|\.svn|\.cache|node_modules))/,
        ),
      )
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error.message);
      })
      .finally(() => {
        sftp.end().catch((error) => {
          console.error(error.message);
        });
      });
  },
};
