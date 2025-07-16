export const config = {
  target: 'node20',
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
  entry: './src/cmd.mjs',
};
