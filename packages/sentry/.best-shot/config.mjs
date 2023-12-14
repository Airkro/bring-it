export const config = {
  target: 'node18',
  output: {
    path: 'dist',
    module: true,
  },
  entry: {
    sub: './lib/cmd.mjs',
  },
  externals: {
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
