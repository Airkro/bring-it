export const config = {
  target: 'node16',
  output: {
    path: 'dist',
    module: true,
    library: {
      type: 'module',
    },
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
