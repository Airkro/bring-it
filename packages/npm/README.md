# @bring-it/npm

Publish npm packages when needed.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/@bring-it/npm
[npm-badge]: https://img.shields.io/npm/v/@bring-it/npm.svg?style=flat-square&logo=npm
[github-url]: https://github.com/airkro/bring-it/tree/master/packages/npm
[github-badge]: https://img.shields.io/npm/l/@bring-it/npm.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/@bring-it/npm.svg?style=flat-square&colorB=green&logo=node.js

## Installation

```bash
npm i @bring-it/npm -D
```

## Usage

```bash
npm x bring-it npm
```

## Compare with others

| Features                | bring-it | [np] | [release-it] | [changesets] |
| :---------------------- | :------: | :--: | :----------: | :----------: |
| Preview mode / Dry Run  |    ✔     |  ✔   |      ✔       |      ✔       |
| NPM publish             |    ✔     |  ✔   |      ✔       |      ✔       |
| Git support limit       |    ✔     |  ✔   |      ❌      |      ✔       |
| Git branch limit        |    ✔     |  ✔   |      ✔       |      ❌      |
| Git dirty check         |    ✔     |  ✔   |      ✔       |      ❌      |
| Git root limit          |    ✔     |  ❌  |      ❌      |      ✔       |
| Monorepo support        |    ✔     |  ❌  |      ❌      |      ✔       |
| Generate changelog      |    ❌    |  ❌  |      ✔       |      ✔       |
| No unpulled changes     |    ❌    |  ✔   |      ❌      |      ❌      |
| Revert change           |    ❌    |  ✔   |      ❌      |      ❌      |
| Engines check           |    ❌    |  ✔   |      ❌      |      ❌      |
| Auto Run tests          |    ❌    |  ✔   |      ❌      |      ❌      |
| Install dependencies    |    ❌    |  ✔   |      ❌      |      ❌      |
| 2-factor authentication |    ❌    |  ✔   |      ❌      |      ❌      |
| Warns extraneous files  |    ❌    |  ✔   |      ❌      |      ❌      |
| Create pre-release      |    ❌    |  ✔   |      ✔       |      ✔       |
| Bump versions           |    ❌    |  ✔   |      ✔       |      ✔       |
| Create Git release, tag |    ❌    |  ✔   |      ✔       |      ✔       |
| Interactive UI          |    ❌    |  ✔   |      ✔       |      ✔       |
| Push releases and tags  |    ❌    |  ✔   |      ✔       |      ✔       |

[np]: https://www.npmjs.com/package/np
[release-it]: https://www.npmjs.com/package/release-it
[changesets]: https://www.npmjs.com/package/changesets
