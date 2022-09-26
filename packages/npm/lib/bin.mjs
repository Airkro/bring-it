import * as pack from '@bring-it/utils/cmd/pack.mjs';
import { Cheetor } from 'cheetor';

import * as npm from './cmd/npm.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .command(npm)
  .config((cli) => cli.wrap(null))
  .setup();
