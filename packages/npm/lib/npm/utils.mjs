import { execa } from 'execa';

export function exec(exe, args, options) {
  return execa(exe, args, {
    cwd: process.cwd(),
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
