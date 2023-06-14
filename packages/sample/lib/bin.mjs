import * as pack from '@bring-it/utils/cmd/pack.mjs';
import { Cheetor } from 'cheetor';

import * as sample from './cmd/sample.mjs';

new Cheetor('../package.json', import.meta.url)
  .command(pack)
  .command(sample)
  .config((cli) => cli.wrap(null))
  .setup();
