import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from 'playwright';
import { validateShowcaseMetrics, type ShowcasePageMetrics } from '../scripts/showcase-check.mjs';

const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/showcase-check/${name}`, import.meta.url), 'utf8');

async function metrics(page: import('playwright').Page): Promise<ShowcasePageMetrics> {
  return page.evaluate(() => {
    const shell = document.querySelector('.game-ui-showcase-shell');
    const stagePanels = [...document.querySelectorAll('.game-ui-showcase-demo--stage')];
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      stageWiderThanPanel: stagePanels.some((panel) => {
        const stage = panel.querySelector('.game-ui-showcase-stage');
        return stage
          ? stage.getBoundingClientRect().width > panel.getBoundingClientRect().width + 1
          : false;
      }),
      hasFlowStrip: Boolean(document.querySelector('.game-ui-showcase-flow')),
      kitType: shell?.getAttribute('data-game-ui-kit-type') ?? '',
      stageCount: stagePanels.length,
      stageMissingOptionRow: stagePanels.some(
        (panel) => !panel.querySelector('[data-game-ui-option-row="true"], .game-ui-segmented'),
      ),
    };
  });
}

describe('showcase-check browser guards', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  it.each([
    ['document-overflow.html', 'horizontal overflow'],
    ['stage-overflow.html', 'stage box is wider than its showcase panel'],
    ['missing-flow.html', 'FlowStrip is missing'],
    ['missing-option-row.html', 'visual Kit stage is missing an option row'],
  ])('rejects %s', async (name, message) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.setContent(fixture(name));
    expect(
      validateShowcaseMetrics(await metrics(page)).some((failure) => failure.includes(message)),
    ).toBe(true);
    await page.close();
  });

  it('accepts the valid test page', async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.setContent(fixture('valid.html'));
    expect(validateShowcaseMetrics(await metrics(page))).toEqual([]);
    await page.close();
  });
});
