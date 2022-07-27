import { Cheetor } from 'cheetor';

import * as pack from './cmd/pack.mjs';
import * as sftp from './cmd/sftp.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .command(sftp)
  .config((cli) => cli.wrap(null))
  .setup();
