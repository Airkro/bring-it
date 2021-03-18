import { logger } from './logger.mjs';
import { Queue } from './queue.mjs';
import { scan } from './scan.mjs';

export async function upload(ssh, source, remote) {
  const groups = await scan(source, remote);

  const sftp = await ssh.requestSFTP();

  return Queue({
    groups,
    action(file) {
      return ssh.putFile(file.local, file.remote, sftp);
    },
    onOkay(file) {
      logger.okay(file.name);
    },
    onFail(file) {
      logger.fail(file.name);
    },
  });
}
