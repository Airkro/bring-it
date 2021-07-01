import pAll from 'p-all';
import pRetry from 'p-retry';
import pSeries from 'p-series';

import { scan } from './scan.mjs';
import { logger, withTimeout } from './utils.mjs';

const retryOption = { retries: 5 };

export async function uploadAll(ssh, source, remote) {
  const sftp = await ssh.requestSFTP();

  function sendFile(file) {
    return pRetry(
      () => withTimeout(() => ssh.putFile(file.local, file.remote, sftp), 5000),
      retryOption,
    ).then(
      () => {
        logger.okay(file.name);
      },
      (error) => {
        logger.fail(file.name);
        throw error;
      },
    );
  }

  function sendGroup(group) {
    return pAll(
      group.map((file) => () => sendFile(file)),
      { concurrency: 10 },
    );
  }

  const groups = await scan(source, remote);

  return withTimeout(() =>
    pSeries(groups.map((group) => () => sendGroup(group))),
  );
}
