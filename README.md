# @bring-it/cli

SFTP deployment tool for frontend.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/@bring-it/cli
[npm-badge]: https://img.shields.io/npm/v/@bring-it/cli.svg?style=flat-square&logo=npm
[github-url]: https://github.com/airkro/bring-it
[github-badge]: https://img.shields.io/npm/l/@bring-it/cli.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/@bring-it/cli.svg?style=flat-square&colorB=green&logo=node.js

`@bring-it/cli` follows the principle of [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration), provide [ssh](https://man.openbsd.org/ssh) like but lite version Command-Line Interface.

For a little bit safer, it will always upload files in order by: `OTHER, SVG, STYLE, SCRIPT, HTML, XML/JSON/YAML` .

## Installation

```sh
npm install @bring-it/cli --global
```

## Usage

```sh
bring-it sftp <server>
```

```properties
bring-it sftp [server]

SFTP deployment command

Positionals:
  server  URI as user@hostname[:port][/path]
          or Host section in '.ssh/config'

Options:
  -c, --cwd  default: .bring-it
  -k, --key  example: .ssh/id_rsa  [required]
```

### Configuration

When <server> not match URI, `bring-it` will treat it as a Host name in `.ssh/config`.

`bring-it` support [.ssh/config](https://man.openbsd.org/ssh_config.5) like config with keys: `Hostname, Port, User`, and a custom key: `Path`

```sh
bring-it sftp dev
```

```properties
# example: .ssh/config

# other Host will inherit from *
Host *
  User root

# = root@192.168.1.200/mnt
Host dev
  Hostname 192.168.1.200
  Path /mnt

# = deploy@example.org:2222
Host docs
  Hostname example.org
  Port 2222
  User deploy
```

## Tips

Not like the HTTP URL, in the SFTP URI, `Port` is 22 by default.

`Path` will point to `/` by default, so don't forget set [ChrootDirectory](https://man.openbsd.org/sshd_config#ChrootDirectory) in `/etc/ssh/sshd_config` to a safe path on server.

Atomic write is not support when `ssh/sftp/scp` transfer, make your bundle support [long-term caching](https://developers.google.com/web/fundamentals/performance/webpack/use-long-term-caching), it will be safer when uploading.

## FAQ

### Why unauthorized transfer is not supported?

To make sure unexpected file transferring won't happen.

### Why password is not supported?

Not safe, and typing special characters to the terminal might not easy.

## TroubleShoot

`cpu-features` , optionalDependencie of `ssh2` might trigger error logging when install. just ignore it.
