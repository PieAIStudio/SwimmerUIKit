#!/usr/bin/env node
// Scans consumer CSS for raw color literals living in component rules
// instead of flowing through SwimmerUIKit tokens. Mirrors the guard check
// the kit runs on its own styles.css in tests/tokens.test.ts, packaged so
// downstream products can hold their own component CSS to the same
// "token-only" bar the design-system-guide asks for.
//
// Raw colors are expected (and fine) inside token-defining blocks —
// :root { ... } or an attribute-selector theme/tone block like
// [data-game-ui-theme='dark'] / [data-game-ui-tone='glass'] /
// [data-theme='dark'] — since that is how the design-system-guide tells
// consumers to re-theme or re-scope surface tones. Only raw colors inside
// *other* selectors (component rules) are flagged.
//
// Usage: swimmer-ui-check [dir ...] [--ext=css,tsx] [--rules=tokens,old-names,contrast,tool]
//   dir      one or more directories to scan, default "src"
//   --ext    comma-separated extensions to scan, default "css"
//   --rules  comma-separated rule groups; default: tokens,old-names,contrast; add tool for Colour Worlds
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findRetiredThemeValues } from './lib/retired-theme.mjs';

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
 * genuinely inviting: `--swimmer-game-accent-ink` sounds like "the ink for accent
 * things" and means the opposite — accent-COLOURED ink for a surface. Painted
 * on `--swimmer-game-accent` it measured 1.48:1 in a shipping product, on that
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
 * Fully opaque hex values, references and two-colour srgb token mixes are kept.
 * Resolve expressions AFTER combining each theme's declarations; carrying a
 * pre-resolved light colour into dark would invent a false contrast result.
 * A token carrying alpha composites
 * against whatever is behind it, and guessing that would produce confident
 * numbers about a colour nobody can know from here.
 */
function themeTokens() {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  // dist/ is what a consumer installs. src/tokens/theme.css exists in this
  // repository before a build — and `pnpm test` runs before `pnpm build`, so
  // reading only dist made the check a silent no-op in its own CI while
  // passing locally off a stale dist. Silence is the failure mode this whole
  // check exists to remove, so it must not be the failure mode of the check.
  // Prefer live source in a checkout: a previous build must not hide a new
  // missing or unreadable token. Installed packages have only the dist path.
  const sources = [
    join(packageRoot, 'src', 'tokens', 'theme.css'),
    join(packageRoot, 'dist', 'styles.css'),
  ];
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
  const declarations = new Map();
  // The built stylesheet is minified and the attribute value loses its quotes,
  // so both forms have to match or every theme but the default is invisible.
  const blockRe = /(:root|\[data-game-ui-theme=['"]?([\w-]+)['"]?\])\s*\{([^}]*)\}/g;
  for (const match of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(blockRe)) {
    const name = match[2] ?? 'light';
    const values = declarations.get(name) ?? new Map();
    for (const decl of match[3].matchAll(/(--swimmer-[\w-]+)\s*:\s*([^;}]+)/g))
      values.set(decl[1], decl[2].trim());
    declarations.set(name, values);
  }
  const themes = new Map();
  for (const [name, own] of declarations) {
    const values = new Map([...(declarations.get('light') ?? []), ...own]);
    const color = (value, seen = new Set()) => {
      if (!value) return null;
      if (/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return parseHex(value);
      const variable = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value);
      if (variable) {
        if (seen.has(variable[1])) return null;
        return color(values.get(variable[1]), new Set([...seen, variable[1]]));
      }
      const mix =
        /^color-mix\(\s*in\s+srgb\s*,\s*(var\(--[\w-]+\)|#[\da-f]+)\s*([\d.]+)%\s*,\s*(var\(--[\w-]+\)|#[\da-f]+)\s*\)$/i.exec(
          value,
        );
      if (!mix) return null; // Unknown/alpha paint is not guessed or inherited.
      const a = color(mix[1], seen),
        b = color(mix[3], seen),
        fraction = Number(mix[2]) / 100;
      return a && b && fraction >= 0 && fraction <= 1
        ? a.map((channel, i) => channel * fraction + b[i] * (1 - fraction))
        : null;
    };
    const resolved = new Map();
    for (const [variable, value] of values) {
      const rgb = color(value);
      if (rgb) resolved.set(variable, rgb);
    }
    themes.set(name, resolved);
  }
  return themes;
}

/**
 * Every `--swimmer-*` name this package defines, in any theme block.
 *
 * Colours only is not enough here: the gap this catches was a *font* token.
 */
function definedTokenNames() {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const sources = [
    join(packageRoot, 'src', 'tokens', 'theme.css'),
    join(packageRoot, 'dist', 'styles.css'),
  ];
  for (const candidate of sources) {
    try {
      const css = readFileSync(candidate, 'utf8');
      return new Set([...css.matchAll(/(--swimmer-[\w-]+)\s*:/g)].map((m) => m[1]));
    } catch {
      // try the next one
    }
  }
  return null;
}

/**
 * A `var(--swimmer-…)` naming a token this kit does not define.
 *
 * `var()` takes a fallback, so this never fails at runtime — the rule renders
 * from the fallback and looks token-driven while being nothing of the sort. A
 * consumer had six borders reading `var(--swimmer-border, #253048)` against a
 * token that does not exist, so those borders were a cold blue-grey in an app
 * whose theme is warm brown, for as long as the file had existed, and no brand
 * change could ever have reached them. Another was writing
 * `var(--swimmer-font-mono, …)` — that one turned out to be a real gap in this
 * kit, which is the other reason to surface it rather than let the fallback
 * hide it.
 *
 * Two things are not typos and are not flagged. A token the scanned files
 * define themselves is a downstream theme override, which is how theming
 * works. And a token written from code — `style={{ '--swimmer-card-offset': n }}`
 * — is a per-element channel that cannot have a stylesheet default; those are
 * found by scanning the sibling sources.
 *
 * Everything else is indistinguishable from a misspelling, and the way to say
 * "this is a deliberate knob" is to declare it in `:root` with its default.
 * That makes it discoverable and themeable instead of a secret only the
 * fallback knows.
 */
function findUndefinedTokens(css, defined, ownTokens) {
  if (!defined) return [];
  const at = lineFinder(css);
  const out = [];
  for (const match of css.matchAll(/var\(\s*(--swimmer-[\w-]+)/g)) {
    const name = match[1];
    if (defined.has(name) || ownTokens.has(name)) continue;
    out.push({ line: at(match.index ?? 0), name });
  }
  return out;
}

/**
 * A bare token reference and nothing else: `var(--swimmer-x)` or
 * `var(--swimmer-x, #fallback)`.
 *
 * Deliberately refuses `color-mix(in srgb, var(--swimmer-game-accent) 18%,
 * transparent)` and gradients. A tint of the accent behind accent-coloured
 * text is perfectly readable, and reading the first token out of the
 * expression would call it 1.00:1 — the first draft of this check did exactly
 * that and flagged four rules that were fine. A linter that cries wolf is
 * worse than no linter, because the next real finding gets skimmed too.
 */
const BARE_TOKEN = /^\s*var\(\s*(--swimmer-[\w-]+)\s*(?:,[^()]*)?\)\s*$/;

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

function toolLineFinder(text) {
  return lineFinder(text.replace(/\r\n/g, '\n'));
}

function checkboxIsHidden(text, element) {
  if (
    /class(?:Name)?\s*=\s*[^>]*(?:sr-only|visually-hidden|hidden-checkbox|checkbox-input|switch-input|appearance-none)/i.test(
      element,
    )
  ) {
    return true;
  }
  const classes = [...element.matchAll(/(?:class|className)\s*=\s*["'{ ]([^"'}]+)/gi)]
    .flatMap((match) => match[1].split(/\s+/))
    .filter(Boolean);
  return classes.some((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(
      `\\.${escaped}\\s*\\{[^}]*?(?:clip-path|appearance\\s*:\\s*none|width\\s*:\\s*1px|opacity\\s*:\\s*0)`,
      'is',
    ).test(text);
  });
}

function isOpaqueWhite(value) {
  const normalized = value.trim().toLowerCase();
  if (/^(?:white|#fff(?:fff)?|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))$/.test(normalized)) return true;
  const alpha = /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)/.exec(normalized);
  if (alpha) return Number(alpha[1]) > 0.8;
  const mix = /color-mix\(.*\bwhite\s+(\d+(?:\.\d+)?)%/i.exec(normalized);
  return Boolean(mix && Number(mix[1]) > 80);
}

function findToolViolations(files) {
  const violations = [];
  const add = (file, index, message) => {
    const text = readFileSync(file, 'utf8');
    violations.push({ file, line: toolLineFinder(text)(index), message });
  };
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const extension = extname(file);
    const isCode = CODE_EXTENSIONS.has(extension);
    if (isCode || extension === '.html' || extension === '.vue' || extension === '.svelte') {
      for (const match of text.matchAll(/<select\b|\bselect\s*\{/gi)) {
        add(file, match.index ?? 0, 'native select is not allowed in a Colour Worlds tool');
      }
      for (const match of text.matchAll(/<input\b[^>]*\btype\s*=\s*["']checkbox["'][^>]*>/gi)) {
        if (!checkboxIsHidden(text, match[0])) {
          add(
            file,
            match.index ?? 0,
            'visible native checkbox is not allowed; use Checkbox or Switch',
          );
        }
      }
      if (!/RoundAction/.test(text)) {
        for (const match of text.matchAll(
          /data-tool-main-action|(?:class|className)\s*=\s*["'{][^"'}]*(?:main-action|mainAction)/gi,
        )) {
          add(file, match.index ?? 0, 'main action must be RoundAction');
        }
      }
    }
    if (extension !== '.css') continue;
    const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
    for (const match of text.matchAll(ruleRe)) {
      const selector = match[1].trim().toLowerCase();
      const body = match[2];
      const bodyOffset = (match.index ?? 0) + match[0].indexOf(body);
      if (selector.includes('sidebar')) {
        const background = /background(?:-color)?\s*:\s*([^;]+)/i.exec(body)?.[1];
        if (background && !/^(?:transparent|none)$/i.test(background.trim())) {
          add(file, bodyOffset, 'sidebar must stay transparent in a Colour Worlds tool');
        }
      }
      if (selector.includes('card') && !/(?:manager|sheet|tool-sheet)/i.test(selector)) {
        const background = /background(?:-color)?\s*:\s*([^;]+)/i.exec(body)?.[1];
        if (background && isOpaqueWhite(background)) {
          add(
            file,
            bodyOffset,
            'opaque white card directly on a world is not allowed; use GlassCard',
          );
        }
      }
      if (selector.includes('main-action') && !/round-action/i.test(selector + body)) {
        add(file, bodyOffset, 'main action must be RoundAction');
      }
    }
  }
  return violations;
}

const RULE_GROUPS = ['tokens', 'old-names', 'contrast', 'tool'];
const DEFAULT_RULE_GROUPS = ['tokens', 'old-names', 'contrast'];
const RULE_ALIASES = new Map([
  ['token', 'tokens'],
  ['tokens', 'tokens'],
  ['old', 'old-names'],
  ['old-name', 'old-names'],
  ['old-names', 'old-names'],
  ['old_names', 'old-names'],
  ['oldnames', 'old-names'],
  ['old names', 'old-names'],
  ['contrast', 'contrast'],
  ['tool', 'tool'],
  ['tools', 'tool'],
]);
const SOURCE_EXTENSIONS = new Set([
  '.css',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.mts',
  '.cts',
  '.html',
  '.vue',
  '.svelte',
]);
const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

function printUsage() {
  console.error(
    'Usage: swimmer-ui-check [dir ...] [--ext=css,tsx] [--rules=tokens,old-names,contrast,tool]\n' +
      '  default directory: src\n' +
      '  default rules: tokens,old-names,contrast\n' +
      '  rules: tokens, old-names, contrast, tool (Colour Worlds)',
  );
}

function parseRuleGroups(value) {
  const selected = new Set();
  for (const raw of value.split(',')) {
    const name = raw.trim().toLowerCase();
    if (name === 'all') {
      for (const group of RULE_GROUPS) selected.add(group);
      continue;
    }
    const group = RULE_ALIASES.get(name);
    if (!group) throw new Error(`unknown rule group "${raw.trim()}"`);
    selected.add(group);
  }
  if (selected.size === 0) throw new Error('at least one rule group is required');
  return selected;
}

function parseArgs(rawArgs) {
  const targets = [];
  let extValue = 'css';
  let explicitExt = false;
  let rules = new Set(DEFAULT_RULE_GROUPS);
  let explicitRules = false;

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--ext') {
      extValue = rawArgs[++index] ?? '';
      explicitExt = true;
      continue;
    }
    if (arg.startsWith('--ext=')) {
      extValue = arg.slice('--ext='.length);
      explicitExt = true;
      continue;
    }
    if (arg === '--rules') {
      const value = rawArgs[++index] ?? '';
      rules = parseRuleGroups(value);
      explicitRules = true;
      continue;
    }
    if (arg.startsWith('--rules=')) {
      rules = parseRuleGroups(arg.slice('--rules='.length));
      explicitRules = true;
      continue;
    }
    if (arg.startsWith('--')) throw new Error(`unknown option "${arg}"`);
    targets.push(arg);
  }

  const exts = new Set(
    extValue
      .split(',')
      .filter(Boolean)
      .map((extension) => (extension.startsWith('.') ? extension : `.${extension}`)),
  );
  if (exts.size === 0) throw new Error('at least one file extension is required');
  return {
    help: false,
    targets: targets.length > 0 ? targets : ['src'],
    exts,
    rules,
    explicitExt,
    explicitRules,
  };
}

function collectFiles(target, exts) {
  const files = [];
  walk(target, exts, files);
  return files;
}

function scanTarget(target, options, themes, definedTokens) {
  const { exts, rules } = options;
  const files = collectFiles(target, exts);
  const counts = { contrast: 0, undefined: 0, raw: 0, oldNames: 0, tool: 0 };

  if (rules.has('old-names')) {
    const themeFiles = collectFiles(target, SOURCE_EXTENSIONS);
    for (const file of themeFiles) {
      for (const violation of findRetiredThemeValues(readFileSync(file, 'utf8'))) {
        console.error(`${relative(process.cwd(), file)}:${violation.line}: ${violation.message}`);
        counts.oldNames += 1;
      }
    }
  }

  if (rules.has('tool')) {
    const toolFiles = collectFiles(target, SOURCE_EXTENSIONS);
    for (const violation of findToolViolations(toolFiles)) {
      console.error(
        `${relative(process.cwd(), violation.file)}:${violation.line}: ${violation.message}`,
      );
      counts.tool += 1;
    }
  }

  let ownTokens = new Set();
  if (rules.has('tokens')) {
    for (const file of files) {
      for (const match of readFileSync(file, 'utf8').matchAll(/^\s*(--swimmer-[\w-]+)\s*:/gm)) {
        ownTokens.add(match[1]);
      }
    }
    // Tokens written from code are a per-element channel, not a theme value.
    const codeFiles = collectFiles(target, CODE_EXTENSIONS);
    for (const file of codeFiles) {
      if (/\.(?:test|spec|stories)\.[cm]?[jt]sx?$/.test(file)) continue;
      const code = readFileSync(file, 'utf8');
      // A quoted name is not a definition: tests and read-only token lookups
      // previously hid undefined CSS hooks. Accept actual inline style writes or
      // native setProperty writes, not arbitrary strings containing token names.
      for (const pattern of [
        /['"`](--swimmer-[\w-]+)['"`]\s*\]?\s*:/g,
        /\.setProperty\(\s*['"`](--swimmer-[\w-]+)['"`]/g,
      ]) {
        for (const match of code.matchAll(pattern)) ownTokens.add(match[1]);
      }
    }
  }

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    if (rules.has('contrast')) {
      for (const pair of findContrastViolations(text, themes)) {
        console.log(
          `${relative(process.cwd(), file)}:${pair.line}: ${pair.fgToken} on ${pair.bgToken} is ` +
            `${pair.ratio}:1 on the ${pair.theme} theme — below AA (${AA_NORMAL}:1)`,
        );
        counts.contrast += 1;
      }
    }
    if (rules.has('tokens')) {
      for (const undef of findUndefinedTokens(text, definedTokens, ownTokens)) {
        console.log(
          `${relative(process.cwd(), file)}:${undef.line}: ${undef.name} is not a token this kit ` +
            'defines — the var() fallback is doing all the work',
        );
        counts.undefined += 1;
      }
      for (const violation of findViolations(text)) {
        console.log(
          `${relative(process.cwd(), file)}:${violation.line}: raw color literal "${violation.text}" — use var(--swimmer-*) instead`,
        );
        counts.raw += 1;
      }
    }
  }

  return { files, counts };
}

const args = process.argv.slice(2);
let parsed;
try {
  parsed = parseArgs(args);
} catch (error) {
  console.error(`swimmer-ui-check: ${error.message}`);
  printUsage();
  process.exit(2);
}
if (parsed.help) {
  printUsage();
  process.exit(0);
}

const themes = parsed.rules.has('contrast') ? themeTokens() : null;
const definedTokens = parsed.rules.has('tokens') ? definedTokenNames() : null;
if (parsed.rules.has('contrast') && (!themes || themes.size === 0)) {
  console.error(
    "swimmer-ui-check: could not read this package's theme tokens, so contrast was NOT checked. " +
      'Token linting below still ran.',
  );
}

const legacyInvocation =
  parsed.targets.length === 1 && !parsed.explicitExt && !parsed.explicitRules;
let failed = false;
for (const target of parsed.targets) {
  const label = target || '.';
  if (!legacyInvocation) {
    console.log(
      `swimmer-ui-check: checking directory "${label}" (rules: ${[...parsed.rules].join(', ')}).`,
    );
  }

  let result;
  try {
    result = scanTarget(target, parsed, themes, definedTokens);
  } catch (error) {
    console.error(`swimmer-ui-check: cannot read "${target}": ${error.message}`);
    process.exit(2);
  }

  const { files, counts } = result;
  const hasErrors = Object.values(counts).some((count) => count > 0);
  if (counts.contrast > 0) {
    console.error(
      `\nswimmer-ui-check: ${counts.contrast} unreadable token pair(s) in "${label}". ` +
        'Two tokens are not automatically safe together: --swimmer-game-accent-ink is ' +
        'accent-COLOURED ink for a surface, while --swimmer-accent-contrast is the ink meant ' +
        'to sit on --swimmer-game-accent.',
    );
  }
  if (counts.undefined > 0) {
    console.error(
      `\nswimmer-ui-check: ${counts.undefined} reference(s) to an undefined token in "${label}". ` +
        'These never fail at runtime, because var() falls back — which is exactly why they survive. ' +
        'Either the name is wrong, or the token is missing from the kit and should be proposed there.',
    );
  }
  if (hasErrors) {
    failed = true;
    if (legacyInvocation) {
      console.error(
        `\nswimmer-ui-check: ${counts.raw} raw color literal(s) in ${files.length} file(s) under "${target}". ` +
          'Raw colors are expected inside :root / [data-*theme*=...] / [data-*tone*=...] token blocks ' +
          '(that is how you re-theme or re-scope the kit) but not inside component rules — see the ' +
          'design-system-guide "主题化配方" section.',
      );
    } else {
      console.error(
        `swimmer-ui-check: directory "${label}" failed ` +
          `(${counts.raw} raw colors, ${counts.undefined} undefined tokens, ${counts.contrast} contrast issues, ${counts.oldNames} old-name issues, ${counts.tool} tool issues).`,
      );
    }
    continue;
  }

  if (legacyInvocation) {
    console.log(
      `swimmer-ui-check: 0 raw color literals in component rules across ${files.length} file(s) under "${target}". Clean.`,
    );
  } else {
    console.log(
      `swimmer-ui-check: directory "${label}" clean across ${files.length} file(s) ` +
        `(rules: ${[...parsed.rules].join(', ')}).`,
    );
  }
}
if (failed) process.exit(1);
