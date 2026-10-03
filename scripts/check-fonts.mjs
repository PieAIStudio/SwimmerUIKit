/** Fresh browser evidence for the built font contract, not a computed stack claim. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const root = resolve('dist');
const output = resolve(process.argv[2] ?? '.scratch/fonts-validation');
assert.ok(output.startsWith(process.cwd() + sep));
await mkdir(output, { recursive: true });
await writeFile(`${output}/receipt.json`, JSON.stringify({ passed: false, status: 'checking' }));
const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');
  if (url.pathname === '/') {
    const chinese = url.searchParams.get('lang') === 'zh';
    const theme = url.searchParams.get('theme') === 'dark' ? 'dark' : 'light';
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(
      `<!doctype html><html lang="${chinese ? 'zh-CN' : 'en'}" data-game-ui-theme="${theme}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><title>Brand font acceptance</title><style>body{margin:0;padding:48px;background:var(--game-ui-bg);color:var(--game-ui-text);font-family:var(--game-ui-font-body)}main{max-width:880px;margin:auto}h1{font:800 42px/1.4 var(--game-ui-font-display)}p{font-size:20px;line-height:1.9}.weights{display:grid;gap:14px;margin-top:36px}.weights div{font-size:24px;line-height:1.6}small{color:var(--game-ui-text-muted)}</style></head><body><main><small>${chinese ? '真实字体，不只是回退名称' : 'Actual fonts, not just fallback names'}</small><h1 id="heading">${chinese ? '水滴的边，字体的骨架' : 'The shape of a drop'}</h1><p id="body">${chinese ? '中文标题和正文来自包内的资源圆体切分版。文字清楚，边缘圆润；只有用到的字符块才会加载。' : 'The English page loads its Latin faces. Unused Chinese glyph chunks are not requested.'}</p><div class="weights">${[400, 500, 600, 900].map((weight) => `<div id="weight-${weight}" style="font-weight:${weight}">${chinese ? '同一种文字，四种清楚的重量' : 'One readable family, four weights'} ${weight}</div>`).join('')}</div></main></body></html>`,
    );
    return;
  }
  if (!/^\/(?:styles\.css|fonts\/[a-zA-Z0-9/_-]+\.woff2)$/.test(url.pathname)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const file = resolve(root, '.' + url.pathname);
    assert.ok(file.startsWith(root + sep));
    const bytes = await readFile(file);
    response.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : 'font/woff2');
    response.setHeader('Cache-Control', 'no-store');
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const cases = [];
try {
  for (const lang of ['en', 'zh'])
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width: 1100, height: 760 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const fonts = [],
        errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('response', (response) => {
        if (response.request().resourceType() === 'font')
          fonts.push({ url: new URL(response.url()).pathname, status: response.status() });
      });
      await page.goto(`${origin}/?lang=${lang}&theme=${theme}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const session = await context.newCDPSession(page);
      await session.send('DOM.enable');
      await session.send('CSS.enable');
      const { root: documentRoot } = await session.send('DOM.getDocument');
      const actual = {};
      for (const selector of [
        '#heading',
        '#body',
        '#weight-400',
        '#weight-500',
        '#weight-600',
        '#weight-900',
      ]) {
        const { nodeId } = await session.send('DOM.querySelector', {
          nodeId: documentRoot.nodeId,
          selector,
        });
        const result = await session.send('CSS.getPlatformFontsForNode', { nodeId });
        actual[selector] = result.fonts;
        assert.ok(
          result.fonts.some(
            (font) =>
              font.isCustomFont &&
              font.glyphCount > 0 &&
              (lang === 'zh'
                ? font.familyName.startsWith('Swimmer Rounded CN')
                : /Baloo|Geist/.test(font.familyName)),
          ),
          `${lang}/${theme}/${selector}: ${JSON.stringify(result.fonts)}`,
        );
      }
      const chineseRequests = fonts.filter((font) => font.url.startsWith('/fonts/zh/'));
      if (lang === 'en')
        assert.equal(
          chineseRequests.length,
          0,
          'An English-only page must not fetch Chinese chunks',
        );
      else assert.ok(chineseRequests.length > 0, 'Chinese text must load the shipped chunks');
      assert.ok(
        fonts.every((font) => font.status === 200),
        JSON.stringify(fonts),
      );
      assert.deepEqual(errors, []);
      await page.screenshot({ path: `${output}/fonts-${lang}-${theme}.png` });
      cases.push({ lang, theme, actual, fonts, chineseRequests: chineseRequests.length, errors });
      await context.close();
    }
  const css = await readFile('dist/styles.css');
  await writeFile(
    `${output}/receipt.json`,
    JSON.stringify(
      {
        passed: true,
        origin,
        browser: browser.version(),
        cssSha256: createHash('sha256').update(css).digest('hex'),
        cases,
      },
      null,
      2,
    ),
  );
  console.log(
    'Built fonts PASS: real custom Latin/Chinese faces in light/dark; four weights; English requests zero Chinese chunks',
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
