# package.json templates

## CLI command package

```json
{
  "name": "@bring-it/<name>",
  "version": "0.0.1",
  "description": "<short description>",
  "license": "MIT",
  "author": {
    "name": "Eric Chen",
    "email": "airkro@qq.com"
  },
  "keywords": ["bring-it", "ci", "cli", "<name>"],
  "homepage": "https://github.com/Airkro/bring-it/tree/master/packages/<name>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Airkro/bring-it.git",
    "directory": "packages/<name>"
  },
  "bugs": {
    "url": "https://github.com/Airkro/bring-it/issues"
  },
  "bin": {
    "bring-it": "dist/bin.mjs"
  },
  "main": "dist/sub.mjs",
  "files": ["dist"],
  "type": "module",
  "scripts": {
    "build": "best-shot prod",
    "prepublishOnly": "pnpm run build"
  },
  "dependencies": {
    "globby": "catalog:"
  },
  "peerDependencies": {
    "@bring-it/cli": "workspace:^"
  },
  "engines": {
    "node": ">=22.22.2"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

## Library package (private)

```json
{
  "private": true,
  "name": "@bring-it/<name>",
  "version": "0.0.0",
  "bin": {
    "bring-it": "bin.mjs"
  },
  "main": "index.mjs",
  "type": "module",
  "dependencies": {
    "chalk": "catalog:"
  },
  "peerDependencies": {
    "@bring-it/cli": "workspace:^"
  },
  "engines": {
    "node": ">=22.22.2"
  }
}
```
