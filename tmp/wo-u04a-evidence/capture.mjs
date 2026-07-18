/**
 * Capture WO-U04a evidence screenshots from Storybook stories.
 * Usage: node tmp/wo-u04a-evidence/capture.mjs [storybookBaseUrl]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
const BASE = process.argv[2] ?? 'http://127.0.0.1:6006';

const shots = [
  {
    id: 'clay-control-light',
    path: '/iframe.html?id=clay-themes-overlayglass--clay-default&viewMode=story',
  },
  {
    id: 'glass-compact-light',
    path: '/iframe.html?id=clay-themes-overlayglass--overlay-glass&viewMode=story',
  },
  {
    id: 'glass-on-night',
    path: '/iframe.html?id=clay-themes-overlayglass--overlay-glass-on-night-theme&viewMode=story',
  },
  {
    id: 'side-by-side',
    path: '/iframe.html?id=clay-themes-overlayglass--side-by-side&viewMode=story',
  },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

for (const shot of shots) {
  const url = `${BASE}${shot.path}`;
  console.log('capture', shot.id, url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  // Storybook injects fonts/styles async; wait for kit button surface.
  await page.waitForSelector('.game-ui-button', { timeout: 30_000 });
  await page.waitForTimeout(400);
  const file = join(OUT, `${shot.id}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log('wrote', file);
}

await browser.close();
console.log('done');
