/**
 * Capture every built Storybook story at DPR 1 in both existing themes.
 * With a baseline, require byte-identical PNGs: no masks or pixel tolerance.
 * Firefox is the deterministic capture engine; Chromium remains in pnpm verify.
 * S0 is re-rendered from its saved unmodified build when a capture rig changes;
 * raw S0 evidence is never replaced. A private port avoids other projects.
 * Chromium's full-page image resampling was not repeatable on this Mac, even
 * against itself. No image region, effect, tolerance or assertion is removed.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox } from 'playwright';

const args = process.argv.slice(2);
const [outputArgument, baselineArgument] = args.filter((argument) => !argument.startsWith('--'));
const option = (name) =>
  args.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3);
const browserName = option('browser') ?? 'firefox';
assert.ok(['chromium', 'firefox'].includes(browserName));
const captureRig = `storybook-dpr1-ready-clock-v9-${browserName}`;
assert.ok(
  outputArgument,
  'Usage: node scripts/verify-storybook-visuals.mjs .scratch/<run> [baseline] [--build=storybook-static] [--story=id] [--source-commit=sha] [--browser=firefox|chromium]',
);
const root = process.cwd();
const buildRoot = path.resolve(root, option('build') ?? 'storybook-static');
assert.ok(buildRoot.startsWith(`${root}/`), 'Read builds from this repository only');
const output = path.resolve(root, outputArgument);
assert.ok(output.startsWith(`${root}/.scratch/`), 'Visual evidence belongs in .scratch/');
const baseline = baselineArgument
  ? JSON.parse(await readFile(path.join(baselineArgument, 'screenshots.json'), 'utf8'))
  : null;
if (baseline)
  assert.equal(
    baseline.captureRig,
    captureRig,
    'Compare identical capture rigs; preserve the original raw baseline and capture its saved build separately',
  );
const index = JSON.parse(await readFile(path.join(buildRoot, 'index.json'), 'utf8'));
const iframeHtml = await readFile(path.join(buildRoot, 'iframe.html'), 'utf8');
const stories = Object.values(index.entries)
  .filter((entry) => entry.type === 'story' && (!option('story') || entry.id === option('story')))
  .sort((a, b) => a.id.localeCompare(b.id));
assert.ok(stories.length > 0, 'The built Storybook index must contain stories');
await mkdir(output, { recursive: true });
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const filename = path.resolve(buildRoot, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!filename.startsWith(`${buildRoot}/`) || !(await stat(filename)).isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      'Content-Type': mime[path.extname(filename)] ?? 'application/octet-stream',
    });
    createReadStream(filename).pipe(response);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const origin = `http://127.0.0.1:${server.address().port}`;
const results = {
  sourceCommit:
    option('source-commit') ??
    execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  captureRig,
  scope: option('story') ? 'single-story diagnostic; not full-stage acceptance' : 'all stories',
  buildRoot: path.relative(root, buildRoot),
  browser: null,
  browserName,
  origin,
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  motion:
    'no-preference; original HTML mounts at performance.now()=10000; JS advances by 32+1024 ms; finite CSS animations held at their end and infinite CSS animations held at time zero, without cancel/restore during capture',
  iframeSha256: createHash('sha256').update(iframeHtml).digest('hex'),
  themes: ['light', 'night'],
  storyCount: stories.length,
  captures: [],
  errors: [],
  differences: [],
};
let browser;
async function holdCssAnimations(page) {
  return page.evaluate(async () => {
    const animations = document.getAnimations();
    for (const animation of animations) {
      animation.pause();
    }
    // pause() is asynchronous. Wait for its native compositor acknowledgement
    // before assigning hold times, otherwise its pending pause task can replace
    // time zero with a wall-clock-dependent rotation on a pseudo-element.
    await Promise.all(animations.map((animation) => animation.ready));
    for (const animation of animations) {
      const end = animation.effect?.getComputedTiming().endTime;
      animation.currentTime = typeof end === 'number' && Number.isFinite(end) ? end : 0;
    }
    return animations.map((animation) => {
      const target = animation.effect?.target;
      return {
        name: animation.animationName ?? 'transition',
        currentTime: animation.currentTime,
        playState: animation.playState,
        pending: animation.pending,
        pseudo: animation.effect?.pseudoElement ?? null,
        target: target instanceof Element ? target.className : null,
        paint:
          target instanceof Element
            ? ['', '::before', '::after'].map((pseudo) => {
                const css = getComputedStyle(target, pseudo || null);
                return {
                  pseudo,
                  rotate: css.rotate,
                  transform: css.transform,
                  opacity: css.opacity,
                };
              })
            : [],
      };
    });
  });
}
try {
  browser = await { chromium, firefox }[browserName].launch();
  results.browser = browser.version();
  for (const story of stories) {
    for (const theme of results.themes) {
      const currentCapture = `${story.id}--${theme}`;
      const context = await browser.newContext({
        viewport: results.viewport,
        deviceScaleFactor: 1,
        reducedMotion: 'no-preference',
        locale: 'en-US',
        timezoneId: 'UTC',
      });
      const page = await context.newPage();
      page.setDefaultTimeout(30_000);
      page.on('pageerror', (error) =>
        results.errors.push({ capture: currentCapture, message: error.message }),
      );
      const url = `${origin}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`;
      // Navigation replays Playwright's clock and moves its performance origin
      // by a few milliseconds. That changed even untouched WebGL pixels. First
      // establish the real URL in an empty document, then install the clock
      // and load the ORIGINAL built HTML, unchanged, into that same document.
      // No component, asset, effect, style or viewport is replaced or masked.
      await page.route(url, (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: '<!doctype html><html><body></body></html>',
        }),
      );
      await page.goto(url, { waitUntil: 'load' });
      await page.unroute(url);
      await page.evaluate(() => {
        globalThis.__captureNativeFrame = requestAnimationFrame.bind(window);
      });
      await page.clock.install({ time: new Date('2026-10-01T00:00:00.000Z') });
      await page.clock.pauseAt(new Date('2026-10-01T00:00:01.000Z'));
      await page.clock.fastForward(10000 - (await page.evaluate(() => performance.now())));
      await page.evaluate(() => {
        let seed = 314159;
        Math.random = () => {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          return seed / 4294967296;
        };
      });
      await page.setContent(iframeHtml, { waitUntil: 'networkidle' });
      assert.equal(
        await page.evaluate(() => performance.now()),
        10000,
        'The story must mount at the same virtual instant',
      );
      await page.locator('#storybook-root .game-ui-clay-preview').first().waitFor();
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((image) => image.decode().catch(() => undefined)),
        );
      });
      const appliedTheme = await page
        .locator('#storybook-root .game-ui-clay-preview')
        .first()
        .getAttribute('data-game-ui-theme');
      assert.equal(
        appliedTheme,
        theme === 'night' ? 'night' : null,
        `${currentCapture}: theme was not applied`,
      );
      await page.mouse.move(0, 0);
      await holdCssAnimations(page);
      await page.evaluate(
        () => new Promise((resolve) => __captureNativeFrame(() => __captureNativeFrame(resolve))),
      );
      await page.clock.runFor(32);
      await page.evaluate(
        () => new Promise((resolve) => __captureNativeFrame(() => __captureNativeFrame(resolve))),
      );
      await page.locator('#storybook-root').boundingBox();
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((image) => image.decode().catch(() => undefined)),
        );
      });
      await page.clock.runFor(1024);
      const heldCssAnimations = await holdCssAnimations(page);
      assert.equal(
        await page.evaluate(() => performance.now()),
        11056,
        'Every screenshot must sample the same virtual frame',
      );
      await page.evaluate(
        () => new Promise((resolve) => __captureNativeFrame(() => __captureNativeFrame(resolve))),
      );
      const filename = `${currentCapture}.png`;
      // Require the compositor itself to settle, as well as the JS clock.
      // Two consecutive native PNGs must match exactly before accepting a
      // sample. This does not consult the baseline or tolerate changed pixels.
      let png;
      let stable = false;
      let attempts = 0;
      for (; attempts < 5; attempts++) {
        const next = await page.screenshot({
          fullPage: true,
          animations: 'allow',
          caret: 'hide',
        });
        if (option('inspect')) {
          await writeFile(path.join(output, `${currentCapture}-sample-${attempts}.png`), next);
          const state = await page.evaluate(() => ({
            now: performance.now(),
            animations: document.getAnimations().map((a) => ({
              name: a.animationName,
              time: a.currentTime,
              pending: a.pending,
              state: a.playState,
            })),
            paths: [...document.querySelectorAll('svg path')].map((p) => ({
              d: p.getAttribute('d'),
              transform: p.getAttribute('transform'),
              style: p.getAttribute('style'),
              rect: p.getBoundingClientRect().toJSON(),
            })),
          }));
          await writeFile(
            path.join(output, `${currentCapture}-sample-${attempts}.json`),
            JSON.stringify(state),
          );
        }
        if (png?.equals(next)) {
          png = next;
          stable = true;
          break;
        }
        png = next;
      }
      if (!stable) await writeFile(path.join(output, `${currentCapture}-unstable.png`), png);
      assert.ok(stable, `${currentCapture}: compositor did not produce two identical stills`);
      await writeFile(path.join(output, filename), png);
      if (option('inspect')) {
        const inspection = await page.evaluate(() => ({
          body: document.querySelector('#storybook-root').innerHTML,
          computed: [...document.querySelectorAll('#storybook-root *')].map((node) => {
            const css = getComputedStyle(node);
            return {
              tag: node.tagName,
              cls: node.getAttribute('class'),
              rect: node.getBoundingClientRect().toJSON(),
              css: Object.fromEntries(
                [...css]
                  .filter((k) => !k.startsWith('--'))
                  .map((k) => [k, css.getPropertyValue(k)]),
              ),
            };
          }),
        }));
        await writeFile(
          path.join(output, `${currentCapture}.dom.json`),
          JSON.stringify(inspection),
        );
      }
      const capture = {
        id: story.id,
        title: story.title,
        name: story.name,
        theme,
        filename,
        sha256: createHash('sha256').update(png).digest('hex'),
        bytes: png.length,
        stabilityCaptures: attempts + 1,
        heldCssAnimations: heldCssAnimations.length,
        animationState: heldCssAnimations,
      };
      results.captures.push(capture);
      if (baseline) {
        const before = baseline.captures.find(
          (item) => item.id === story.id && item.theme === theme,
        );
        if (!before || before.sha256 !== capture.sha256) results.differences.push(filename);
      }
      await writeFile(
        path.join(output, 'screenshots.json'),
        `${JSON.stringify(results, null, 2)}\n`,
      );
      console.log(`[visual] ${results.captures.length}/${stories.length * 2} ${currentCapture}`);
      await context.close();
    }
  }
  if (baseline) {
    const actual = new Set(results.captures.map((item) => item.filename));
    for (const before of baseline.captures) {
      if (!actual.has(before.filename)) results.differences.push(`missing:${before.filename}`);
    }
  }
  await writeFile(path.join(output, 'screenshots.json'), `${JSON.stringify(results, null, 2)}\n`);
  assert.deepEqual(results.errors, [], 'Storybook raised browser errors');
  assert.deepEqual(
    results.differences,
    [],
    'Storybook differs from the baseline; inspect before proceeding',
  );
  console.log(
    `[visual] PASS ${results.captures.length} captures; ${results.differences.length} differences`,
  );
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
