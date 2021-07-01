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

```sh
npm install @bring-it/cli --global
```

## Usage

```sh
bring-it <server>
```

```plain
Usage: bring-it <server>

Positionals:
  server  SFTP-URI as user@hostname[:port] or
          Host config name in '.ssh/config'

Options:
  -c, --cwd  default: .bring-it
  -d, --dir  default: /mnt/bring-it
  -k, --key  example: .ssh/key.pem  [required]
```

### How to use configuration file

When <server> not match URI, `bring-it` will treat it as a Host name in [.ssh/config](https://man.openbsd.org/ssh_config.5)

```sh
bring-it development
```

```plain
# example: .ssh/config

Host development
  Hostname 192.168.1.200
  User root

Host production
  Hostname example.org
  Port 23
  User deploy
```

## Tips

Atomic write is not support when `ssh/sftp/scp` transfer, make your bundle support [long-term caching](https://developers.google.com/web/fundamentals/performance/webpack/use-long-term-caching), it will be safer when uploading.

For a little bit safer, `@bring-it/cli` will always upload files in order by: `OTHER, SVG, STYLE, SCRIPT, HTML, XML` .

## FAQ

### Why unauthorized transfer is not supported?

To make sure unexpected file transferring won't happen.

### Why `password` is not supported?

Not safe, and typing special characters to the terminal might not easy.
