import { readFileSync } from 'fs';

import pickBy from 'lodash/pickBy.js';
import SSHConfig from 'ssh-config';

export const preset = {
  cwd: '.bring-it',
  conf: '.ssh/config',
};

function parse(raw, name) {
  try {
    const { Host = '*', ...rest } = SSHConfig.parse(raw).compute(name);
    return Host === name ? rest : {};
  } catch {
    return {};
  }
}

function readFile() {
  try {
    const raw = readFileSync(preset.conf, 'utf-8');
    return raw.trim();
  } catch {
    return '';
  }
}

function readConfig(name) {
  const raw = readFile();

  if (!raw) {
    return {};
  }

  const {
    user,
    User = user,
    hostname,
    Hostname = hostname,
    port,
    Port = port,
    path,
    Path = path,
  } = parse(raw, name);

  return {
    hostname: Hostname,
    port: Port ? Number.parseInt(Port, 10) : undefined,
    user: User,
    path: Path,
  };
}

function parseURI(server) {
  try {
    const { username, hostname, port, pathname } = new URL(`sftp://${server}`);
    if (!username || username.includes('%')) {
      return {};
    }
    return { user: username, hostname, port, path: pathname };
  } catch {
    return {};
  }
}

function paramsError(name) {
  throw new Error(`Error: '${name}' is missing`);
}

export function checkServer(server) {
  if (!server) {
    paramsError('server');
  }

  const raw = /\S+@\S+/.test(server);

  const {
    user,
    hostname,
    port = 22,
    path = '/',
  } = pickBy(raw ? parseURI(server) : readConfig(server));

  if (!user) {
    paramsError('user');
  }

  if (!hostname) {
    paramsError('hostname');
  }

  return { user, hostname, port, path: path.replace(/[/\\]+$/, '') };
}
