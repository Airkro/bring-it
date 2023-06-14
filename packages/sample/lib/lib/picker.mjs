import { Text } from 'fs-chain';

const lineBreak = /(\r\n|\n|\r)+/;
const lineBreakAll = /^(\r\n|\n|\r)+$/;

export async function picker(lists) {
  const io = [];

  for (const file of lists) {
    if (io.length < 3050) {
      const lines = await new Text()
        .source(file)
        .onDone((code) => code.split(lineBreak))
        .onDone((code) => code.filter((line) => !lineBreakAll.test(line)))
        .onDone((code) => code.filter((line) => !/\s*\/\//.test(line)));

      io.push(...lines);
    } else {
      break;
    }
  }

  return io.join('\n').trim();
}
