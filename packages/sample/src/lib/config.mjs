import { resolve } from 'node:path';

function checkString(input, name) {
  if (typeof input !== 'string') {
    throw new TypeError(`${name} must be a string`);
  }
}

function checkArray(input, name, string = true) {
  if (!Array.isArray(input)) {
    throw new TypeError(`${name} must be an array`);
  }

  if (string) {
    input.forEach((item, index) => {
      checkString(item, `${name}[${index}]`);
    });
  }
}

export function mergeConfig(group = [{}]) {
  checkArray(group, 'group', false);

  return group.map(
    (
      {
        title = '示例软件名称',
        version = 'v1.0',
        company = '',
        cwd = '.',
        pattern = ['**/*'],
        patterns = pattern,
        prologue = [],
        epilogue = [],
        ignore = ['dist'],
        lineNumber = false,
        extensions = [
          ['js', 'cjs', 'mjs', 'jsx'],
          ['ts', 'cts', 'mts', 'tsx'],
          ['wxs', 'qs'],
          ['html', 'htm', 'xhtml', 'xml', 'svg', 'vue'],
          ['css', 'less', 'scss', 'sass'],
          ['wxss', 'qss', 'ttss', 'jxss', 'acss'],
        ].flat(),
      },
      index,
    ) => {
      checkString(title, `group[${index}].title`);
      checkString(version, `group[${index}].version`);
      checkString(company, `group[${index}].company`);
      checkString(cwd, `group[${index}].cwd`);
      checkArray(patterns, `group[${index}].patterns`);
      checkArray(prologue, `group[${index}].prologue`);
      checkArray(epilogue, `group[${index}].epilogue`);
      checkArray(extensions, `group[${index}].extensions`);
      checkArray(ignore, `group[${index}].ignore`);

      return {
        lineNumber,
        title,
        version,
        company,
        cwd: resolve(process.cwd(), cwd),
        patterns,
        epilogue,
        prologue,
        extensions: extensions.map((extname) => `.${extname}`),
        ignore,
      };
    },
  );
}
