# @bring-it/sftp

SFTP deployment tool for frontend.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/@bring-it/sftp
[npm-badge]: https://img.shields.io/npm/v/@bring-it/sftp.svg?style=flat-square&logo=npm
[github-url]: https://github.com/airkro/bring-it/tree/master/packages/sftp
[github-badge]: https://img.shields.io/npm/l/@bring-it/sftp.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/@bring-it/sftp.svg?style=flat-square&colorB=green&logo=node.js

`@bring-it/sftp` follows the principle of [Convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration), provide [sftp](https://man.openbsd.org/sftp) like but lite version Command-Line Interface.

## Installation

```sh
npm install @bring-it/sftp --global
```

## Usage

```sh
bring-it [command] <options>
```

## Commands

### bring-it sftp

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

When <server> not match URI, `bring-it` will treat it as a Host name in `.ssh/config`.

It support [.ssh/config](https://man.openbsd.org/ssh_config.5) like config with keys: `Hostname, Port, User`, and a custom key: `Path`

```sh
bring-it sftp dev
```

```properties
# example: .ssh/config

# other Host will inherit from *
Host *
  User root

# = root@192.168.1.200:22/mnt
Host dev
  Hostname 192.168.1.200
  Path /mnt

# = deploy@example.org:2222
Host docs
  Hostname example.org
  Port 2222
  User deploy
```

**Tips:** this tool will read `env.SSH_PRIVATE_KEY_PATH` when no `--key` arguments passing.

### bring-it pack

```properties
bring-it pack [target...]

Pack files when support

Positionals:
  target  glob pattern of files or directories  [array]

Options:
  -n, --name  archive output file name  [default: "pack"]
```

## Tips

For a little bit safer, `@bring-it/sftp` will always upload files in order by: `OTHER, SVG, STYLE, SCRIPT, HTML, XML/JSON/YAML` .

Not like the HTTP URL, in the SFTP URI, `Port` is 22 by default.

`Path` will point to `/` by default, so don't forget set [ChrootDirectory](https://man.openbsd.org/sshd_config#ChrootDirectory) in `/etc/ssh/sshd_config` to a safe path on server.

Atomic write is not support when `ssh/sftp/scp` transfer, make your bundle support [long-term caching](https://developers.google.com/web/fundamentals/performance/webpack/use-long-term-caching), it will be safer when uploading.

## FAQ

### Why unauthorized transfer is not supported?

To make sure unexpected file transferring won't happen.

### Why password is not supported?

Not safe, and typing special characters to the terminal might not easy.
