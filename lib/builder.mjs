import pkg from 'chalk';
import isValidHost from 'is-valid-host';
import slash from 'slash';

const { gray } = pkg;

function description(string, label = 'default') {
  return `${gray(`${label}:`)} ${string}`;
}

export function builder(cli) {
  cli.options({
    target: {
      alias: 't',
      description: description('.bring-it'),
      normalize: true,
      requiresArg: true,
      type: 'string',
    },
    remote: {
      alias: 'r',
      description: description('/mnt/bring-it'),
      requiresArg: true,
      type: 'string',
      coerce: (value) => slash(value),
    },
    server: {
      alias: 's',
      description: description('127.0.0.1:22'),
      requiresArg: true,
      type: 'string',
      coerce: (value) => {
        if (value && !isValidHost(value)) {
          throw new TypeError('--server is not valid');
        }
        const [hostname, port] = value.split(':');
        return { hostname, port };
      },
    },
    username: {
      alias: 'u',
      description: description('root'),
      requiresArg: true,
      type: 'string',
    },
    'key-path': {
      alias: 'k',
      description: description('.ssh/key.pem', 'example'),
      normalize: true,
      requiresArg: true,
      type: 'string',
    },
    passphrase: {
      alias: 'p',
      implies: 'key-path',
      requiresArg: true,
      type: 'string',
    },
  });
}
