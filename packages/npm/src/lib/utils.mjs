import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { execa } from 'execa';

function exec(exe, args, options) {
  return execa(exe, args, {
    cwd: process.cwd(),
    ...options,
  });
}

export function execX(exe, args, options) {
  return exec(exe, args, {
    stdio: 'inherit',
    ...options,
  });
}

export function Exec(exe, args, options) {
  return exec(exe, args, options).then(({ stdout, stderr }) => {
    if (stderr) {
      throw new Error(stderr);
    }

    return stdout?.trim();
  });
}

export function readJSON(file) {
  return readFile(file, 'utf8').then((raw) => JSON.parse(raw));
}

export async function getPackageManager() {
  const pkg = resolve(process.cwd(), 'package.json');

  return readJSON(pkg)
    .then(({ packageManager = 'npm' }) => packageManager.split('@')[0])
    .catch(() => 'npm');
}
