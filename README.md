# @bring-it/cli

Universal deployment tool for frontend.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/@bring-it/cli
[npm-badge]: https://img.shields.io/npm/v/@bring-it/cli.svg?style=flat-square&logo=npm
[github-url]: https://github.com/airkro/bring-it
[github-badge]: https://img.shields.io/npm/l/@bring-it/cli.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/@bring-it/cli.svg?style=flat-square&colorB=green&logo=node.js

## Installation

```bash
npm install @bring-it/cli --save-dev
```

## Usage

```bash
npx -c bring-it --options
```

## Options

```plain
-t, --target          default: .bring-it
-r, --remote          default: /mnt/bring-it
-s, --server          default: 127.0.0.1:22
-u, --username        default: root
-k, --key-path        example: .ssh/key.pem
-p, --passphrase
```

## Tips

Atomic write is not support when `ssh/sftp/scp` transfer, make your bundle support [long-term caching](https://developers.google.com/web/fundamentals/performance/webpack/use-long-term-caching), it will be safer when uploading.

For a little bit safer, `@bring-it/cli` always upload in order by: `OTHER, SVG, STYLE, SCRIPT, HTML, XML` .

## FAQ

### Why unauthorized transfer is not supported?

To make sure unexpected file transferring won't happen.

### Why `--password` argument is not supported?

Not safe, and typing special characters to the terminal might not easy.
