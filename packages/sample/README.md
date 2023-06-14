# @bring-it/sample

Generate code sample files.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/@bring-it/sample
[npm-badge]: https://img.shields.io/npm/v/@bring-it/sample.svg?style=flat-square&logo=npm
[github-url]: https://github.com/airkro/bring-it/tree/master/packages/sample
[github-badge]: https://img.shields.io/npm/l/@bring-it/sample.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/@bring-it/sample.svg?style=flat-square&colorB=green&logo=node.js

## Installation

```bash
npx playwright install chromium
npm install @bring-it/sample playwright-core -g
```

## Usage

```bash
npm x bring-it sample
```

## Commands

### bring-it pack [target...]

Pack files when support.

### bring-it sample

Generate code sample files.

Default config:

```jsonc
// .bring-it/sample.config.json
{
  "cwd": ".",
  "pattern": [
    "**/*.{,c,m}{j,t}s",
    "**/*.{t,j}sx",
    "**/*.{c,sc,le,wx,q,tt,jx,ac}ss",
    "**/*.{html,htm,vue,svg}",
    "**/*.{wx,q}s"
  ],
  "ignore": ["dist"],
  "title": "示例软件名称",
  "version": "v1.0"
}
```
