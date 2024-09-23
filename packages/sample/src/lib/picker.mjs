import { readFile } from 'node:fs/promises';

import { logger } from './utils.mjs';

const LINE_NUMBERS = 3025;

class Store extends Map {
  constructor() {
    super([
      ['prologue', []],
      ['patterns', []],
      ['epilogue', []],
    ]);
  }

  toLists() {
    return [
      ...this.get('prologue'),
      ...this.get('patterns'),
      ...this.get('epilogue'),
    ].flat();
  }

  length() {
    return (
      this.get('prologue').length +
      this.get('patterns').length +
      this.get('epilogue').length
    );
  }
}

const lineBreak = /(\r\n|\n|\r)+/;

function readLine(file) {
  return readFile(file.path, 'utf8').then((code) =>
    code.split(lineBreak).filter((line) => line.trim() !== ''),
  );
}

async function mapper(io, key, lists) {
  const patterns = lists[key];

  for (const file of patterns) {
    if (LINE_NUMBERS > io.length()) {
      await readLine(file)
        .then((lines) => {
          io.get(key).push(...lines);

          logger.okay(file.name);
        })
        .catch((error) => {
          logger.fail(file.name);
          throw error;
        });
    } else {
      break;
    }
  }
}

export async function picker(lists) {
  const io = new Store();

  await mapper(io, 'prologue', lists);
  await mapper(io, 'epilogue', lists);
  await mapper(io, 'patterns', lists);

  return io.toLists().join('\n').trim();
}
