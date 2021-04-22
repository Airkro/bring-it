#!/usr/bin/env node

import Cheetor from 'cheetor';

import { action } from './lib/action.mjs';
import { builder } from './lib/builder.mjs';

new Cheetor('./package.json', import.meta.url).config(builder).setup(action);
