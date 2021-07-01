#!/usr/bin/env node

import { Cheetor } from 'cheetor';

import { builder } from './lib/builder.mjs';

import { action } from './index.mjs';

new Cheetor('./package.json', import.meta.url).config(builder).setup(action);
