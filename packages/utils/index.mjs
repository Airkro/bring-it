import { readFile } from 'node:fs/promises';

import chalk from 'chalk';

const { red, cyan, green, yellow, magenta } = chalk;

const OKAY = green('[okay]');
const FAIL = red('[fail]');
const WARN = yellow('[warn]');

export class Logger {
  constructor(name) {
    this.name = `[${cyan('bring-it')}:${magenta(name)}]`;
  }

  okay(...message) {
    this.log(OKAY, ...message);
  }

  fail(...message) {
    this.log(FAIL, ...message);
  }

  warn(...message) {
    this.log(WARN, ...message);
  }

  task(...message) {
    this.log('[task]', ...message);
  }

  file(...message) {
    this.log('[file]', ...message);
  }

  info(...message) {
    this.log('[info]', ...message);
  }

  json(json) {
    this.log('[json]', JSON.stringify(json, '', 2));
  }

  log(...message) {
    console.log(this.name, ...message);
  }
}

export const ignore = [
  '**/.{cache,git,svn,ssh,yarn}/**',
  '**/.{npm,yarn}rc',
  '**/.env.*',
  '**/.env',
  '**/.git{keep,ignore}',
  '**/{node,web}_modules/**',
  '**/*.{pem,ppk}',
  '**/id_{d,r}sa',
  '**/.obsidian/**',
  '**/.docusaurus/**',
  '**/miniprogram_npm/**',
  '**/ssh*config',
  '**/sshd*config',
];

function readJSON(configName, logger) {
  return readFile(configName, 'utf8')
    .then((text) => JSON.parse(text))
    .then((json) => {
      const { BRANCH_NAME } = process.env;

      if (BRANCH_NAME) {
        const { branches, ...rest } = json;

        return { ...rest, ...branches?.[BRANCH_NAME] };
      }

      return json;
    })
    .catch((error) => {
      logger.warn(error.message);
      logger.info('Fallback to default configuration');

      return {};
    });
}

export function readConfig(name, logger) {
  return readJSON(`.bring-it/${name}.config.json`, logger);
}

export function http({ url, query, json, method = 'GET' }) {
  const io = new URL(url);

  for (const [key, value] of Object.entries(query)) {
    io.searchParams.set(key, value);
  }

  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  return fetch(io.href, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(json),
  }).then((response) => response.json());
}
