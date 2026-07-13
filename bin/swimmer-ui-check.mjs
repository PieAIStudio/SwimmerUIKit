#!/usr/bin/env node
// Scans consumer CSS for raw color literals living in component rules
// instead of flowing through SwimmerUIKit tokens. Mirrors the guard check
// the kit runs on its own styles.css in src/tokens.test.ts, packaged so
// downstream products can hold their own component CSS to the same
// "token-only" bar the design-system-guide asks for.
//
// Raw colors are expected (and fine) inside token-defining blocks —
// :root { ... } or an attribute-selector theme block like
// [data-game-ui-theme='night'] / [data-theme='dark'] — since that is
// exactly how the design-system-guide tells consumers to re-theme. Only
// raw colors inside *other* selectors (component rules) are flagged.
//
// Usage: swimmer-ui-check [dir] [--ext=css,tsx]
//   dir      directory to scan, default "src"
//   --ext    comma-separated extensions to scan, default "css"
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/g;
const TOKEN_BLOCK_SELECTOR = /:root\b|\[data-[\w-]*theme[\w-]*\s*=/i;
const IGNORE_DIRS = new Set([
  'node_modules',
  'dist',
  '.git',
  'storybook-static',
  'site-dist',
  'build',
]);

function walk(dir, exts, out) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, exts, out);
    else if (exts.has(extname(entry))) out.push(full);
  }
}

function lineFinder(text) {
  const offsets = [0];
  for (let i = 0; i < text.length; i += 1) if (text[i] === '\n') offsets.push(i + 1);
  return (index) => {
    let lo = 0;
    let hi = offsets.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (offsets[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
}

/**
 * Brace-depth scan (not a real CSS parser, good enough for this lint):
 * every `{`/`}` pushes/pops whether the block it opened is a token-defining
 * selector, and raw colors are only reported for declarations whose
 * innermost enclosing block is not one of those.
 */
function findViolations(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const lineOf = lineFinder(withoutComments);

  const blockIsTokenScope = [];
  let blockStart = 0;
  let cursor = 0;
  const violations = [];

  while (cursor < withoutComments.length) {
    const open = withoutComments.indexOf('{', cursor);
    const close = withoutComments.indexOf('}', cursor);
    if (open === -1 && close === -1) break;

    if (open !== -1 && (close === -1 || open < close)) {
      const selector = withoutComments.slice(blockStart, open);
      blockIsTokenScope.push(TOKEN_BLOCK_SELECTOR.test(selector));
      blockStart = open + 1;
      cursor = open + 1;
    } else {
      const body = withoutComments.slice(blockStart, close);
      const allowed = blockIsTokenScope.pop() ?? false;
      if (!allowed) {
        for (const match of body.matchAll(RAW_COLOR)) {
          violations.push({ line: lineOf(blockStart + match.index), text: match[0] });
        }
      }
      blockStart = close + 1;
      cursor = close + 1;
    }
  }
  return violations;
}

const args = process.argv.slice(2);
const target = args.find((a) => !a.startsWith('--')) ?? 'src';
const extArg = args.find((a) => a.startsWith('--ext='));
const exts = new Set(
  (extArg ? extArg.slice('--ext='.length).split(',') : ['css']).map((e) =>
    e.startsWith('.') ? e : `.${e}`,
  ),
);

const files = [];
try {
  walk(target, exts, files);
} catch (error) {
  console.error(`swimmer-ui-check: cannot read "${target}": ${error.message}`);
  process.exit(2);
}

let violationCount = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const violation of findViolations(text)) {
    console.log(
      `${relative(process.cwd(), file)}:${violation.line}: raw color literal "${violation.text}" — use var(--game-ui-*) instead`,
    );
    violationCount += 1;
  }
}

if (violationCount > 0) {
  console.error(
    `\nswimmer-ui-check: ${violationCount} raw color literal(s) in ${files.length} file(s) under "${target}". ` +
      'Raw colors are expected inside :root / [data-*theme*=...] token blocks (that is how you re-theme the kit) ' +
      'but not inside component rules — see the design-system-guide "主题化配方" section.',
  );
  process.exit(1);
}
console.log(
  `swimmer-ui-check: 0 raw color literals in component rules across ${files.length} file(s) under "${target}". Clean.`,
);
