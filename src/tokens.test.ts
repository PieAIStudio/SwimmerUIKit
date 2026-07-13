import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { CLAY_COLOR_TOKENS, CLAY_TARGET_TOKENS, CLAY_UI_TOKENS, GAME_UI_THEME_CONTRACT, GAME_UI_TOKENS } from './tokens';

const SRC = dirname(fileURLToPath(import.meta.url));
const stylesCss = readFileSync(join(SRC, 'styles.css'), 'utf8');
const themeCss = readFileSync(join(SRC, 'theme.css'), 'utf8');
const previewCss = readFileSync(join(SRC, 'preview.css'), 'utf8');

/** Extract `--name: value;` declarations from a CSS block body. */
function parseVars(block: string): Map<string, string> {
  const vars = new Map<string, string>();
  for (const match of block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const name = match[1];
    const value = match[2];
    if (name && value) vars.set(`--${name}`, value.trim());
  }
  return vars;
}

function blockOf(css: string, selectorStart: string): string {
  const start = css.indexOf(selectorStart);
  if (start === -1) return '';
  const open = css.indexOf('{', start);
  let depth = 1;
  let i = open + 1;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth += 1;
    if (css[i] === '}') depth -= 1;
    i += 1;
  }
  return css.slice(open + 1, i - 1);
}

const rootVars = parseVars(blockOf(themeCss, ':root'));
const nightVars = parseVars(blockOf(themeCss, "[data-game-ui-theme='night']"));

describe('clay token exports', () => {
  it('exports CSS variable tokens for cross-stack integration', () => {
    expect(CLAY_UI_TOKENS.semantic.background).toBe('var(--game-ui-bg)');
    expect(CLAY_UI_TOKENS.typography.familyBody).toBe('var(--game-ui-font-body)');
    expect(GAME_UI_TOKENS.surface).toBe('var(--game-ui-surface)');
  });

  it('keeps proof viewport targets in code tokens', () => {
    expect(CLAY_TARGET_TOKENS.desktopProofWidthPx).toBe(1440);
    expect(CLAY_TARGET_TOKENS.desktopProofHeightPx).toBe(900);
    expect(CLAY_TARGET_TOKENS.mobileLandscapeProofWidthPx).toBe(844);
    expect(CLAY_TARGET_TOKENS.mobileLandscapeProofHeightPx).toBe(390);
  });
});

describe('token single source of truth', () => {
  it('styles.css contains no raw color literals (theme.css is the only raw-color home)', () => {
    const withoutComments = stylesCss.replace(/\/\*[\s\S]*?\*\//g, '');
    const literals = withoutComments.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/g) ?? [];
    expect(literals).toEqual([]);
  });

  it('TypeScript primitive colors match theme.css :root values', () => {
    const pairs: Array<[keyof typeof CLAY_COLOR_TOKENS, string]> = [
      ['ink', '--game-ui-text'],
      ['inkMuted', '--game-ui-text-muted'],
      ['parchment', '--game-ui-panel-strong'],
      ['cream', '--game-ui-bg'],
      ['orange', '--game-ui-accent'],
      ['teal', '--game-ui-secondary'],
      ['green', '--game-ui-success'],
      ['mint', '--game-ui-success-bright'],
      ['red', '--game-ui-danger'],
      ['honey', '--game-ui-warning'],
      ['berry', '--game-ui-berry'],
      ['wood', '--game-ui-wood'],
      ['woodDeep', '--game-ui-ink-deep'],
    ];
    for (const [tsKey, cssVar] of pairs) {
      expect(rootVars.get(cssVar), `${String(tsKey)} vs ${cssVar}`).toBe(CLAY_COLOR_TOKENS[tsKey]);
    }
  });

  it('night theme overrides every semantic color it needs (no missing token drift)', () => {
    // GAME_UI_THEME_CONTRACT is the single source of truth for this list —
    // it's also exported so downstream full themes can self-check the same way.
    for (const cssVar of GAME_UI_THEME_CONTRACT) {
      expect(nightVars.has(cssVar), `night theme missing ${cssVar}`).toBe(true);
    }
  });

  it('every var(--game-ui-*) referenced by styles.css is defined in theme.css', () => {
    // Component-owned knobs are set by TSX inline styles or consumers, with
    // either an explicit fallback in styles.css or a runtime value.
    const componentOwned = new Set([
      '--game-ui-card-offset',
      '--game-ui-asset-card-min-width',
      '--game-ui-asset-card-dense-min-width',
      '--game-ui-asset-rail-card-size',
      '--game-ui-asset-rail-preview-size',
    ]);
    const referenced = new Set<string>();
    for (const match of stylesCss.matchAll(/var\((--game-ui-[\w-]+)[,)]/g)) {
      const name = match[1];
      if (name) referenced.add(name);
    }
    const missing = [...referenced].filter(
      (name) => !rootVars.has(name) && !componentOwned.has(name),
    );
    expect(missing).toEqual([]);
  });
});

/**
 * WCAG 2.x relative luminance + contrast ratio, hex/rgb(a) only (every pair
 * checked below resolves to a literal color in theme.css, not a color-mix).
 */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function parseColor(value: string): [number, number, number] {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex?.[1]) {
    const h = hex[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const rgb = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgb?.[1] && rgb[2] && rgb[3]) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  throw new Error(`contrast guard: unsupported color value "${value}"`);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(parseColor(fg));
  const l2 = relativeLuminance(parseColor(bg));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

describe('WCAG contrast guard (locks in the 1.1 button/tab fixes)', () => {
  // Every pair below is normal-or-bold small UI text (not WCAG "large
  // text"), so the AA floor is 4.5:1 for all of them.
  const MIN_AA = 4.5;

  const pairs: Array<[string, string, string]> = [
    ['body text on page background', '--game-ui-text', '--game-ui-bg'],
    ['muted text on page background', '--game-ui-text-muted', '--game-ui-bg'],
    ['muted text on strong panel', '--game-ui-text-muted', '--game-ui-panel-strong'],
    // accent-contrast is the dark-ink foreground shared by primary/danger/
    // success buttons, the active tab/segmented pill, avatar initials, and
    // the checkbox checkmark — checking it against each saturated brand
    // background covers all of those call sites at once.
    ['primary button text on accent', '--game-ui-accent-contrast', '--game-ui-accent'],
    ['danger button text on danger', '--game-ui-accent-contrast', '--game-ui-danger'],
    ['success button text on success', '--game-ui-accent-contrast', '--game-ui-success'],
    ['active tab/segmented text on secondary', '--game-ui-accent-contrast', '--game-ui-secondary'],
    // 1.1 preview-split verification pass also caught these: raw brand
    // colors used directly as text (not as a button/badge background).
    ['field error/required text on panel', '--game-ui-danger-ink', '--game-ui-panel-strong'],
    ['first-session step number on panel', '--game-ui-accent-ink', '--game-ui-panel-strong'],
    // scenery-soil (not redeclared per-theme — HUD glass always overlays the
    // same dark 3D scene regardless of UI theme) stands in for the glass's
    // real backdrop, since color-mix() over an arbitrary scene can't be
    // reduced to one flat pair.
    ['hud-chip/fact-copy small text on dark glass', '--game-ui-text-on-dark', '--game-ui-scenery-soil'],
    ['selected build/terrain control meta text on panel', '--game-ui-ink-heading', '--game-ui-panel-strong'],
  ];

  it.each(pairs)('light: %s meets 4.5:1', (_label, fgVar, bgVar) => {
    const fg = rootVars.get(fgVar);
    const bg = rootVars.get(bgVar);
    expect(fg, `${fgVar} missing from :root`).toBeDefined();
    expect(bg, `${bgVar} missing from :root`).toBeDefined();
    expect(contrastRatio(fg as string, bg as string)).toBeGreaterThanOrEqual(MIN_AA);
  });

  it.each(pairs)('night: %s meets 4.5:1', (_label, fgVar, bgVar) => {
    // Night only redeclares the tokens it needs to change; fall back to the
    // root value for anything it inherits unchanged (e.g. accent-contrast).
    const fg = nightVars.get(fgVar) ?? rootVars.get(fgVar);
    const bg = nightVars.get(bgVar) ?? rootVars.get(bgVar);
    expect(fg, `${fgVar} missing from :root and night`).toBeDefined();
    expect(bg, `${bgVar} missing from :root and night`).toBeDefined();
    expect(contrastRatio(fg as string, bg as string)).toBeGreaterThanOrEqual(MIN_AA);
  });
});

const bridgeCss = readFileSync(join(SRC, 'tailwind-bridge.css'), 'utf8');
const fontsCss = readFileSync(join(SRC, 'fonts.css'), 'utf8');
const indexTs = readFileSync(join(SRC, 'index.ts'), 'utf8');
const pkg = JSON.parse(readFileSync(join(SRC, '..', 'package.json'), 'utf8')) as {
  name?: string;
  license?: string;
  main?: string;
  module?: string;
  exports: Record<string, string | Record<string, string>>;
  peerDependencies: Record<string, string>;
  bin?: Record<string, string>;
  publishConfig?: {
    access?: string;
    registry?: string;
  };
};

describe('1.0 packaging contract (SPEC-0002)', () => {
  it('styles.css, theme.css, and preview.css are 100% standard CSS (no Tailwind at-rules)', () => {
    for (const css of [stylesCss, themeCss, previewCss]) {
      const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
      const tailwindAtRules = withoutComments.match(/@(theme|tailwind|apply|plugin|config|utility)\b/g) ?? [];
      expect(tailwindAtRules).toEqual([]);
    }
  });

  it('tailwind-bridge.css is the only @theme home and maps only kit tokens', () => {
    const withoutComments = bridgeCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(withoutComments.match(/@theme\b/g)).toHaveLength(1);
    const mapped = [...withoutComments.matchAll(/:\s*var\((--[\w-]+)\)/g)]
      .map((match) => match[1])
      .filter((name): name is string => Boolean(name));
    expect(mapped.length).toBeGreaterThan(0);
    for (const name of mapped) expect(name).toMatch(/^--game-ui-/);
  });

  it('entry module never imports CSS (keeps dist/index.d.ts resolvable)', () => {
    const codeOnly = indexTs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
    expect(codeOnly).not.toMatch(/import\s+'[^']*\.css'/);
  });

  it('package stays ESM-only with react-only peers (publint/attw contract)', () => {
    expect(pkg.main).toBeUndefined();
    expect(pkg.module).toBeUndefined();
    const rootExport = pkg.exports['.'];
    expect(typeof rootExport).toBe('object');
    if (typeof rootExport === 'object') {
      expect(rootExport['require']).toBeUndefined();
      expect(rootExport['default']).toBe('./dist/index.js');
    }
    expect(pkg.exports['./tailwind.css']).toBe('./dist/tailwind.css');
    expect(pkg.exports['./preview.css']).toBe('./dist/preview.css');
    expect(pkg.exports['./fonts.css']).toBe('./dist/fonts.css');
    expect(pkg.exports['./package.json']).toBe('./package.json');
    expect(Object.keys(pkg.peerDependencies).sort()).toEqual(['react', 'react-dom']);
  });

  it('ships swimmer-ui-check as a bin so downstream products can lint their own token usage', () => {
    expect(pkg.bin?.['swimmer-ui-check']).toBe('./bin/swimmer-ui-check.mjs');
    expect(existsSync(join(SRC, '..', 'bin', 'swimmer-ui-check.mjs'))).toBe(true);
  });

  it('fonts.css is 100% standard CSS, only defines the theme.css font-family names, and ships its OFL licenses', () => {
    const withoutComments = fontsCss.replace(/\/\*[\s\S]*?\*\//g, '');
    const tailwindAtRules = withoutComments.match(/@(theme|tailwind|apply|plugin|config|utility)\b/g) ?? [];
    expect(tailwindAtRules).toEqual([]);

    const families = [...withoutComments.matchAll(/font-family:\s*'([^']+)'/g)].map((m) => m[1]);
    expect(families.sort()).toEqual(['Baloo 2', 'Geist Variable']);
    expect(themeCss).toContain("'Baloo 2'");
    expect(themeCss).toContain("'Geist Variable'");

    expect(existsSync(join(SRC, 'fonts', 'baloo-2-latin-variable.woff2'))).toBe(true);
    expect(existsSync(join(SRC, 'fonts', 'geist-sans-latin-variable.woff2'))).toBe(true);
    expect(existsSync(join(SRC, 'fonts', 'OFL-Baloo2.txt'))).toBe(true);
    expect(existsSync(join(SRC, 'fonts', 'OFL-Geist.txt'))).toBe(true);
  });

  it('demo-only GameUiPreview classes stay out of styles.css and live only in preview.css', () => {
    // Regression guard for the 1.1 preview/component CSS split: these class
    // names are used exclusively by GameUiPreview.tsx (verified by grepping
    // every other src/*.tsx at split time). If one leaks back into
    // styles.css, every consumer starts paying for demo-only CSS again.
    const previewOnlyClasses = [
      'game-ui-clay-preview',
      'game-ui-preview-hero',
      'game-ui-preview-section',
      'game-ui-swatch',
      'game-ui-swatch-grid',
      'game-ui-token-card',
      'game-ui-token-ledger',
      'game-ui-token-row',
      'game-ui-token-grid',
      'game-ui-type-scale',
      'game-ui-type-kicker',
      'game-ui-icon-gallery',
      'game-ui-icon-family',
      'game-ui-icon-grid',
      'game-ui-icon-cell',
      'game-ui-stage-demo',
      'game-ui-stage-world',
      'game-ui-stage-sidecar',
      'game-ui-proof-frame',
      'game-ui-proof-frames',
      'game-ui-first-session-preview',
      'game-ui-first-session-world',
      'game-ui-first-session-modal-slot',
      'game-ui-surface-pack-demo-scene',
      'game-ui-construction-preview-card',
      'game-ui-asset-compression-repro',
    ];
    for (const cls of previewOnlyClasses) {
      expect(stylesCss, `.${cls} must not be defined in styles.css`).not.toMatch(new RegExp(`\\.${cls}\\b`));
      expect(previewCss, `.${cls} must be defined in preview.css`).toMatch(new RegExp(`\\.${cls}\\b`));
    }
  });

  it('publishes publicly to npmjs under the repository license', () => {
    expect(pkg.name).toBe('@pieai/swimmer-ui-kit');
    expect(pkg.license).toBe('SEE LICENSE IN LICENSE');
    expect(pkg.publishConfig).toEqual({
      access: 'public',
      registry: 'https://registry.npmjs.org',
    });
  });

  it('wrapped-app hardening stays in place (touch + safe-area discipline)', () => {
    expect(stylesCss).toContain('touch-action: manipulation');
    expect(stylesCss).toContain('-webkit-tap-highlight-color: transparent');
    // All safe-area reads flow through --game-ui-safe-* tokens in theme.css so
    // hosts (e.g. Capacitor Android edge-to-edge) can override the source.
    const rulesOnly = stylesCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(rulesOnly.includes('env(safe-area-inset')).toBe(false);
    expect(themeCss.includes('env(safe-area-inset-top')).toBe(true);
  });
});
