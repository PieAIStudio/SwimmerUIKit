import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { bundle } from 'lightningcss';
import { chromium, type Browser, type Page } from 'playwright';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GameButton } from '../src/controls/GameButton/GameButton';
import { GameIconButton } from '../src/controls/GameIconButton/GameIconButton';

import { GameToggle } from '../src/controls/GameToggle/GameToggle';

// This is deliberately a Node test driving a real browser: use the same native
// CSS compiler as distribution, not Vite dev's unminified stylesheet. No React
// animation runtime is needed to prove the native :active hit-target contract.
const css = bundle({
  filename: fileURLToPath(new URL('../src/styles.css', import.meta.url)),
  minify: true,
}).code.toString();
let browser: Browser;
let page: Page;
beforeAll(async () => {
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 600, height: 320 } });
  // This suite checks one compiled stylesheet, not page startup. Parse it
  // once; each case still gets fresh DOM and a released pointer. Rebuilding
  // five browser tabs and reparsing identical CSS made host CPU contention
  // look like a hit-target regression. Assertions and time limits stay intact.
  await page.setContent(`<style>${css}</style><main style="padding:64px"></main>`);
}, 15000);
afterAll(async () => {
  await browser?.close();
});

async function renderFixture(node: ReactNode) {
  await page.mouse.up();
  await page.mouse.move(0, 0);
  await page.locator('main').evaluate((main, markup) => {
    main.innerHTML = markup;
  }, renderToStaticMarkup(node));
}

describe('published CSS preserves native hit targets', () => {
  const cases = [
    { name: 'liquid button', node: <GameButton surface="liquid">Start</GameButton> },
    {
      name: 'liquid icon',
      node: (
        <GameIconButton label="Save" surface="liquid">
          ★
        </GameIconButton>
      ),
    },
    { name: 'liquid switch', node: <GameToggle surface="liquid" label="Notify" checked /> },
    { name: 'static button', node: <GameButton static>Start</GameButton> },
  ];
  it.each(cases)(
    '$name does not move or shrink its native content after minification',
    async ({ node }) => {
      try {
        await renderFixture(node);
        const button = page.locator('button');
        await button.hover();
        await page.waitForTimeout(250); // allow the old hover transition to settle
        const before = (await button.boundingBox())!;
        await page.mouse.down();
        await page.waitForTimeout(250); // assert the final :active size, not t=0
        const pressed = (await button.boundingBox())!;
        for (const key of ['x', 'y', 'width', 'height'] as const)
          expect(pressed[key], key).toBeCloseTo(before[key], 2);
        await page.mouse.up();
      } finally {
        await page.mouse.up();
      }
    },
  );

  it('retains the intentional ordinary-button press instead of globally removing motion', async () => {
    try {
      await renderFixture(<GameButton>Start</GameButton>);
      const button = page.locator('button');
      await button.hover();
      await page.waitForTimeout(250);
      const before = (await button.boundingBox())!;
      await page.mouse.down();
      await page.waitForTimeout(250);
      expect((await button.boundingBox())!.width).toBeLessThan(before.width);
      await page.mouse.up();
    } finally {
      await page.mouse.up();
    }
  });
});
