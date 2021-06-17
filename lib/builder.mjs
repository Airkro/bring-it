import isValidHost from 'is-valid-host';
import slash from 'slash';

import { description, gray } from './utils.mjs';

export function builder(cli) {
  cli.options({
    config: {
      alias: 'c',
      description: gray("Host 'bring-it' in .ssh/config"),
      requiresArg: true,
      type: 'string',
    },
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
      coerce: (value) => (value === undefined ? undefined : slash(value)),
    },
    server: {
      alias: 's',
      description: description('127.0.0.1:22'),
      requiresArg: true,
      type: 'string',
      coerce: (value) => {
        if (value) {
          if (!isValidHost(value)) {
            throw new TypeError('--server is not valid');
          }
          const [hostname, port] = value.split(':');
          return { hostname, port };
        }
        return {};
      },
    },
    user: {
      alias: 'u',
      description: description('root'),
      requiresArg: true,
      type: 'string',
    },
    'identity-file': {
      alias: 'i',
      description: description('.ssh/key.pem', 'example'),
      normalize: true,
      requiresArg: true,
      type: 'string',
      coerce(value) {
        if (!value) {
          throw new TypeError('--identity-file is missing');
        }
        return value;
      },
    },
    passphrase: {
      alias: 'p',
      implies: 'identity-file',
      requiresArg: true,
      type: 'string',
    },
  });

  return cli;
}
