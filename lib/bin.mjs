import { Cheetor } from 'cheetor';

import * as pack from './cmd/pack.mjs';
import * as sftp from './cmd/sftp.mjs';

/* globals __filename */

// eslint-disable-next-line unicorn/prefer-module
new Cheetor('../package.json', __filename)
  .command(pack)
  .command(sftp)
  .config((cli) => cli.wrap(null))
  .setup();
