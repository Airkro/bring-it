import { check } from './check.mjs';
import { logger } from './logger.mjs';
import { scan } from './scan.mjs';
import { execX } from './utils.mjs';

export async function action({ preview = false, force = false } = {}) {
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

  for (const { dir, name } of list) {
    if (preview) {
      logger.task('[Preview]', name);

      await execX('npm', ['publish', '--dry-run'], { cwd: dir })
        .then(() => {
          logger.okay('[Preview]', name);
        })
        .catch(() => {
          logger.fail('[Preview]', name);
          process.exitCode = 1;
        });
    } else {
      logger.task('[Publishing]', name);

      await execX('npm', ['publish'], { cwd: dir })
        .then(() => {
          logger.okay('[Published]', name);
        })
        .catch(() => {
          logger.fail('[Published]', name);
          process.exitCode = 1;
        });
    }
  }

  return false;
}
