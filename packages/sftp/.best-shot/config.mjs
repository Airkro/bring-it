export const config = {
  target: 'node14',
  output: {
    path: 'dist',
    module: true,
  },
  entry: {
    cli: './lib/bin.mjs',
    sub: './lib/cmd.mjs',
  },
  node: {
    __dirname: 'mock',
    __filename: 'mock',
  },
  externals: {
    'cpu-features': 'node-commonjs cpu-features',
    './crypto/build/Release/sshcrypto.node':
      'node-commonjs ./crypto/build/Release/sshcrypto.node',
    yargs: 'yargs',
  },
};
