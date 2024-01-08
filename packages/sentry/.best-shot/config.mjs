export const config = {
  target: 'node18',
  output: {
    path: 'dist',
    module: true,
  },
  copy: ['./lib/bin.mjs'],
  entry: {
    sub: './lib/cmd.mjs',
  },
  externals: {
    globby: 'globby',
  },
};
