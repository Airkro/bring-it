import * as pack from '@bring-it/utils/cmd/pack.mjs';
import { Cheetor } from 'cheetor';

import * as main from './cmd/sftp.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .command(main)
  .commandSafe('@bring-it/npm/lib/cmd/npm.mjs')
  .commandSafe('@bring-it/sample/lib/cmd/sample.mjs')
  .config((cli) => cli.wrap(null))
  .setup();
