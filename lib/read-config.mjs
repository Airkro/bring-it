import { readFile } from 'fs/promises';
import SSHConfig from 'ssh-config';

function parse(raw, name = 'bring-it') {
  const { Host, ...rest } = SSHConfig.parse(raw).compute(name);
  return Host === '*' ? {} : rest;
}

export async function readConfig(name) {
  const raw = await readFile('.ssh/config', 'utf-8').catch(() => false);

  if (!raw.trim()) {
    return false;
  }

  const {
    user = 'root',
    User = user,
    hostname = '127.0.0.1',
    Hostname = hostname,
    port = 22,
    Port = port,
  } = parse(raw, name);

  return {
    Hostname,
    Port,
    User,
  };
}
