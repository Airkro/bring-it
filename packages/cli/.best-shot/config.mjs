export const config = {
  target: 'node14',
  output: {
    path: 'dist',
  },
  entry: {
    cli: './lib/bin.mjs',
  },
  externals: {
    'cpu-features': 'node-commonjs cpu-features',
    './crypto/build/Release/sshcrypto.node':
      'node-commonjs ./crypto/build/Release/sshcrypto.node',
    yargs: 'yargs',
  },
};
