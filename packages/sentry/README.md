# @bring-it/sentry

Update sentry artifacts.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/@bring-it/sentry
[npm-badge]: https://img.shields.io/npm/v/@bring-it/sentry.svg?style=flat-square&logo=npm
[github-url]: https://github.com/airkro/bring-it/tree/master/packages/sentry
[github-badge]: https://img.shields.io/npm/l/@bring-it/sentry.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/@bring-it/sentry.svg?style=flat-square&colorB=green&logo=node.js

## Installation

```bash
npm install @sentry/cli -g
npm install @bring-it/sentry -D
```

## Usage

```bash
npm link @sentry/cli
npm x bring-it sentry
```

## Config

```jsonc
// .bring-it/sentry.config.json
{
  "url": "...",
  "org": "...",
  "project": "...",
  "authToken": "..."
}
```
