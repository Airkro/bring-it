import { readConfig } from './config.mjs';
import { pdf } from './pdf.mjs';
import { picker, scan } from './picker.mjs';
import { logger } from './utils.mjs';

export async function action({ config: configName }) {
  const configs = await readConfig(configName);

  for (const config of configs) {
    const files = await scan(config);
    const code = await picker(files, config);

    await pdf(code, config);
    logger.task('Generated');
  }
}
