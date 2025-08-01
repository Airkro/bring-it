import { check } from './check.mjs';
import { logger } from './logger.mjs';
import { scan } from './scan.mjs';
import { execX, getPackageManager } from './utils.mjs';

export async function action({
  preview = false,
  force = false,
  provenance = false,
} = {}) {
  if (!(await check({ force }))) {
    process.exitCode = 1;

    return false;
  }

  const list = await scan({ force });

  if (list.length === 0) {
    return false;
  }

  if (preview) {
    logger.info("Won't publish in preview mode");
  }

  const packageManager = await getPackageManager();

  logger.info('Using', packageManager);

  for (const { dir, name } of list) {
    const label = preview ? '[Preview]' : '[Publish]';

    logger.task(label, name);

    await execX(
      packageManager,
      [
        'publish',
        preview ? '--dry-run' : false,
        provenance ? '--provenance' : false,
        packageManager === 'pnpm' ? '--git-checks=false' : false,
      ].filter(Boolean),
      {
        cwd: dir,
      },
    )
      .then(() => {
        logger.okay(label, name);
      })
      .catch(() => {
        logger.fail(label, name);
        process.exitCode = 1;
      });
  }

  return false;
}
