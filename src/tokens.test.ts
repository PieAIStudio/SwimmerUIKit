import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { CLAY_COLOR_TOKENS, CLAY_TARGET_TOKENS, CLAY_UI_TOKENS, GAME_UI_TOKENS } from './tokens';

const SRC = dirname(fileURLToPath(import.meta.url));
const stylesCss = readFileSync(join(SRC, 'styles.css'), 'utf8');
const themeCss = readFileSync(join(SRC, 'theme.css'), 'utf8');

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
    const semanticColorVars = [
      '--game-ui-bg',
      '--game-ui-surface',
      '--game-ui-surface-raised',
      '--game-ui-panel',
      '--game-ui-panel-strong',
      '--game-ui-panel-deep',
      '--game-ui-text',
      '--game-ui-text-muted',
      '--game-ui-accent',
      '--game-ui-accent-bright',
      '--game-ui-secondary',
      '--game-ui-success',
      '--game-ui-success-bright',
      '--game-ui-danger',
      '--game-ui-danger-bright',
      '--game-ui-warning',
      '--game-ui-focus-ring',
      '--game-ui-border-subtle',
      '--game-ui-border-strong',
      '--game-ui-disabled',
      '--game-ui-ink-deep',
      '--game-ui-border-ink',
      '--game-ui-wood',
      '--game-ui-ink-title',
      '--game-ui-ink-heading',
    ];
    for (const cssVar of semanticColorVars) {
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

const bridgeCss = readFileSync(join(SRC, 'tailwind-bridge.css'), 'utf8');
const indexTs = readFileSync(join(SRC, 'index.ts'), 'utf8');
const pkg = JSON.parse(readFileSync(join(SRC, '..', 'package.json'), 'utf8')) as {
  license?: string;
  main?: string;
  module?: string;
  exports: Record<string, string | Record<string, string>>;
  peerDependencies: Record<string, string>;
  publishConfig?: {
    access?: string;
    registry?: string;
  };
};

describe('1.0 packaging contract (SPEC-0002)', () => {
  it('styles.css and theme.css are 100% standard CSS (no Tailwind at-rules)', () => {
    for (const css of [stylesCss, themeCss]) {
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
    expect(pkg.exports['./package.json']).toBe('./package.json');
    expect(Object.keys(pkg.peerDependencies).sort()).toEqual(['react', 'react-dom']);
  });

  it('publishes publicly to npmjs under the repository license', () => {
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
