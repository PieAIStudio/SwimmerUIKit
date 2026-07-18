import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameAssetIcon, GameBadge, GameHud } from './ClayComponents';
import { GameButton } from './GameButton';
import { GameProgress } from './GameDisplay';
import { GameIconButton, GamePanel } from './GameSurfaces';
import { CLAY_COLOR_TOKENS, CLAY_OVERLAY_GLASS_TOKENS, GAME_UI_OVERLAY } from './tokens';

const SRC = dirname(fileURLToPath(import.meta.url));
const stylesCss = readFileSync(join(SRC, 'styles.css'), 'utf8');
const themeCss = readFileSync(join(SRC, 'theme.css'), 'utf8');

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
// alone cannot steal the parser (same class of bug as night theme comments).
const glassVars = parseVars(
  blockOf(themeCss, "[data-game-ui-tone='glass'],\n.game-ui-overlay-scope"),
);

describe('overlay glass tokens', () => {
  it('defines overlay-glass primitives on :root', () => {
    expect(rootVars.get('--game-ui-overlay-glass-bg')).toBe(CLAY_COLOR_TOKENS.overlayGlass);
    expect(rootVars.get('--game-ui-overlay-glass-text')).toBe(CLAY_COLOR_TOKENS.overlayGlassText);
    expect(rootVars.get('--game-ui-overlay-glass-border')).toBe('rgba(255, 255, 255, 0.18)');
    expect(rootVars.get('--game-ui-overlay-glass-blur')).toBe('12px');
    expect(rootVars.has('--game-ui-overlay-glass-primary-fill')).toBe(true);
    expect(rootVars.has('--game-ui-overlay-glass-focus-ring')).toBe(true);
  });

  it('exports TS mirrors that point at the CSS variables', () => {
    expect(CLAY_OVERLAY_GLASS_TOKENS.bg).toBe('var(--game-ui-overlay-glass-bg)');
    expect(CLAY_OVERLAY_GLASS_TOKENS.text).toBe('var(--game-ui-overlay-glass-text)');
    expect(CLAY_OVERLAY_GLASS_TOKENS.border).toBe('var(--game-ui-overlay-glass-border)');
    expect(GAME_UI_OVERLAY.toneGlass).toBe('glass');
    expect(GAME_UI_OVERLAY.densityCompact).toBe('compact');
    expect(GAME_UI_OVERLAY.scopeClass).toBe('game-ui-overlay-scope');
  });

  it('glass tone re-scopes surface/text/elevation tokens while keeping brand accents', () => {
    // Surface tone, not a full theme: brand accents intentionally inherit so
    // primary/hover stay warm clay on dark glass.
    const required = [
      '--game-ui-surface',
      '--game-ui-surface-raised',
      '--game-ui-panel',
      '--game-ui-panel-strong',
      '--game-ui-panel-deep',
      '--game-ui-text',
      '--game-ui-text-muted',
      '--game-ui-border-subtle',
      '--game-ui-border-strong',
      '--game-ui-focus-ring',
      '--game-ui-ink-deep',
      '--game-ui-border-ink',
      '--game-ui-ink-title',
      '--game-ui-ink-heading',
      '--game-ui-shadow-button',
      '--game-ui-shadow-panel',
    ] as const;
    for (const cssVar of required) {
      expect(glassVars.has(cssVar), `glass tone missing ${cssVar}`).toBe(true);
    }
    expect(glassVars.get('--game-ui-surface')).toBe('var(--game-ui-overlay-glass-bg)');
    expect(glassVars.get('--game-ui-text')).toBe('var(--game-ui-overlay-glass-text)');
    expect(glassVars.get('--game-ui-shadow-button')).toBe('none');
    expect(glassVars.get('--game-ui-focus-ring')).toBe('var(--game-ui-overlay-glass-focus-ring)');
    // Warm accent stays on the inherited clay/night value — not redeclared here.
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
  it('styles glass buttons/panels without clay shadows and with warm primary fill', () => {
    expect(stylesCss).toContain("[data-game-ui-tone='glass'] .game-ui-button");
    expect(stylesCss).toContain('.game-ui-overlay-scope .game-ui-button');
    expect(stylesCss).toContain('var(--game-ui-overlay-glass-primary-fill)');
    expect(stylesCss).toContain('var(--game-ui-overlay-glass-border-hover)');
    expect(stylesCss).toContain('var(--game-ui-overlay-glass-bg-hover)');
    expect(stylesCss).toContain("[data-game-ui-tone='glass'] .game-ui-badge");
    expect(stylesCss).toContain("[data-game-ui-tone='glass'] .game-ui-panel");
    expect(stylesCss).toContain("[data-game-ui-tone='glass'] .game-ui-input");
    expect(stylesCss).toContain("[data-game-ui-tone='glass'] .game-ui-progress-track");
    expect(stylesCss).toContain("[data-game-ui-tone='glass'] .game-ui-asset-icon");
  });

  it('exposes compact density rules orthogonal to glass tone', () => {
    expect(stylesCss).toContain("[data-game-ui-density='compact'] .game-ui-button");
    expect(stylesCss).toContain("[data-game-ui-density='compact'] .game-ui-hud-chip");
    expect(stylesCss).toContain("[data-game-ui-density='compact'] .game-ui-input");
    expect(stylesCss).toMatch(
      /\[data-game-ui-density='compact'\] \.game-ui-button[\s\S]*?min-height:\s*34px/,
    );
  });

  it('renders a representative HUD cluster that consumers can wrap with the scope attrs', () => {
    const html = renderToStaticMarkup(
      <div
        className={GAME_UI_OVERLAY.scopeClass}
        {...{ [GAME_UI_OVERLAY.toneAttr]: GAME_UI_OVERLAY.toneGlass }}
        {...{ [GAME_UI_OVERLAY.densityAttr]: GAME_UI_OVERLAY.densityCompact }}
      >
        <GameHud
          label="HUD"
          items={[{ id: 'room', icon: 'copy', label: 'Room', value: '74X8' }]}
          actions={
            <GameIconButton label="Settings">
              <GameAssetIcon icon="settings" size="sm" />
            </GameIconButton>
          }
        />
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
    expect(html).toContain('game-ui-hud-chip');
  });
});
