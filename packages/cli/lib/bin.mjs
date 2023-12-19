import { Cheetor } from 'cheetor';

import * as pack from './cmd/pack.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .commandSafe('@bring-it/notify')
  .commandSafe('@bring-it/npm')
  .commandSafe('@bring-it/sample')
  .commandSafe('@bring-it/sentry')
  .commandSafe('@bring-it/sftp')
  .config((cli) => cli.wrap(null))
  .setup();
