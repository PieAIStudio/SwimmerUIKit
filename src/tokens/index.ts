import {
  assetSizeTokens,
  elevationTokens,
  layerTokens,
  liquidTokens,
  motionTokens,
  radiusTokens,
  scrollbarTokens,
  semanticTokens,
  spaceTokens,
  targetTokens,
  typeTokens,
} from './references';

export const GAME_UI_TOKENS = {
  ...semanticTokens,
  ...typeTokens,
  ...spaceTokens,
  ...radiusTokens,
  scrollbarSize: scrollbarTokens.size,
  scrollbarTrack: scrollbarTokens.track,
  scrollbarThumb: scrollbarTokens.thumb,
  scrollbarThumbHover: scrollbarTokens.thumbHover,
  ...elevationTokens,
  ...motionTokens,
  ...layerTokens,
  ...assetSizeTokens,
  ...liquidTokens,
} as const;

// Alias for consumers that prefer the GAME_UI_* naming family.
export { overlayTokens as GAME_UI_OVERLAY_GLASS_TOKENS } from './references';
export { liquidTokens as GAME_UI_LIQUID_GOOEY_TOKENS } from './references';

/** Opt-in attribute values for the official overlay-glass HUD scope. */
export const GAME_UI_OVERLAY = {
  toneAttr: 'data-game-ui-tone',
  toneGlass: 'glass',
  densityAttr: 'data-game-ui-density',
  densityCompact: 'compact',
  scopeClass: 'game-ui-overlay-scope',
} as const;

export const GAME_UI_TARGETS = targetTokens;

/**
 * The semantic `--swimmer-*` custom properties a *complete* theme must
 * override for full fidelity — this is the same list the official
 * `[data-game-ui-theme='dark']` block in theme.css satisfies, enforced by
 * a guard test in src/tokens.test.ts. A downstream product building its own
 * full theme (e.g. `[data-game-ui-theme='abyss']`) can reuse this constant
 * to check its own CSS for the same completeness instead of eyeballing it —
 * see "自定义第三主题" in design-system-guide.md for a usage example.
 */
export const GAME_UI_THEME_CONTRACT = [
  '--swimmer-game-bg',
  '--swimmer-game-surface',
  '--swimmer-game-surface-raised',
  '--swimmer-surface-sunken',
  '--swimmer-game-text',
  '--swimmer-game-text-muted',
  '--swimmer-game-accent',
  '--swimmer-accent-bright',
  '--swimmer-secondary',
  '--swimmer-game-success',
  '--swimmer-success-bright',
  '--swimmer-game-danger',
  '--swimmer-danger-bright',
  '--swimmer-game-warning',
  '--swimmer-focus-ring',
  '--swimmer-border-subtle',
  '--swimmer-border-strong',
  '--swimmer-disabled',
  '--swimmer-ink-deep',
  '--swimmer-border-ink',
  '--swimmer-wood',
  '--swimmer-ink-title',
  '--swimmer-ink-heading',
] as const;
