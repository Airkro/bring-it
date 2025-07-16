import * as login from './cmd/login.mjs';
import * as publish from './cmd/publish.mjs';

export const command = 'npm';

export const describe = 'npm commands';

export function builder(cli) {
  cli.command(login).command(publish);
}
