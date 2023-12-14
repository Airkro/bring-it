export const config = {
  target: 'node16',
  output: {
    path: 'dist',
    module: true,
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
