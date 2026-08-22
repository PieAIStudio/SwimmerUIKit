#!/usr/bin/env node
// Scans consumer CSS for raw color literals living in component rules
// instead of flowing through SwimmerUIKit tokens. Mirrors the guard check
// the kit runs on its own styles.css in src/tokens.test.ts, packaged so
// downstream products can hold their own component CSS to the same
// "token-only" bar the design-system-guide asks for.
//
// Raw colors are expected (and fine) inside token-defining blocks —
// :root { ... } or an attribute-selector theme/tone block like
// [data-game-ui-theme='night'] / [data-game-ui-tone='glass'] /
// [data-theme='dark'] — since that is how the design-system-guide tells
// consumers to re-theme or re-scope surface tones. Only raw colors inside
// *other* selectors (component rules) are flagged.
//
// Usage: swimmer-ui-check [dir] [--ext=css,tsx]
//   dir      directory to scan, default "src"
//   --ext    comma-separated extensions to scan, default "css"
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/g;
const TOKEN_BLOCK_SELECTOR = /:root\b|\[data-[\w-]*(?:theme|tone)[\w-]*\s*=/i;
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

/* ---------------------------------------------------------------------------
 * Token pairs that cannot be read.
 *
 * The raw-colour rule above keeps consumers on tokens. It does not stop them
 * choosing two tokens that do not contrast, and the names make one pairing
 * genuinely inviting: `--game-ui-accent-ink` sounds like "the ink for accent
 * things" and means the opposite — accent-COLOURED ink for a surface. Painted
 * on `--game-ui-accent` it measured 1.48:1 in a shipping product, on that
 * product's primary button, and every test it had was green.
 *
 * PRODUCT.md promises "contrast-safe token combinations". That promise only
 * covers the pairs the kit uses itself unless something checks the consumer's.
 * So: read the theme values out of the kit's own styles.css, find rules that
 * set both a token background and a token colour, and compute the ratio.
 * ------------------------------------------------------------------------- */

const AA_NORMAL = 4.5;

function parseHex(value) {
  const hex = value.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{3,8}$/.test(hex)) return null;
  const full =
    hex.length === 3 || hex.length === 4
      ? hex
          .slice(0, 3)
          .split('')
          .map((c) => c + c)
          .join('')
      : hex.slice(0, 6);
  if (full.length !== 6) return null;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
}

function relativeLuminance([r, g, b]) {
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Token values per theme, read from the kit's shipped stylesheet.
 *
 * Only fully opaque hex values are kept. A token carrying alpha composites
 * against whatever is behind it, and guessing that would produce confident
 * numbers about a colour nobody can know from here.
 */
function themeTokens() {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  // dist/ is what a consumer installs. src/theme.css is what exists in this
  // repository before a build — and `pnpm test` runs before `pnpm build`, so
  // reading only dist made the check a silent no-op in its own CI while
  // passing locally off a stale dist. Silence is the failure mode this whole
  // check exists to remove, so it must not be the failure mode of the check.
  const sources = [join(packageRoot, 'dist', 'styles.css'), join(packageRoot, 'src', 'theme.css')];
  let css = null;
  for (const candidate of sources) {
    try {
      css = readFileSync(candidate, 'utf8');
      break;
    } catch {
      // try the next one
    }
  }
  if (css === null) return null;
  const themes = new Map();
  // The built stylesheet is minified and the attribute value loses its quotes,
  // so both forms have to match or every theme but the default is invisible.
  const blockRe = /(:root|\[data-game-ui-theme=['"]?([\w-]+)['"]?\])\s*\{([^}]*)\}/g;
  for (const match of css.matchAll(blockRe)) {
    const name = match[2] ?? 'light';
    const values = themes.get(name) ?? new Map(themes.get('light') ?? []);
    for (const decl of match[3].matchAll(/(--game-ui-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)) {
      const rgb = decl[2].length === 9 || decl[2].length === 5 ? null : parseHex(decl[2]);
      if (rgb) values.set(decl[1], rgb);
    }
    themes.set(name, values);
  }
  return themes;
}

/**
 * A bare token reference and nothing else: `var(--game-ui-x)` or
 * `var(--game-ui-x, #fallback)`.
 *
 * Deliberately refuses `color-mix(in srgb, var(--game-ui-accent) 18%,
 * transparent)` and gradients. A tint of the accent behind accent-coloured
 * text is perfectly readable, and reading the first token out of the
 * expression would call it 1.00:1 — the first draft of this check did exactly
 * that and flagged four rules that were fine. A linter that cries wolf is
 * worse than no linter, because the next real finding gets skimmed too.
 */
const BARE_TOKEN = /^\s*var\(\s*(--game-ui-[\w-]+)\s*(?:,[^()]*)?\)\s*$/;

function findContrastViolations(css, themes) {
  if (!themes || themes.size === 0) return [];
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const lineOf = lineFinder(withoutComments);
  const out = [];
  const ruleRe = /\{([^{}]*)\}/g;
  for (const rule of withoutComments.matchAll(ruleRe)) {
    const body = rule[1];
    const bg = /(?:^|[;\s])background(?:-color)?\s*:\s*([^;]+)/.exec(body);
    const fg = /(?:^|[;\s])color\s*:\s*([^;]+)/.exec(body);
    if (!bg || !fg) continue;
    const bgToken = BARE_TOKEN.exec(bg[1])?.[1];
    const fgToken = BARE_TOKEN.exec(fg[1])?.[1];
    if (!bgToken || !fgToken) continue;
    for (const [theme, values] of themes) {
      const bgRgb = values.get(bgToken);
      const fgRgb = values.get(fgToken);
      if (!bgRgb || !fgRgb) continue;
      const ratio = contrastRatio(bgRgb, fgRgb);
      if (ratio >= AA_NORMAL) continue;
      out.push({
        line: lineOf(rule.index + 1),
        theme,
        fgToken,
        bgToken,
        ratio: ratio.toFixed(2),
      });
    }
  }
  return out;
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

const themes = themeTokens();
if (!themes || themes.size === 0) {
  console.error(
    "swimmer-ui-check: could not read this package's theme tokens, so contrast was NOT checked. " +
      'Raw-colour linting below still ran.',
  );
}
let contrastCount = 0;
let violationCount = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const pair of findContrastViolations(text, themes)) {
    console.log(
      `${relative(process.cwd(), file)}:${pair.line}: ${pair.fgToken} on ${pair.bgToken} is ` +
        `${pair.ratio}:1 on the ${pair.theme} theme — below AA (${AA_NORMAL}:1)`,
    );
    contrastCount += 1;
  }
  for (const violation of findViolations(text)) {
    console.log(
      `${relative(process.cwd(), file)}:${violation.line}: raw color literal "${violation.text}" — use var(--game-ui-*) instead`,
    );
    violationCount += 1;
  }
}

if (contrastCount > 0) {
  console.error(
    `\nswimmer-ui-check: ${contrastCount} unreadable token pair(s). Two tokens are not ` +
      'automatically safe together: --game-ui-accent-ink is accent-COLOURED ink for a surface, ' +
      'while --game-ui-accent-contrast is the ink meant to sit on --game-ui-accent.',
  );
}

if (violationCount > 0 || contrastCount > 0) {
  console.error(
    `\nswimmer-ui-check: ${violationCount} raw color literal(s) in ${files.length} file(s) under "${target}". ` +
      'Raw colors are expected inside :root / [data-*theme*=...] / [data-*tone*=...] token blocks ' +
      '(that is how you re-theme or re-scope the kit) but not inside component rules — see the ' +
      'design-system-guide "主题化配方" section.',
  );
  process.exit(1);
}
console.log(
  `swimmer-ui-check: 0 raw color literals in component rules across ${files.length} file(s) under "${target}". Clean.`,
);
