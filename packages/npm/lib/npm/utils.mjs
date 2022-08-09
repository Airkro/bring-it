import { execa } from 'execa';

function exec(exe, args, options) {
  return execa(exe, args, {
    cwd: process.cwd(),
    ...options,
  });
}

export function execX(exe, args, options) {
  return exec(exe, args, {
    stdio: [process.stdin, process.stdout, process.stderr],
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
