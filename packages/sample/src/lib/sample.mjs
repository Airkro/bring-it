import { readConfig } from '@bring-it/utils';

import { mergeConfig } from './config.mjs';
import { pdf } from './pdf.mjs';
import { picker } from './picker.mjs';
import { scaner } from './scaner.mjs';
import { logger } from './utils.mjs';

export async function action() {
  const configs = await readConfig('sample', logger) //
    .then(({ group }) => mergeConfig(group));

  logger.info(configs);

  for (const config of configs) {
    const files = await scaner(config);
    const code = await picker(files, config);

    const { title, version, company } = config;

    await pdf(code, { title, version, company });
    logger.task('Generated');
  }
}
