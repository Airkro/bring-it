export const config = {
  target: 'node18',
  output: {
    path: 'dist',
    module: true,
  },
  entry: {
    sub: './lib/cmd.mjs',
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
