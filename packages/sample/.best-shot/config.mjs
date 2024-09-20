export const config = {
  target: 'node18',
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
    sub: './src/cmd.mjs',
  },
  externals: {
    globby: 'globby',
  },
};
