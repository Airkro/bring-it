import { Logger, readConfig } from '@bring-it/utils/index.mjs';

import { createContent, dingtalk } from './utils.mjs';

const task = 'notify';

const logger = new Logger(task);

const { DingTalkRobotToken } = process.env;

// eslint-disable-next-line consistent-return
export async function action({ mode }) {
  try {
    const { [mode]: config, ...rest } = await readConfig(task, logger);

    const all = { ...rest, ...config };

    logger.json({ mode, ...all });

    if (!(DingTalkRobotToken || all.subscribe?.length)) {
      logger.fail('env.DingTalkRobotToken or config.subscribe is required');

      return false;
    }

    const { markdown, levels } = createContent(all);

    logger.json({ levels });

    if (markdown) {
      if (all.subscribe?.length) {
        for (const { DingTalkRobotToken: token, levels: lv } of all.subscribe) {
          if (
            token &&
            lv?.length &&
            levels.some((level) => lv.includes(level))
          ) {
            dingtalk({ markdown, token });
          }
        }
      } else {
        dingtalk({
          markdown,
          token: DingTalkRobotToken,
        });
      }
    }
  } catch (error) {
    logger.fail(error.message);
  }
}
