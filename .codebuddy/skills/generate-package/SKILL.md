---
name: generate-package
description: >-
  This skill should be used when scaffolding, creating, or generating a new npm
  package under packages/* in the bring-it monorepo (e.g. a new @bring-it/*
  CLI command package or a shared library package). It encodes the repository's
  conventions for package.json, source layout, best-shot build configuration,
  CLI command registration in @bring-it/cli, README, catalog dependencies, and
  version consistency so a new package matches existing ones.
---

# Generate a @bring-it package

Create a new package that follows the established bring-it monorepo conventions.
The repo is a pnpm workspace at `packages/*`; every public package is named
`@bring-it/<name>` and lives in `packages/<name>/`.

## When to use

- User asks to "create / add / scaffold / generate a new package" in this repo.
- User wants a new `bring-it` subcommand (e.g. `bring-it <newcmd>`).
- User wants to extract shared logic into a new `@bring-it/*` library.

## Package archetypes

There are two kinds of packages. Pick one before starting.

### 1. CLI command package (publishable, registers a subcommand)

Examples: `notify`, `npm`, `sample`, `sentry`, `sftp`.

- Builds with `best-shot` into `dist/`, then publishes to npm.
- Exposes a `bring-it` subcommand that is wired into `@bring-it/cli`.
- References `@bring-it/cli` via `peerDependencies` (`workspace:^`).
- Source lives in `src/` (sample, npm) **or** `lib/` (notify, sentry, sftp).
  Match the layout of the package most similar to the new one.

### 2. Library package (private, imported by others)

Example: `utils`.

- `"private": true`, no build step, `main` points at source `.mjs` directly.
- Imported by other packages via `workspace:^` peer dependency.
- No `bin`, no `dist`, no `.best-shot/config.mjs`.

## Workflow

### Step 1 — Decide name and archetype

- Name the directory `packages/<name>/` and the package `@bring-it/<name>`.
- Keep `<name>` short and kebab-case. Add it to `README.md` package list.
- Choose archetype 1 (CLI command) or 2 (library) above.

### Step 2 — Create `package.json`

Copy the closest existing package's `package.json` and adapt. For a CLI command
package use the template in `references/package-template.md`; for a library
package mirror `packages/utils/package.json`.

Required fields for CLI command packages:

- `name`, `version` (own semver, e.g. start at `0.0.1`), `description`,
  `license: "MIT"`.
- `author`: `{ "name": "Eric Chen", "email": "airkro@qq.com" }`.
- `keywords`: always include `"bring-it"`, `"ci"`, `"cli"`.
- `homepage`, `repository.directory`, `bugs` point at
  `https://github.com/Airkro/bring-it` (see template).
- `bin`: `{ "bring-it": "dist/bin.mjs" }`, `main`: `"dist/sub.mjs"`,
  `files`: `["dist"]`, `type`: `"module"`.
- `scripts`: `{ "build": "best-shot prod", "prepublishOnly": "pnpm run build" }`.
- `peerDependencies`: `{ "@bring-it/cli": "workspace:^" }`.
- `engines`: `{ "node": ">=22.22.2" }`.
- `publishConfig`: `{ "access": "public", "registry": "https://registry.npmjs.org/" }`.

### Step 3 — Add dependencies to the catalog

Any runtime/dev dependency must reference the workspace catalog with
`"catalog:"` (e.g. `"globby": "catalog:"`). If the dependency is not yet in
`pnpm-workspace.yaml` `catalog:`, add it there with an appropriate version
range before writing it into `package.json`. Do **not** pin raw versions in a
package's `package.json` (syncpack will fail).

### Step 4 — Create the source layout

For a CLI command package:

- Create the command module `src/cmd.mjs` (or `lib/cmd.mjs`) exporting
  `command`, `describe`, `builder`, and `handler`. The `handler` must
  dynamically `import()` the action module so errors are caught and
  `process.exitCode = 1` is set on failure. See
  `references/command-template.md`.
- Create the action module (`src/lib/<name>.mjs` or `lib/action.mjs`) exporting
  `async function action(io)`. Use `Logger` and `readConfig` from
  `@bring-it/utils` (import `@bring-it/utils` or `@bring-it/utils/index.mjs`).
  See `references/action-template.md`.
- Support nested subcommands by exporting multiple command modules from
  `cmd.mjs` and attaching them in `builder()` (see `packages/npm/src/cmd.mjs`).

For a library package:

- Create `index.mjs` (and `bin.mjs` only if it needs a CLI entry). Export the
  public API. Mirror `packages/utils/`.

### Step 5 — Create `.best-shot/config.mjs`

Only for CLI command packages. Copy the `.best-shot/config.mjs` from the most
similar existing package and adjust:

- `target`: currently `node18`/`node20`/`node22` — match siblings.
- `output`: `{ path: 'dist', module: true, library: { type: 'module' } }`.
- `entry`: `{ sub: './src/cmd.mjs' }` (src layout) or
  `{ sub: './lib/cmd.mjs' }` (lib layout). `@bring-it/cli` uses a named `cli`
  entry instead.
- `copy`: `{ from: '@bring-it/utils/bin.mjs', context: '../../node_modules' }`
  to produce `dist/bin.mjs` (the launcher wrapper). Omit for `@bring-it/cli`.
- `externals`: list each `catalog:` runtime dep as `{ "<dep>": "<dep>" }` so it
  stays external at runtime.

### Step 6 — Register the subcommand in `@bring-it/cli`

Open `packages/cli/lib/bin.mjs` and add a line after the existing
`commandSafe(...)` calls:

```text
.commandSafe('@bring-it/<name>');
```

`@bring-it/cli` dynamically loads the package's `main` (`dist/sub.mjs`) to
register its command, so no other wiring is needed.

### Step 7 — Add a README

For publishable packages create `packages/<name>/README.md` mirroring an existing
one (badges, Installation, Usage, Commands). Keep it minimal for libraries.

### Step 8 — Verify

Run from the repo root:

```bash
pnpm install                 # link the new workspace package
pnpm --filter @bring-it/<name> build
pnpm run lint:version        # syncpack: ensure catalog usage / version consistency
pnpm -r --filter @bring-it/<name> exec bring-it <name> --help
```

Fix any lint, build, or syncpack errors before considering the task done.

## Quick reference

- Workspace root: `pnpm-workspace.yaml` (catalog) and `syncpack.config.mjs`.
- Shared helpers: `packages/utils` (`Logger`, `readConfig`, `http`, `ignore`).
- Root CLI entry / command registry: `packages/cli/lib/bin.mjs`.
- Config files are read from `.bring-it/<name>.config.json` via `readConfig`.
