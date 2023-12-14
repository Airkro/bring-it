export const config = {
  target: 'node18',
  output: {
    path: 'dist',
    module: true,
  },
  entry: {
    sub: './lib/cmd.mjs',
  },
};
