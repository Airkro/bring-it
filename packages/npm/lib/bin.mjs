import * as pack from '@bring-it/utils/cmd/pack.mjs';
import { Cheetor } from 'cheetor';

import * as npm from './cmd/npm.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .command(npm)
  .commandSafe('@bring-it/sample/lib/cmd/sample.mjs')
  .commandSafe('@bring-it/sftp/lib/cmd/sftp.mjs')
  .config((cli) => cli.wrap(null))
  .setup();
