const isValidHost = require('is-valid-host');
const { readFileSync } = require('fs');

module.exports = {
  builder(cli) {
    cli.options({
      server: {
        alias: 's',
        requiresArg: true,
        type: 'string',
        coerce: (value = '') => {
          if (value && !isValidHost(value)) {
            throw new TypeError('--url-host is not valid');
          }
          const [host, port] = value.split(':');
          return { host, port };
        },
      },
      remote: {
        alias: 'r',
        requiresArg: true,
        normalize: true,
        type: 'string',
      },
      target: {
        alias: 't',
        requiresArg: true,
        normalize: true,
        type: 'string',
      },
      username: {
        alias: 'u',
        requiresArg: true,
        type: 'string',
      },
      privateKey: {
        alias: 'k',
        normalize: true,
        requiresArg: true,
        type: 'string',
        coerce: (path) => readFileSync(path),
      },
      passphrase: {
        alias: 'p',
        implies: 'privateKey',
        requiresArg: true,
        type: 'string',
      },
    });
  },
};
