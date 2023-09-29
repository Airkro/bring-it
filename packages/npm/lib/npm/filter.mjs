import isUrl from 'is-url';
import semver from 'semver';
import validate from 'validate-npm-package-name';

import { logger } from './logger.mjs';

export function filter(pkg, env) {
  if (pkg.private) {
    logger.info('[package is private]', pkg.name);

    return false;
  }

  if (!pkg.name || !validate(pkg.name).validForNewPackages) {
    logger.warn("[pkg.name isn't valid]", pkg.pkg);

    return false;
  }

  if (!pkg.version || !semver.valid(pkg.version)) {
    logger.warn("[pkg.version isn't valid]", pkg.pkg);

    return false;
  }

  if (!pkg.publishConfig?.registry) {
    logger.info('[Registry undefined]', pkg.name);

    return false;
  }

  if (!isUrl(pkg.publishConfig.registry)) {
    logger.warn("[pkg.publishConfig.registry isn't valid]", pkg.name);

    return false;
  }

  if (pkg.name.startsWith('@') && pkg.publishConfig.access !== 'public') {
    logger.info("[pkg.publishConfig.access isn't public]", pkg.name);

    return false;
  }

  if (pkg.engines?.node) {
    if (!semver.validRange(pkg.engines.node)) {
      logger.warn("[pkg.engines.node isn't valid]", pkg.pkg);

      return false;
    }

    if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
      logger.warn("[pkg.engines.node isn't match]", pkg.pkg);

      return false;
    }
  }

  const { packageManager } = pkg;

  if (pkg.engines?.[packageManager]) {
    if (!semver.validRange(pkg.engines[packageManager])) {
      logger.warn(`[pkg.engines.${packageManager} isn't valid]`, pkg.pkg);

      return false;
    }

    if (
      env.packageManager.version &&
      !semver.satisfies(env.packageManager.version, pkg.engines[packageManager])
    ) {
      logger.warn(`[pkg.engines.${packageManager} isn't match]`, pkg.pkg);

      return false;
    }
  }

  return true;
}
