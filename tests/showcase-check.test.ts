import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from 'playwright';
import {
  validateShowcaseCode,
  validateShowcaseMetrics,
  validateShowcaseOutputCopy,
  type ShowcasePageMetrics,
} from '../scripts/showcase-check.mjs';

const fixture = (name: string) =>
  readFileSync(new URL(`./fixtures/showcase-check/${name}`, import.meta.url), 'utf8');

async function metrics(page: import('playwright').Page): Promise<ShowcasePageMetrics> {
  return page.evaluate(() => {
    const shell = document.querySelector('.game-ui-showcase-shell');
    const stagePanels = [...document.querySelectorAll('.game-ui-showcase-demo--stage')];
    const main = shell?.querySelector('.game-ui-showcase-main');
    const edgeNodes = main
      ? [
          ...main.querySelectorAll(
            '.game-ui-showcase-block, .game-ui-showcase-demo, .game-ui-showcase-flow, .game-ui-showcase-code',
          ),
        ]
      : [];
    const edgeRects = edgeNodes.map((node) => node.getBoundingClientRect());
    const columnEdgesDiffer = edgeRects.some(
      (rect) =>
        Math.abs(rect.left - (edgeRects[0]?.left ?? rect.left)) > 1 ||
        Math.abs(rect.right - (edgeRects[0]?.right ?? rect.right)) > 1,
    );
    const stageFixedHeightAtPhone =
      window.innerWidth <= 390 &&
      stagePanels.some((panel) => {
        const stage = panel.querySelector('.game-ui-showcase-stage');
        return stage ? getComputedStyle(stage).maxHeight !== 'none' : false;
      });
    const stageClipsAtPhone =
      window.innerWidth <= 390 &&
      stagePanels.some((panel) => {
        const stage = panel.querySelector('.game-ui-showcase-stage');
        if (!stage) return false;
        const styles = getComputedStyle(stage);
        return (
          styles.overflow === 'hidden' ||
          styles.overflowX === 'hidden' ||
          styles.overflowY === 'hidden'
        );
      });
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
      stageFixedHeightAtPhone,
      stageClipsAtPhone,
      columnEdgesDiffer,
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
    ['stage-clip.html', 'stage has a fixed height at 390px'],
    ['column-mismatch.html', 'showcase column edges differ'],
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

  it('rejects the forbidden Sample output label', () => {
    expect(
      validateShowcaseOutputCopy({
        file: 'showcase/Demo.tsx',
        text: '<span>Sample:</span>',
      }),
    ).toEqual(['showcase/Demo.tsx contains forbidden output label "Sample"']);
  });

  it('rejects invalid How to plug in code', () => {
    expect(
      validateShowcaseCode({
        packageName: '@pieai/example-kit',
        code: ["import Demo from './Demo';"],
      }),
    ).toEqual([
      'How to plug in code does not include the Kit package name: @pieai/example-kit',
      'How to plug in code contains showcase shell wiring (mountShowcase or ./Demo)',
    ]);
    expect(
      validateShowcaseCode({
        packageName: '@pieai/example-kit',
        code: ["import { Demo } from '@pieai/other-kit';"],
      }),
    ).toContain('How to plug in code does not include the Kit package name: @pieai/example-kit');
  });

  it('rejects the round-six shell regressions', () => {
    const failures = validateShowcaseMetrics({
      viewportWidth: 390,
      scrollWidth: 390,
      stageWiderThanPanel: false,
      hasFlowStrip: true,
      kitType: 'visual',
      stageCount: 1,
      stageMissingOptionRow: false,
      stageFixedHeightAtPhone: false,
      stageClipsAtPhone: false,
      columnEdgesDiffer: false,
      codeToRailGap: 0,
      updatesClipped: true,
      codeWrapUnsafe: true,
      codeFadeMissing: true,
      headerActionsNotAtEdge: true,
      toggleTargetsTooSmall: true,
      toggleStylesInconsistent: true,
      codeCornerUnclipped: true,
    });
    expect(failures).toEqual(
      expect.arrayContaining([
        'code block and Status panel need a 16px gap at 390px',
        'code block can break inside a token at 390px',
        'code block is missing its horizontal fade cue at 390px',
        'Updates text is clipped or ellipsized',
        'header controls are not pushed to the right edge at 390px',
        'theme/language controls need 44px tap targets',
        'theme/language toggles do not share one visual treatment',
        'How to plug in code block is not clipped to its rounded corner',
      ]),
    );
  });

  it('rejects a Kit heading font override', () => {
    expect(
      validateShowcaseMetrics({
        viewportWidth: 1440,
        scrollWidth: 1440,
        stageWiderThanPanel: false,
        hasFlowStrip: true,
        kitType: 'visual',
        stageCount: 1,
        stageMissingOptionRow: false,
        stageFixedHeightAtPhone: false,
        stageClipsAtPhone: false,
        columnEdgesDiffer: false,
        headingFontFamily: 'system-ui, sans-serif',
        expectedHeadingFontFamily: 'Baloo 2, system-ui, sans-serif',
      }),
    ).toContain('showcase H1 overrides the UIKit display font token');
  });
});
