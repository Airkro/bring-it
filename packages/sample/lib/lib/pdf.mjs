import { join } from 'node:path';

import { chromium as instance } from 'playwright-core';

import template from './template.txt';

function html([string]) {
  return string;
}

const style = html`<style>
  header {
    display: flex;
    font-family: 'Noto Sans Mono CJK SC', monospace;
    font-size: 8pt;
    text-align: center;
    width: 92%;
    margin: 0 5%;
  }
  .title {
    margin-right: auto;
  }
  .pageNumber {
    margin-right: 4pt;
  }
  .totalPages {
    margin-left: 4pt;
  }
</style>`;

export async function pdf(data, config) {
  const browser = await instance.launch();
  const page = await browser.newPage();

  const mock = JSON.stringify({ ...config, data });

  await page.setContent(
    template.replace('/*inject*/', `window.mock = ${mock}`),
  );

  const options = {
    headerTemplate:
      html`<header>
        <div class="title"></div>
        <span class="pageNumber"></span>/<span class="totalPages"></span>
      </header>` + style,
    footerTemplate: ' ',
  };

  await page.waitForFunction(() => globalThis.document.title);

  await page.pdf({
    path: join(
      process.cwd(),
      '.bring-it',
      'sample',
      `${config.title}_${config.version}_源代码.pdf`,
    ),
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    ...options,
  });

  await page.close();

  await browser.close();
}
