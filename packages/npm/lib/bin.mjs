import * as pack from '@bring-it/utils/cmd/pack.mjs';
import { Cheetor } from 'cheetor';

import * as npm from './cmd.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .command(npm)
  .commandSafe('@bring-it/sample/dist/sub.mjs')
  .commandSafe('@bring-it/sftp/dist/sub.mjs')
  .config((cli) => cli.wrap(null))
  .setup();
