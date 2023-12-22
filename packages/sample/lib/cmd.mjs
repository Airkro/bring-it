export const command = 'sample';

export const describe = 'Generate code sample files';

export function builder() {}

export function handler() {
  import('./lib/sample.mjs')
    .then(({ action }) => action())
    .catch((error) => {
      process.exitCode = 1;
      console.error(error);
    });
}
