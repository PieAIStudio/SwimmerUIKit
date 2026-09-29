/** Built Storybook acceptance; isolated synthetic state, no provider or consumer changes. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium, firefox, webkit } from 'playwright';
import { preview } from 'vite';

const output =
  process.argv[2] ??
  `.devspace-visual/account-controls-${new Date().toISOString().replaceAll(':', '-')}`;
const baseline = process.argv[3];
await mkdir(output, { recursive: true });
const server = await preview({
  configFile: false,
  build: { outDir: 'storybook-static' },
  preview: { host: '127.0.0.1', port: 0 },
});
const address = server.httpServer.address();
assert.ok(address && typeof address === 'object');
const origin = `http://127.0.0.1:${address.port}`;
const results = [];

function luminance(color) {
  const values = color
    .match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number);
  assert.equal(values?.length, 3, `Expected computed RGB color, received ${color}`);
  const linear = values.map((value) => {
    const v = value / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function contrast(foreground, background) {
  const [low, high] = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (high + 0.05) / (low + 0.05);
}
async function readContrast(locator) {
  const colors = await locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return { foreground: style.color, background: style.backgroundColor };
  });
  const ratio = contrast(colors.foreground, colors.background);
  assert.ok(ratio >= 4.5, `Plaque text contrast ${ratio}:1`);
  return ratio;
}
async function paste(locator, code) {
  return locator.evaluate((element, text) => {
    const data = new DataTransfer();
    data.setData('text/plain', text);
    const event = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: data,
    });
    const constructorKeptPayload = event.clipboardData?.getData('text/plain') === text;
    // Firefox discards the constructor's clipboardData. This is a synthetic
    // fixture only: supply its payload explicitly, never use the OS clipboard.
    if (!constructorKeptPayload) Object.defineProperty(event, 'clipboardData', { value: data });
    element.dispatchEvent(event);
    return constructorKeptPayload;
  }, code);
}
async function codeValue(inputs) {
  return inputs.evaluateAll((elements) => elements.map((element) => element.value).join(''));
}

try {
  for (const [browserName, browserType] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await browserType.launch();
    try {
      for (const theme of ['light', 'night'])
        for (const width of [1280, 375]) {
          const touch = width === 375;
          const reducedMotion = touch ? 'reduce' : 'no-preference';
          const context = await browser.newContext({
            viewport: { width, height: touch ? 844 : 1100 },
            hasTouch: touch,
            reducedMotion,
            ...(touch && browserName !== 'firefox' ? { isMobile: true } : {}),
          });
          const page = await context.newPage();
          const name = `${browserName}-${theme}-${width}`;
          const errors = [];
          page.on('pageerror', (error) => errors.push(error.message));
          try {
            await page.goto(
              `${origin}/iframe.html?id=clay-account-accountcontrols--overview&viewMode=story&globals=theme:${theme}`,
            );
            await page.locator('[data-account-overview]').waitFor();
            await page.evaluate(() => document.fonts.ready);
            const canvasColors = await page
              .locator('[data-account-overview]')
              .evaluate((element) => {
                let ancestor = element;
                let background = 'rgb(255, 255, 255)';
                while (ancestor) {
                  const candidate = getComputedStyle(ancestor).backgroundColor;
                  if (candidate !== 'rgba(0, 0, 0, 0)' && candidate !== 'transparent') {
                    background = candidate;
                    break;
                  }
                  ancestor = ancestor.parentElement;
                }
                return { foreground: getComputedStyle(element).color, background };
              });
            const canvasContrast = contrast(canvasColors.foreground, canvasColors.background);
            assert.ok(
              canvasContrast >= 4.5,
              `Story canvas text contrast ${canvasContrast}:1 (${theme})`,
            );
            assert.equal(
              await page.locator('.game-ui-clay-preview').getAttribute('data-game-ui-theme'),
              theme === 'night' ? 'night' : null,
            );
            const inputs = page.locator('[data-account-code] input');
            assert.equal(await inputs.count(), 6);
            const targets = await inputs.evaluateAll((elements) =>
              elements.map((element) => ({
                width: element.getBoundingClientRect().width,
                height: element.getBoundingClientRect().height,
                mode: element.inputMode,
              })),
            );
            assert.ok(
              targets.every(
                (target) => target.width >= 44 && target.height >= 44 && target.mode === 'numeric',
              ),
            );
            if (touch) await inputs.first().tap();
            else await inputs.first().click();
            await page.keyboard.type('123456');
            assert.equal(await codeValue(inputs), '123456');
            assert.equal(
              await page.locator('[data-code-completions]').getAttribute('data-code-completions'),
              '1',
            );
            await page.keyboard.press('Backspace');
            assert.equal(await codeValue(inputs), '12345');
            assert.equal(
              await inputs.nth(4).evaluate((element) => element === document.activeElement),
              true,
            );
            assert.equal(await page.locator('[data-code-completions]').textContent(), '等待输入');
            const constructorKeptClipboard = await paste(inputs.first(), '654321');
            assert.equal(await codeValue(inputs), '654321');
            await paste(inputs.first(), '654321');
            assert.equal(
              await page.locator('[data-code-completions]').getAttribute('data-code-completions'),
              '2',
            );

            const tabs = page.locator('[role="tab"]');
            const tablist = page.locator('[role="tablist"]');
            assert.equal(await tablist.getAttribute('aria-orientation'), 'vertical');
            assert.equal((await tablist.boundingBox()).width, 200);
            if (touch) await tabs.first().tap();
            else await tabs.first().click();
            await page.keyboard.press('ArrowDown');
            assert.equal(await tabs.nth(1).getAttribute('aria-selected'), 'true');
            await page.keyboard.press('ArrowRight');
            assert.equal(
              await tabs.nth(1).evaluate((element) => element === document.activeElement),
              true,
            );
            assert.equal(await page.locator('[role="tabpanel"]:visible').count(), 1);

            const rows = page.locator('[data-account-rows] .game-ui-list-row');
            const more = rows.first().getByRole('button', { name: '河流的故事更多' });
            if (touch) await more.tap();
            else await more.click();
            assert.equal(
              await rows.first().locator('.game-ui-list-row-main').getAttribute('aria-pressed'),
              'true',
            );
            assert.match(
              await page.locator('[data-account-rows] [role="status"]').textContent(),
              /更多/,
            );
            const remove = rows.nth(1).getByRole('button', { name: '移除森林来信' });
            if (touch) await remove.tap();
            else await remove.click();
            assert.equal(
              await rows.first().locator('.game-ui-list-row-main').getAttribute('aria-pressed'),
              'true',
            );
            assert.match(
              await page.locator('[data-account-rows] [role="status"]').textContent(),
              /需要宿主确认/,
            );
            assert.equal(await rows.locator('button button').count(), 0);

            const plaque = page.locator('[data-account-plaque] button').first();
            await plaque.scrollIntoViewIfNeeded();
            const restContrast = await readContrast(plaque);
            const boxBefore = await plaque.boundingBox();
            if (touch) await plaque.tap();
            else {
              await plaque.hover();
              await plaque.evaluate(async (element) => {
                await Promise.all(element.getAnimations().map((animation) => animation.finished));
              });
              await page.mouse.down();
            }
            const boxPressed = await plaque.boundingBox();
            assert.equal(boxBefore.width, boxPressed.width);
            assert.equal(boxBefore.height, boxPressed.height);
            assert.equal(boxBefore.x, boxPressed.x);
            assert.equal(boxBefore.y, boxPressed.y);
            const hoverContrast = await readContrast(plaque);
            if (!touch) await page.mouse.up();
            if (touch)
              assert.equal(
                await plaque.evaluate((element) => getComputedStyle(element).transitionDuration),
                '0s',
              );
            assert.deepEqual(errors, []);
            const overflow = await page.evaluate(
              () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
            );
            assert.equal(overflow, false, 'Story has horizontal page overflow');
            // Four overview frames cover all added primitives; other engines run the same behavior checks.
            if (browserName === 'chromium')
              await page.screenshot({
                path: path.join(output, `${name}.png`),
                fullPage: true,
                animations: 'disabled',
              });
            results.push({
              browser: browserName,
              theme,
              width,
              touch,
              reducedMotion,
              restContrast,
              canvasContrast,
              hoverContrast,
              syntheticClipboard: true,
              constructorKeptClipboard,
              errors,
            });
          } catch (error) {
            await page
              .screenshot({ path: path.join(output, `${name}-failed.png`), fullPage: true })
              .catch(() => {});
            throw error;
          } finally {
            await context.close();
          }
        }
    } finally {
      await browser.close();
    }
  }

  // Optional pre-change baseline is captured once before implementation, never updated by this test.
  if (baseline) {
    const kit = await import(pathToFileURL(path.resolve('dist/index.js')).href);
    const markup = renderToStaticMarkup(
      h(
        'main',
        { style: { padding: 24, display: 'grid', gap: 24 } },
        ...['primary', 'secondary', 'ghost', 'danger', 'success'].map((variant) =>
          h(kit.GameButton, { key: variant, variant }, variant),
        ),
        h(kit.GameIconButton, { label: 'Account' }, 'A'),
        h(kit.GameAvatar, { name: 'Mika Ono' }),
        h(kit.GameTabs, {
          id: 'baseline',
          activeId: 'profile',
          tabs: [
            { id: 'profile', label: 'Profile' },
            { id: 'security', label: 'Security' },
          ],
        }),
      ),
    );
    assert.equal(
      markup,
      await readFile(path.join(baseline, 'baseline-markup.html'), 'utf8'),
      'Default DOM markup changed',
    );
    const css = await readFile('dist/styles.css', 'utf8');
    const frames = JSON.parse(
      await readFile(path.join(baseline, 'baseline-defaults.json'), 'utf8'),
    );
    const browser = await chromium.launch();
    try {
      for (const frame of frames) {
        const page = await browser.newPage({
          viewport: { width: frame.width, height: 800 },
          reducedMotion: 'reduce',
        });
        await page.setContent(
          `<html data-game-ui-theme="${frame.theme}"><head><meta charset="utf-8"><style>${css}</style></head><body>${markup}</body></html>`,
        );
        const bytes = await page.screenshot({
          path: path.join(output, `${frame.name}-after.png`),
          animations: 'disabled',
          caret: 'hide',
        });
        assert.equal(
          createHash('sha256').update(bytes).digest('hex'),
          frame.sha256,
          `Default pixels changed: ${frame.name}`,
        );
        await page.close();
      }
    } finally {
      await browser.close();
    }
    results.push({ unchangedDefaultFrames: frames.length, markupUnchanged: true });
  }
  await writeFile(
    path.join(output, 'receipt.json'),
    JSON.stringify(
      {
        origin,
        pid: process.pid,
        cwd: process.cwd(),
        testedAt: new Date().toISOString(),
        source: 'built Storybook and dist',
        results,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ scenarios: results.length, output, passed: true }));
} finally {
  await new Promise((resolve) => server.httpServer.close(resolve));
}
