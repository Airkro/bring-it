# Github actions for `bring-it`

## Usage

Create `.github\workflows\bring-it.yaml`

```yaml
name: bring-it

on:
  push:
    branches:
      - master

jobs:
  test:
    strategy:
      matrix:
        os:
          - macos-latest
          - windows-latest
          - ubuntu-latest
        node:
          - current
          - lts/*
          - lts/-1
        exclude:
          - os: ubuntu-latest
            node: lts/*
    runs-on: ${{ matrix.os }}
    steps:
      - name: Run
        uses: airkro/bring-it@actions
        with:
          node-version: ${{ matrix.node }}

  publish:
    needs: [test]
    runs-on: ubuntu-latest
    env:
      node-version: lts/*
    steps:
      - name: Run
        uses: airkro/bring-it@actions
        with:
          npm-token: ${{ secrets.NPM_TOKEN }}
```
