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
  externals: {
    yargs: 'yargs',
  },
};
