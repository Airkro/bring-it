import {
  branchCanRelease,
  gitSupport,
  isGitClean,
  isGitDir,
  isGitRoot,
  npmSupport,
} from './git.mjs';
import { logger } from './logger.mjs';

export async function check({ force }) {
  logger.task('Checking the working directory...');

  try {
    if (!(await npmSupport())) {
      return false;
    }

    if (!(await gitSupport())) {
      return false;
    }

    if (!(await isGitDir())) {
      return false;
    }

    if (!(await isGitRoot())) {
      return false;
    }

    if (!force && !(await branchCanRelease())) {
      return false;
    }

    if ((process.env.CI ? true : !force) && !(await isGitClean())) {
      return false;
    }
  } catch (error) {
    logger.fail('Checking failed');
    logger.fail(error.message);

    return false;
  }

  return true;
}
