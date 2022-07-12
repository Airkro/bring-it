import * as npm from '@bring-it/npm/lib/cmd/npm.mjs';
import { Cheetor } from 'cheetor';

import * as pack from './cmd/pack.mjs';
import * as sftp from './cmd/sftp.mjs';

// eslint-disable-next-line unicorn/prefer-module
new Cheetor('../package.json', __filename)
  .command(pack)
  .command(sftp)
  .command(npm)
  .config((cli) => cli.wrap(null))
  .setup();
