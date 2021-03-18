#!/usr/bin/env node

const Cheetor = require('cheetor');

const { builder } = require('./lib/builder.cjs');
const { action } = require('./lib/action.cjs');

new Cheetor().config(builder).setup(action);
