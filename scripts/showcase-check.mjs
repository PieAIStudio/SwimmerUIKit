#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import process from 'node:process';
import ts from 'typescript';

export function validateShowcaseCode({ packageName, code }) {
  const failures = [];
  const lines = Array.isArray(code) ? code.filter((line) => typeof line === 'string') : [];
  if (packageName && !lines.some((line) => line.includes(packageName))) {
    failures.push('How to plug in code does not include the Kit package name: ' + packageName);
  }
  if (lines.some((line) => /\bmountShowcase\b|\.\/Demo\b/.test(line))) {
    failures.push('How to plug in code contains showcase shell wiring (mountShowcase or ./Demo)');
  }
  return failures;
}

export function validateShowcaseMetrics({
  viewportWidth,
  scrollWidth,
  stageWiderThanPanel,
  hasFlowStrip,
  kitType,
  stageCount,
  stageMissingOptionRow,
  stageFixedHeightAtPhone = false,
  stageClipsAtPhone = false,
  columnEdgesDiffer = false,
  headingFontFamily,
  expectedHeadingFontFamily,
}) {
  const failures = [];
  if (
    headingFontFamily &&
    expectedHeadingFontFamily &&
    headingFontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase() !==
      expectedHeadingFontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase()
  ) {
    failures.push('showcase H1 overrides the UIKit display font token');
  }
  if (viewportWidth <= 390) {
    if (scrollWidth > viewportWidth) {
      failures.push(`horizontal overflow: document is ${scrollWidth}px wide at ${viewportWidth}px`);
    }
    if (stageWiderThanPanel) {
      failures.push('stage box is wider than its showcase panel');
    }
    if (stageFixedHeightAtPhone) failures.push('stage has a fixed height at 390px');
    if (stageClipsAtPhone) failures.push('stage clips content with overflow:hidden at 390px');
    if (columnEdgesDiffer) failures.push('showcase column edges differ');
  }
  if (!hasFlowStrip) failures.push('FlowStrip is missing');
  if (kitType === 'visual' && (stageCount === 0 || stageMissingOptionRow)) {
    failures.push('visual Kit stage is missing an option row');
  }
  return failures;
}
function collectPageMetrics() {
  const shell = document.querySelector('.game-ui-showcase-shell');
  const stagePanels = [...document.querySelectorAll('.game-ui-showcase-demo--stage')];
  const heading = shell?.querySelector('h1');
  const headingFontFamily = heading ? getComputedStyle(heading).fontFamily : '';
  const expectedHeadingFontFamily = shell
    ? getComputedStyle(shell).getPropertyValue('--swimmer-game-font-display')
    : '';
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
      if (!stage) return false;
      const styles = getComputedStyle(stage);
      return styles.maxHeight !== 'none';
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
    headingFontFamily,
    expectedHeadingFontFamily,
    kitType: shell?.getAttribute('data-game-ui-kit-type') ?? '',
    stageCount: stagePanels.length,
    stageMissingOptionRow: stagePanels.some(
      (panel) => !panel.querySelector('[data-game-ui-option-row="true"], .game-ui-segmented'),
    ),
    stageFixedHeightAtPhone,
    stageClipsAtPhone,
    columnEdgesDiffer,
  };
}
export async function runShowcaseCheck(root = process.cwd()) {
  const showcaseRoot = resolve(root, 'showcase');
  const allowed = new Set([
    'Demo.tsx',
    'demo.css',
    'index.html',
    'kit.json',
    'main.ts',
    'main.tsx',
  ]);
  const failures = [];

  const fail = (message) => failures.push(message);

  if (!existsSync(showcaseRoot)) {
    fail('showcase/ is missing');
  } else {
    for (const entry of readdirSync(showcaseRoot, { withFileTypes: true })) {
      if (!allowed.has(entry.name)) fail('showcase/ contains unexpected ' + entry.name);
    }
    for (const required of ['kit.json', 'main.tsx']) {
      if (!existsSync(join(showcaseRoot, required))) fail('showcase/' + required + ' is missing');
    }
    if (!existsSync(join(showcaseRoot, 'Demo.tsx')) && !existsSync(join(showcaseRoot, 'main.ts'))) {
      fail('showcase/Demo.tsx or showcase/main.ts is missing');
    }

    const mainPath = existsSync(join(showcaseRoot, 'main.tsx'))
      ? join(showcaseRoot, 'main.tsx')
      : join(showcaseRoot, 'main.ts');
    const sourceFile = ts.createSourceFile(
      mainPath,
      readFileSync(mainPath, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      mainPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );
    if (sourceFile.statements.length > 3) {
      fail('showcase/' + relative(showcaseRoot, mainPath) + ' has more than 3 statements');
    }

    const cssPath = join(showcaseRoot, 'demo.css');
    if (existsSync(cssPath)) {
      const css = readFileSync(cssPath, 'utf8');
      if (css.split(/\r?\n/).length > 60) fail('showcase/demo.css is over 60 lines');
      for (const selector of css.matchAll(/(^|})\s*([^@{}][^{}]*)\{/g)) {
        const selectors = selector[2]
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);
        if (selectors.some((value) => !value.startsWith('.kit-demo'))) {
          fail('showcase/demo.css selector escapes .kit-demo: ' + selector[2].trim());
        }
      }
    }

    for (const name of readdirSync(showcaseRoot).filter((entry) =>
      /\.(?:ts|tsx|js|jsx)$/.test(entry),
    )) {
      const file = join(showcaseRoot, name);
      const text = readFileSync(file, 'utf8');
      if (/<select\b/i.test(text)) fail(relative(root, file) + ' uses native select');
      if (
        /<input[^>]*(?:type\s*=\s*["'](?:range|checkbox)["']|type\s*=\s*(?:range|checkbox))/i.test(
          text,
        )
      ) {
        fail(relative(root, file) + ' uses native range/checkbox input');
      }
    }

    const manifest = JSON.parse(readFileSync(join(showcaseRoot, 'kit.json'), 'utf8'));
    failures.push(...validateShowcaseCode({ packageName: manifest.name, code: manifest.code }));
    if (!manifest.demo && manifest.type === 'visual') {
      fail('showcase/kit.json is missing localized demo copy');
    }
  }

  const distIndex = [
    join(root, 'showcase-dist', 'index.html'),
    join(root, 'showcase-dist', 'showcase', 'index.html'),
  ].find((candidate) => existsSync(candidate));
  if (distIndex) {
    let browser;
    try {
      const { chromium } = await import('playwright');
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();
      const url = 'file://' + distIndex;
      for (const viewport of [
        { width: 1440, height: 900, max: 1700 },
        { width: 390, height: 844, max: 3000 },
      ]) {
        await page.setViewportSize(viewport);
        await page.goto(url);
        await page.waitForSelector('.game-ui-showcase-shell');
        const metrics = await page.evaluate(collectPageMetrics);
        failures.push(...validateShowcaseMetrics(metrics));
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        if (height > viewport.max) {
          fail(
            'page height ' +
              height +
              'px exceeds ' +
              viewport.max +
              'px at ' +
              viewport.width +
              'px',
          );
        }
      }
    } catch (error) {
      if (process.env.CI) fail('page checks unavailable: ' + error.message);
    } finally {
      await browser?.close();
    }
  }

  return [...new Set(failures)];
}

const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === entry) {
  const failures = await runShowcaseCheck();
  if (failures.length) {
    console.error(failures.map((message) => 'showcase-check: ' + message).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('showcase-check: passed');
  }
}
