export const config = {
  target: 'node18',
  output: {
    path: 'dist',
    module: true,
    library: {
      type: 'module',
    },
  },
  entry: {
    cli: './lib/bin.mjs',
  },
  externals: {
    yargs: 'yargs',
    globby: 'globby',
  },
  optimization: {
    // splitChunks: {
    //   cacheGroups: {
    //     vendors: {
    //       name: 'share',
    //       chunks: 'all',
    //       minChunks: 2,
    //       enforce: true,
    //       reuseExistingChunk: true,
    //     },
    //   },
    // },
  },
};
