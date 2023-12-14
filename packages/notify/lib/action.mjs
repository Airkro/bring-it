import { Logger, readConfig } from '@bring-it/utils/index.mjs';

import { createContent, dingtalk } from './utils.mjs';

const task = 'notify';

const logger = new Logger(task);

const { DingTalkRobotToken } = process.env;

// eslint-disable-next-line consistent-return
export async function action({ mode }) {
  if (!DingTalkRobotToken) {
    logger.fail('env.DingTalkRobotToken is required');

    process.exitCode = -1;

    return false;
  }

  try {
    const { [mode]: config, ...rest } = await readConfig(task, logger);

    const all = { ...rest, ...config };

    logger.json({ mode, ...all });

    dingtalk({
      markdown: createContent(all),
      title: all.project || 'bring-it',
      token: DingTalkRobotToken,
    })
      .then((resp) => {
        logger.okay(resp.status);
      })
      .catch((error) => {
        console.error(error);
        process.exitCode = 1;
      });
  } catch (error) {
    logger.fail(error.message);
  }
}
