import {
  branchCanRelease,
  gitSupport,
  isGitClean,
  isGitDir,
  isGitRoot,
  npmSupport,
} from './git.mjs';
import { logger } from './logger.mjs';

export async function check({ branch }) {
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

    if (!branch && !(await branchCanRelease())) {
      return false;
    }

    if (!(await isGitClean())) {
      return false;
    }
  } catch (error) {
    logger.fail('Checking failed');
    logger.fail(error.message);

    return false;
  }

  return true;
}
