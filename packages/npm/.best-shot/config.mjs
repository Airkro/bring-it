export const config = {
  target: 'node18',
  output: {
    path: 'dist',
    module: true,
  },
  copy: ['./src/bin.mjs'],
  entry: './src/cmd.mjs',
};
