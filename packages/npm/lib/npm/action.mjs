import { check } from './check.mjs';
import { logger } from './logger.mjs';
import { scan } from './scan.mjs';
import { execX } from './utils.mjs';

export async function action({ preview = false } = {}) {
  if (!(await check())) {
    process.exitCode = 1;

    return false;
  }

  const list = await scan();

  if (list.length === 0) {
    return false;
  }

  if (preview) {
    logger.info("Won't publish in preview mode");

    return false;
  }

  for (const { dir, name } of list) {
    logger.task('[Publishing]', name);

    await execX('npm', ['publish'], { cwd: dir })
      .then(() => {
        logger.okay('[Published]', name);
      })
      .catch(() => {
        logger.fail('[Publish]', name);
        process.exitCode = 1;
      });
  }

  return false;
}
