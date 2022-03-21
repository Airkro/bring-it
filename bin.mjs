#!/usr/bin/env node

import { readFileSync } from 'fs';

import { Cheetor } from 'cheetor';

import * as ssh from './lib/cmd/ssh.mjs';

const raw = readFileSync('./package.json');

const pkg = JSON.parse(raw);

new Cheetor(pkg, import.meta.url)
  .command(ssh)
  .config((cli) => cli.wrap(null))
  .setup();
