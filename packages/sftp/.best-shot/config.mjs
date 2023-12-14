export const config = {
  target: 'node18',
  output: {
    path: 'dist',
    module: true,
  },
  entry: {
    sub: './lib/cmd.mjs',
  },
  node: {
    __dirname: 'mock',
    __filename: 'mock',
  },
  externals: {
    globby: 'globby',
    'cpu-features': 'node-commonjs cpu-features',
    './crypto/build/Release/sshcrypto.node':
      'node-commonjs ./crypto/build/Release/sshcrypto.node',
  },
};
