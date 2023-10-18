import * as pack from '@bring-it/utils/cmd/pack.mjs';
import { Cheetor } from 'cheetor';

import * as main from './cmd.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .command(main)
  .commandSafe('@bring-it/npm/dist/sub.mjs')
  .commandSafe('@bring-it/sentry/dist/sub.mjs')
  .commandSafe('@bring-it/sftp/dist/sub.mjs')
  .config((cli) => cli.wrap(null))
  .setup();
