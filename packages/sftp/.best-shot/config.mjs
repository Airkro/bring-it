export const config = {
  target: 'node16',
  output: {
    path: 'dist',
    module: true,
  },
  entry: {
    sub: './lib/cmd.mjs',
    cli: {
      dependOn: 'sub',
      import: './lib/bin.mjs',
    },
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
