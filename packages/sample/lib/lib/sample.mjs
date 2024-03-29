import { readConfig } from '@bring-it/utils';

import { mergeConfig } from './config.mjs';
import { pdf } from './pdf.mjs';
import { picker, scan } from './picker.mjs';
import { logger } from './utils.mjs';

export async function action() {
  const configs = await readConfig('sample', logger).then(({ group }) =>
    mergeConfig(group),
  );

  for (const config of configs) {
    const files = await scan(config);
    const code = await picker(files, config);

    await pdf(code, config);
    logger.task('Generated');
  }
}
