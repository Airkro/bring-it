import isUrl from 'is-url';
import semver from 'semver';
import validate from 'validate-npm-package-name';

import { logger } from './logger.mjs';

export function filter(pkg) {
  if (pkg.private) {
    logger.info(pkg.name, 'is private');

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
    if (!semver.valid(pkg.engines.node)) {
      logger.warn("[pkg.engines.node isn't valid]", pkg.pkg);

      return false;
    }

    if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
      logger.warn("[pkg.engines.node isn't match]", pkg.pkg);

      return false;
    }
  }

  return true;
}
