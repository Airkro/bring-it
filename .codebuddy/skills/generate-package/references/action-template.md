# Action module template

File: `src/lib/<name>.mjs` (or `lib/action.mjs`). Contains the real logic,
exported as `async function action(io)`. Use shared helpers from
`@bring-it/utils`.

```js
import { Logger, readConfig } from '@bring-it/utils';

const task = '<name>';

const logger = new Logger(task);

export async function action(
  // eslint-disable-next-line no-empty-pattern
  {
    /* options from builder */
  }
) {
  try {
    const config = await readConfig(task, logger);

    logger.json(config);

    // ... do the work ...

    logger.okay('done');
  } catch (error) {
    logger.fail(error.message);
    process.exitCode = 1;

    return false;
  }
}
```

Notes:

- `readConfig(name, logger)` reads `.bring-it/<name>.config.json` and is
  branch-aware (via `BRANCH_NAME` from `@bring-it/notify`).
- `new Logger(name)` prefixes output with `[bring-it:<name>]` and provides
  `.okay()`, `.fail()`, `.warn()`, `.task()`, `.file()`, `.info()`, `.json()`.
- `http({ url, query, json, method })` is a small JSON fetch helper.
- Set `process.exitCode = 1` on failure so CI stops.
