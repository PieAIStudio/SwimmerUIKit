/** S4 review evidence from the built product, never a reimplementation.
 * Writes only ignored .scratch evidence. Each server gets its own free port. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { preview } from 'vite';
import { STYLE_NAMES } from './lib/control-style-contract.mjs';

const output = path.resolve(process.argv[2] ?? '.scratch/s4/review');
assert.ok(output.startsWith(`${process.cwd()}/.scratch/`), 'Keep evidence in .scratch');
const browserName = process.argv[3] ?? 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(browserName));
await mkdir(output, { recursive: true });
const server = await preview({
  configFile: false,
  build: { outDir: 'site-dist' },
  preview: { host: '127.0.0.1', port: 0 },
});
const address = server.httpServer.address();
const origin = `http://127.0.0.1:${address.port}`;
const browser = await { chromium, firefox, webkit }[browserName].launch();
const evidence = {
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  status: 'S4 working tree; awaiting review before commit',
  testedAt: new Date().toISOString(),
  browser: browser.version(),
  browserName,
  deviceScaleFactor: 1,
  siteEntrySha256: createHash('sha256')
    .update(await readFile('site-dist/index.html'))
    .digest('hex'),
  cases: [],
  errors: [],
};
const file = (name) => path.join(output, name);
const closeServer = () => new Promise((resolve) => server.httpServer.close(resolve));
const sameBox = (a, b, label) => {
  for (const key of ['x', 'y', 'width', 'height'])
    assert.ok(Math.abs(a[key] - b[key]) < 0.01, `${label}: native ${key} moved`);
};
async function crop(page, name, rect, margin = 12) {
  const viewport = page.viewportSize();
  const x = Math.max(0, Math.floor(rect.x - margin)),
    y = Math.max(0, Math.floor(rect.y - margin));
  return page.screenshot({
    path: file(name),
    clip: {
      x,
      y,
      width: Math.min(viewport.width - x, Math.ceil(rect.width + 2 * margin)),
      height: Math.ceil(rect.height + 2 * margin),
    },
    animations: 'disabled',
    caret: 'hide',
  });
}
async function enlargePixels(page, bytes, name, scale = 8) {
  const png = await page.evaluate(
    async ({ base64, scale }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width * scale;
      canvas.height = image.height * scale;
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png').split(',')[1];
    },
    { base64: bytes.toString('base64'), scale },
  );
  await writeFile(file(name), Buffer.from(png, 'base64'));
}
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1200 },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', (error) => evidence.errors.push(error.message));
  for (const style of STYLE_NAMES)
    for (const theme of ['light', 'dark']) {
      const id = `${style}-${theme}`;
      await page.goto(`${origin}/?view=theme-review&style=${style}&theme=${theme}`, {
        waitUntil: 'networkidle',
      });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() =>
        [...document.querySelectorAll('.theme-review .game-ui-droplet')].every(
          (svg) => svg.dataset.ready === 'true' && svg.querySelector('path').getAttribute('d'),
        ),
      );
      await page.waitForTimeout(300);
      await page.screenshot({
        path: file(`${id}-overview.png`),
        fullPage: true,
        animations: 'disabled',
      });
      const row = { id, style, theme, press: [], guide: null };
      const paint = await page.locator('.theme-review [data-game-ui-paint]').evaluateAll((nodes) =>
        nodes
          .filter((node) => !node.matches('[data-game-ui-cta="true"]'))
          .map((node) => {
            const css = getComputedStyle(node);
            return {
              label: node.textContent?.trim().slice(0, 60),
              shadow: css.boxShadow,
              image: css.backgroundImage,
              filter: css.filter,
              transform: css.transform,
              lip: css.getPropertyValue('--game-ui-button-lip-depth'),
            };
          }),
      );
      for (const item of paint) {
        assert.equal(item.shadow, 'none', `${id}/${item.label}: shadow`);
        assert.equal(item.image, 'none', `${id}/${item.label}: gradient`);
        assert.equal(item.filter, 'none', `${id}/${item.label}: filter`);
        assert.equal(item.transform, 'none', `${id}/${item.label}: transformed target`);
        assert.equal(item.lip, '', `${id}/${item.label}: retired lip`);
      }
      row.flatControls = paint.length;
      assert.equal(await page.locator('.theme-review button[data-game-ui-cta="true"]').count(), 1);
      for (const name of ['ordinary', 'cta']) {
        const control = page.locator(`[data-review="${name}"]`);
        const before = await control.boundingBox();
        const contour =
          name === 'ordinary' ? await control.locator('path').getAttribute('d') : null;
        await crop(page, `${id}-${name}-rest.png`, before, name === 'cta' ? 20 : 12);
        await control.hover();
        await page.mouse.down();
        await page.waitForTimeout(170);
        const after = await control.boundingBox();
        sameBox(before, after, `${id}/${name}`);
        if (name === 'ordinary') {
          assert.notEqual(
            await control.locator('path').getAttribute('d'),
            contour,
            'A flat press must deform',
          );
          assert.equal(await control.locator('svg').getAttribute('data-pressed'), 'true');
        } else {
          assert.equal(
            await page.locator('.game-ui-cta-decoration').getAttribute('data-liquid-active'),
            'true',
          );
        }
        await crop(page, `${id}-${name}-pressed.png`, before, name === 'cta' ? 20 : 12);
        await page.mouse.up();
        await page.mouse.move(0, 0);
        if (name === 'ordinary')
          await page.waitForFunction(
            (d) => document.querySelector('[data-review="ordinary"] path')?.getAttribute('d') === d,
            contour,
          );
        row.press.push({ name, before, after, nativeTargetFixed: true });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      const longRow = page.locator('.theme-review .game-ui-list-row').first();
      const longRect = await longRow.boundingBox();
      await crop(page, `${id}-row.png`, longRect);
      const edge = await page.screenshot({
        path: file(`${id}-edge-dpr1.png`),
        clip: {
          x: Math.ceil(longRect.x + 20),
          y: Math.floor(longRect.y - 4),
          width: Math.floor(longRect.width - 40),
          height: 12,
        },
      });
      await enlargePixels(page, edge, `${id}-edge-8x.png`);
      const vector = await longRow.locator(':scope > svg path').evaluate((node) => ({
        vectorEffect: node.getAttribute('vector-effect'),
        filter: getComputedStyle(node).filter,
        path: node.getAttribute('d'),
        stroke: getComputedStyle(node).strokeWidth,
      }));
      assert.equal(vector.vectorEffect, 'non-scaling-stroke');
      assert.equal(vector.filter, 'none');
      row.edge = { ...vector, originalDpr: 1, zoom: 8, imageSmoothing: false };

      await page.locator('[data-review="guide-target"]').click();
      const guide = page.locator('.game-ui-liquid-presence-label--guide');
      await guide.waitFor({ state: 'visible' });
      await page.waitForFunction(
        () =>
          document
            .querySelector('.theme-review .game-ui-liquid-presence')
            ?.getAttribute('data-liquid-phase') === 'dock',
      );
      await page.waitForTimeout(400);
      assert.equal(
        await guide.locator('.game-ui-liquid-reveal').count(),
        1,
        'Guide uses the same material panel',
      );
      const layer = page.locator('[data-presence-overlay]');
      assert.equal(await layer.getAttribute('data-game-ui-theme'), theme);
      assert.equal(await layer.getAttribute('data-game-ui-style'), style);
      const guideBox = await guide.boundingBox();
      assert.ok(
        guideBox.x >= 0 &&
          guideBox.y >= 0 &&
          guideBox.x + guideBox.width <= 1280 &&
          guideBox.y + guideBox.height <= 1200,
        `${id}: guide stays in viewport`,
      );
      await page.screenshot({ path: file(`${id}-guide.png`), animations: 'disabled' });
      row.guide = { guideBox, materialPanel: true, inheritedTheme: theme, inheritedStyle: style };
      await guide.getByRole('button', { name: '明白了' }).click();
      await guide.waitFor({ state: 'hidden' });
      evidence.cases.push(row);
      await writeFile(file('receipt.json'), JSON.stringify(evidence, null, 2));
      console.log(
        `[S4] ${id}: flat paint, native targets, press/release, guide and DPR1 edge captured`,
      );
    }
  // Readable narrow layouts and text zoom are separate from the desktop gallery.
  for (const width of [375, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`${origin}/?view=theme-review&style=outline&theme=dark`, {
      waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    const dimensions = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    assert.ok(dimensions.scroll <= width, `Mobile ${width}: horizontal overflow`);
    await page.screenshot({
      path: file(`mobile-${width}.png`),
      fullPage: true,
      animations: 'disabled',
    });
    evidence.cases.push({ id: `mobile-${width}`, ...dimensions });
  }
  await page.close();
  assert.deepEqual(evidence.errors, [], 'The built review must have no runtime errors');
  evidence.passed = true;
  console.log(`[S4] PASS ${browserName}: twelve themes and two mobile widths; ${output}`);
} finally {
  await writeFile(file('receipt.json'), JSON.stringify(evidence, null, 2));
  await browser.close();
  await closeServer();
}
