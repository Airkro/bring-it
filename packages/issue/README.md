# @bring-it/issue

Generate a GitHub issue deep link that prefills an issue form, straight from
the command line.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/@bring-it/issue
[npm-badge]: https://img.shields.io/npm/v/@bring-it/issue.svg?style=flat-square&logo=npm
[github-url]: https://github.com/Airkro/bring-it/tree/master/packages/issue
[github-badge]: https://img.shields.io/npm/l/@bring-it/issue.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/@bring-it/issue.svg?style=flat-square&colorB=green&logo=node.js

## Installation

```bash
npm i @bring-it/issue -D
```

## Usage

```bash
bring-it issue \
  --repo owner/name \
  --template bug_report.yml \
  --field what-happened="It crashed on launch" \
  --field severity=Critical
```

The generated link is written to **stdout only**, so it can be piped into
`gh` or copied directly:

```bash
bring-it issue -r owner/name -f what-happened="boom" | xargs gh issue create --web
```

## Options

| Option            | Alias | Description                                                      |
| :---------------- | :---- | :--------------------------------------------------------------- |
| `--repo`          | `-r`  | GitHub repository in `owner/name` format (required)              |
| `--template`      | `-t`  | Issue form file name (default `bug_report.yml`)                  |
| `--template-dir`  |       | Directory that contains the issue templates                      |
| `--title`         |       | Issue title (defaults to the template title)                     |
| `--labels`        |       | Comma separated labels (defaults to the template labels)         |
| `--field`         | `-f`  | Field value as `id=value`, repeatable                            |
| `--data`          | `-d`  | Path to a JSON file mapping field ids to values                  |
| `--json`          |       | Output the result as JSON                                        |
| `--auto-compress` |       | Compress missing field values from the tier title (default true) |

A field value prefixed with `@` is read from a file, e.g.
`--field logs=@./error.log`.

When a field has no value, `--auto-compress` (or `--no-auto-compress` to
disable) derives one from the field's title and id so the link never ships
an empty `field.*` query parameter.
