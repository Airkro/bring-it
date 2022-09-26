import * as pack from '@bring-it/utils/cmd/pack.mjs';
import { Cheetor } from 'cheetor';

import * as sftp from './cmd/sftp.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .command(sftp)
  .config((cli) => cli.wrap(null))
  .setup();
