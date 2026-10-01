/**
 * Capture every built Storybook story at DPR 1 in both existing themes.
 * With a baseline, require byte-identical PNGs: no masks or pixel tolerance.
 * A private ephemeral port and one browser page avoid other projects' servers.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const [outputArgument, baselineArgument] = process.argv.slice(2);
assert.ok(
  outputArgument,
  'Usage: node scripts/verify-storybook-visuals.mjs .scratch/<run> [baseline]',
);
const root = process.cwd();
const buildRoot = path.resolve(root, 'storybook-static');
const output = path.resolve(root, outputArgument);
assert.ok(output.startsWith(`${root}/.scratch/`), 'Visual evidence belongs in .scratch/');
const baseline = baselineArgument
  ? JSON.parse(await readFile(path.join(baselineArgument, 'screenshots.json'), 'utf8'))
  : null;
const index = JSON.parse(await readFile(path.join(buildRoot, 'index.json'), 'utf8'));
const stories = Object.values(index.entries)
  .filter((entry) => entry.type === 'story')
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
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  browser: null,
  origin,
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
  motion: 'no-preference; CSS animations disabled only for each still image',
  themes: ['light', 'night'],
  storyCount: stories.length,
  captures: [],
  errors: [],
  differences: [],
};
let browser;
try {
  browser = await chromium.launch();
  results.browser = browser.version();
  const context = await browser.newContext({
    viewport: results.viewport,
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    locale: 'en-US',
    timezoneId: 'UTC',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);
  let currentCapture = '';
  page.on('pageerror', (error) =>
    results.errors.push({ capture: currentCapture, message: error.message }),
  );
  // Stable generated decoration/IDs, not a different component implementation.
  await page.addInitScript(() => {
    let seed = 314159;
    Math.random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  });
  for (const story of stories) {
    for (const theme of results.themes) {
      currentCapture = `${story.id}--${theme}`;
      await page.goto(
        `${origin}/iframe.html?id=${story.id}&viewMode=story&globals=theme:${theme}`,
        {
          waitUntil: 'networkidle',
        },
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
      // Let initial measurement and finite spring entrance settle. No ambient
      // motion or selected component is hidden/masked to force a comparison.
      await page.waitForTimeout(600);
      await page.mouse.move(0, 0);
      const filename = `${currentCapture}.png`;
      const png = await page.screenshot({
        path: path.join(output, filename),
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      });
      const capture = {
        id: story.id,
        title: story.title,
        name: story.name,
        theme,
        filename,
        sha256: createHash('sha256').update(png).digest('hex'),
        bytes: png.length,
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
