#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const root = process.cwd();
const showcaseRoot = resolve(root, 'showcase');
const allowed = new Set(['Demo.tsx', 'demo.css', 'index.html', 'kit.json', 'main.ts', 'main.tsx']);
const failures = [];

function fail(message) {
  failures.push(message);
}

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
}

const distIndex = [
  join(root, 'showcase-dist', 'index.html'),
  join(root, 'showcase-dist', 'showcase', 'index.html'),
].find((candidate) => existsSync(candidate));
if (distIndex) {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'file://' + distIndex;
    for (const viewport of [
      { width: 1440, height: 900, max: 1700 },
      { width: 390, height: 844, max: 3000 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(url);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      if (height > viewport.max) {
        fail(
          'page height ' + height + 'px exceeds ' + viewport.max + 'px at ' + viewport.width + 'px',
        );
      }
    }
    await browser.close();
  } catch (error) {
    if (process.env.CI) fail('page-height check unavailable: ' + error.message);
  }
}

if (failures.length) {
  console.error(failures.map((message) => 'showcase-check: ' + message).join('\n'));
  process.exitCode = 1;
} else {
  console.log('showcase-check: passed');
}
