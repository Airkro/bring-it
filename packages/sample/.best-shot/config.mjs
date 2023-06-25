export const config = {
  target: 'node16',
  output: {
    path: 'dist',
    module: true,
  },
  entry: {
    cli: './lib/bin.mjs',
    sub: './lib/cmd.mjs',
  },
  externals: {
    yargs: 'yargs',
    'playwright-core': 'playwright-core',
  },
};
