import { join } from 'node:path';

import template from './template.txt';

function html([string]) {
  return string;
}

const style = html`
  <style>
    header {
      display: flex;
      margin: 0 5%;
      width: 92%;
      font-size: 10pt;
      font-family: 'Noto Sans Mono CJK SC', monospace;
      text-align: center;
    }
    .title {
      margin-right: auto;
    }
    .pageNumber {
      margin-right: 5pt;
    }
    .totalPages {
      margin-left: 5pt;
    }
  </style>
`;

export async function pdf(data, config) {
  const { chromium: instance } = await import(
    /* webpackIgnore: true */
    'playwright-core'
  );

  const browser = await instance.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const raw = { ...config, data };

  await page.exposeFunction('mock', () => raw, raw);

  await page.setContent(template);

  const options = {
    headerTemplate:
      html`
        <header>
          <div class="title"></div>
          <span class="pageNumber"></span>/
          <span class="totalPages"></span>
        </header>
      ` + style,
    footerTemplate: ' ',
  };

  await page.waitForFunction(
    () => {
      return globalThis.document.title;
    },
    null,
    {
      timeout: 3 * 60 * 1000,
    },
  );

  const { error } = await page
    .pdf({
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
    })
    .catch((error_) => {
      return { error: error_ };
    });

  await page.close();

  await context.close();

  await browser.close();

  if (error) {
    throw error;
  }
}
