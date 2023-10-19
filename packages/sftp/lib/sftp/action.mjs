export async function action(options, { cwd, path }) {
  const { SSH } = await import('./ssh.mjs');
  const { upload } = await import('./upload.mjs');

  return SSH(options, (ssh) => upload(ssh, cwd, path));
}
