import { Logger } from '@bring-it/utils';
import { Json } from 'fs-chain';

const logger = new Logger('sample');

export function mergeConfig(configs) {
  return configs.map(
    ({
      cwd = '.',
      pattern = [
        '**/*.{,c,m}{j,t}s',
        '**/*.{t,j}sx',
        '**/*.{c,sc,le,wx,q,tt,jx,ac}ss',
        '**/*.{html,htm,vue,svg}',
        '**/*.{wx,q}s',
      ],
      ignore = ['dist'],
      title = '示例软件名称',
      version = 'v1.0',
    }) => ({
      title,
      version,
      cwd,
      pattern,
      ignore,
    }),
  );
}

export function readConfig(config) {
  return new Json()
    .source(config)
    .onFail((error) => {
      logger.warn(error.message);
      logger.info('Fallback to default configuration');

      return [{}];
    })
    .onDone(mergeConfig);
}
