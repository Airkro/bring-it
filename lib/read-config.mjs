import { readFileSync } from 'fs';

import pickBy from 'lodash/pickBy.js';
import SSHConfig from 'ssh-config';

export const preset = {
  cwd: '.bring-it',
  conf: '.ssh/config',
};

function parse(raw, name) {
  try {
    return SSHConfig.parse(raw).compute(name);
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
    path: `/${Path}`.replace(/[/\\]+/, '/'),
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

function paramsError(message) {
  throw new Error(`Error: ${message}`);
}

export function checkServer(server) {
  if (!server) {
    paramsError('<server> is missing');
  }

  const raw = /\S+@\S+/.test(server);

  const {
    user,
    hostname,
    port = 22,
    path = '/',
  } = pickBy(raw ? parseURI(server) : readConfig(server));

  if (!user) {
    paramsError("'User' is missing in config");
  }

  if (!hostname) {
    paramsError("'Hostname' is missing in config");
  }

  return {
    user,
    hostname,
    port,
    path: path.replace(/[/\\]+$/, ''),
  };
}
