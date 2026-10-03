import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readComponentStyles } from '../../../tests/helpers/styles';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameIcon } from '../../icons/GameIcon/GameIcon';

import { GameButton } from '../../controls/GameButton/GameButton';
import { GameIconButton } from '../../controls/GameIconButton/GameIconButton';
import { GameBadge } from '../../feedback/GameBadge/GameBadge';
import { GameProgress } from '../../feedback/GameProgress/GameProgress';

import { GAME_UI_OVERLAY } from '../../tokens/index';
import { overlayTokens } from '../../tokens/references';
import { GamePanel } from '../GamePanel/GamePanel';

const SRC = fileURLToPath(new URL('../../', import.meta.url));
const stylesCss = readComponentStyles();
const themeCss = readFileSync(join(SRC, 'tokens', 'theme.css'), 'utf8');

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
// Prefer the multi-selector block start so a prose mention of the attribute
// alone cannot steal the parser (same class of bug as dark theme comments).
const glassVars = parseVars(
  blockOf(themeCss, "[data-game-ui-tone='glass'],\n.game-ui-overlay-scope"),
);

describe('overlay glass tokens', () => {
  it('defines overlay-glass primitives on :root', () => {
    expect(rootVars.get('--game-ui-overlay-glass-bg')).toBe('rgba(12, 14, 20, 0.72)');
    expect(rootVars.get('--game-ui-overlay-glass-text')).toBe('#fff6ee');
    expect(rootVars.get('--game-ui-overlay-glass-border')).toBe('rgba(255, 255, 255, 0.18)');
    expect(rootVars.get('--game-ui-overlay-glass-blur')).toBe('12px');
    expect(rootVars.has('--game-ui-overlay-glass-primary-fill')).toBe(true);
    expect(rootVars.has('--game-ui-overlay-glass-focus-ring')).toBe(true);
  });

  it('exports TS mirrors that point at the CSS variables', () => {
    expect(overlayTokens.bg).toBe('var(--game-ui-overlay-glass-bg)');
    expect(overlayTokens.text).toBe('var(--game-ui-overlay-glass-text)');
    expect(overlayTokens.border).toBe('var(--game-ui-overlay-glass-border)');
    expect(GAME_UI_OVERLAY.toneGlass).toBe('glass');
    expect(GAME_UI_OVERLAY.densityCompact).toBe('compact');
    expect(GAME_UI_OVERLAY.scopeClass).toBe('game-ui-overlay-scope');
  });

  it('glass tone re-scopes surface/text/elevation tokens while keeping brand accents', () => {
    // Surface tone, not a full theme: brand accents intentionally inherit so
    // primary/hover stay warm flat on dark glass.
    const required = [
      '--game-ui-surface',
      '--game-ui-surface-raised',
      '--game-ui-surface-sunken',
      '--game-ui-text',
      '--game-ui-text-muted',
      '--game-ui-border-subtle',
      '--game-ui-border-strong',
      '--game-ui-focus-ring',
      '--game-ui-ink-deep',
      '--game-ui-border-ink',
      '--game-ui-ink-title',
      '--game-ui-ink-heading',
      '--game-ui-shadow-raised',
    ] as const;
    for (const cssVar of required) {
      expect(glassVars.has(cssVar), `glass tone missing ${cssVar}`).toBe(true);
    }
    expect(glassVars.get('--game-ui-surface')).toBe('var(--game-ui-overlay-glass-bg)');
    expect(glassVars.get('--game-ui-text')).toBe('var(--game-ui-overlay-glass-text)');
    expect(glassVars.get('--game-ui-shadow-raised')).toBe('0 12px 32px rgba(0, 0, 0, 0.45)');
    expect(glassVars.get('--game-ui-focus-ring')).toBe('var(--game-ui-overlay-glass-focus-ring)');
    // Warm accent stays on the inherited flat/dark value — not redeclared here.
    expect(glassVars.has('--game-ui-accent')).toBe(false);
  });

  it('documents the class alias beside the data attribute selector', () => {
    expect(themeCss).toContain("[data-game-ui-tone='glass']");
    expect(themeCss).toContain('.game-ui-overlay-scope');
    // Both selectors share one rule block (alias, not a second token set).
    expect(themeCss).toMatch(/\[data-game-ui-tone='glass'\],\s*\n\.game-ui-overlay-scope\s*\{/);
  });
});

describe('overlay glass component rules', () => {
  it('keeps glass on containers without overriding the flat controls or tide CTA', () => {
    expect(stylesCss).not.toContain('var(--game-ui-overlay-glass-primary-fill)');
    expect(stylesCss).toContain('background: var(--game-ui-cta-from)');
    expect(stylesCss).toContain('color: var(--game-ui-cta-text)');
    expect(stylesCss).toContain('--game-ui-paint-fill: var(--game-ui-control-fill)');
    expect(stylesCss).not.toContain('var(--game-ui-overlay-glass-border-hover)');
    expect(stylesCss).not.toContain('var(--game-ui-overlay-glass-bg-hover)');
    expect(stylesCss).toContain("[data-game-ui-tone='glass'] .game-ui-badge");
    expect(stylesCss).toContain("[data-game-ui-tone='glass'] .game-ui-panel");
    expect(stylesCss).not.toContain("[data-game-ui-tone='glass'] .game-ui-input");
    expect(stylesCss).toContain('.game-ui-progress-flat-fill');
    expect(stylesCss).not.toContain("[data-game-ui-tone='glass'] .game-ui-progress-track");
    expect(stylesCss).not.toContain("[data-game-ui-tone='glass'] .game-ui-icon");
  });

  it('exposes compact density rules orthogonal to glass tone', () => {
    expect(stylesCss).toContain("[data-game-ui-density='compact'] .game-ui-button");
    expect(stylesCss).toContain("[data-game-ui-density='compact'] .game-ui-input");
    expect(stylesCss).toMatch(
      /\[data-game-ui-density='compact'\] \.game-ui-button[\s\S]*?min-height:\s*36px/,
    );
  });

  it('renders a representative HUD cluster that consumers can wrap with the scope attrs', () => {
    const html = renderToStaticMarkup(
      <div
        className={GAME_UI_OVERLAY.scopeClass}
        {...{ [GAME_UI_OVERLAY.toneAttr]: GAME_UI_OVERLAY.toneGlass }}
        {...{ [GAME_UI_OVERLAY.densityAttr]: GAME_UI_OVERLAY.densityCompact }}
      >
        <GameIconButton label="Settings">
          <GameIcon icon="settings" size="sm" />
        </GameIconButton>
        <GamePanel title="Dialogue">
          <GameBadge tone="ai">LIVE</GameBadge>
          <GameProgress label="Affinity" value={62} />
          <GameButton variant="primary">Continue</GameButton>
          <GameButton variant="secondary">Skip</GameButton>
        </GamePanel>
      </div>,
    );

    expect(html).toContain('game-ui-overlay-scope');
    expect(html).toContain('data-game-ui-tone="glass"');
    expect(html).toContain('data-game-ui-density="compact"');
    expect(html).toContain('game-ui-button--primary');
    expect(html).toContain('game-ui-badge');
    expect(html).toContain('game-ui-progress');
  });
});
