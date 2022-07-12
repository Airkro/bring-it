import { Cheetor } from 'cheetor';

import * as npm from './cmd/npm.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(npm)
  .config((cli) => cli.wrap(null))
  .setup();
