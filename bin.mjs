#!/usr/bin/env node

import { readFileSync } from 'fs';

import { Cheetor } from 'cheetor';

import * as pack from './lib/cmd/pack.mjs';
import * as sftp from './lib/cmd/sftp.mjs';

const current = import.meta.url;
const file = new URL('package.json', current);
const raw = readFileSync(file);
const pkg = JSON.parse(raw);

new Cheetor(pkg, import.meta.url)
  .command(pack)
  .command(sftp)
  .config((cli) => cli.wrap(null))
  .setup();
