import { Cheetor } from 'cheetor';

import * as pack from './cmd/pack.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .commandSafe('@bring-it/notify/dist/sub.mjs')
  .commandSafe('@bring-it/npm/dist/sub.mjs')
  .commandSafe('@bring-it/sample/dist/sub.mjs')
  .commandSafe('@bring-it/sentry/dist/sub.mjs')
  .commandSafe('@bring-it/sftp/dist/sub.mjs')
  .config((cli) => cli.wrap(null))
  .setup();
