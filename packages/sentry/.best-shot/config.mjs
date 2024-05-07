export const config = {
  target: 'node18',
  output: {
    path: 'dist',
    module: true,
  },
  copy: {
    from: '@bring-it/utils/bin.mjs',
    context: '../../node_modules',
  },
  entry: {
    sub: './lib/cmd.mjs',
  },
  externals: {
    globby: 'globby',
  },
};
