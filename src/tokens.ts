export {
  CLAY_ASSET_SIZE_TOKENS,
  CLAY_COLOR_TOKENS,
  CLAY_ELEVATION_TOKENS,
  CLAY_LAYER_TOKENS,
  CLAY_MOTION_TOKENS,
  CLAY_OVERLAY_GLASS_TOKENS,
  CLAY_RADIUS_TOKENS,
  CLAY_SEMANTIC_TOKENS,
  CLAY_SPACE_TOKENS,
  CLAY_TARGET_TOKENS,
  CLAY_TYPE_TOKENS,
  CLAY_UI_TOKENS,
  type ClayTokenCategory,
} from './clay/tokens';

import {
  CLAY_ASSET_SIZE_TOKENS,
  CLAY_ELEVATION_TOKENS,
  CLAY_LAYER_TOKENS,
  CLAY_MOTION_TOKENS,
  CLAY_RADIUS_TOKENS,
  CLAY_SEMANTIC_TOKENS,
  CLAY_SPACE_TOKENS,
  CLAY_TARGET_TOKENS,
  CLAY_TYPE_TOKENS,
} from './clay/tokens';

export const GAME_UI_TOKENS = {
  ...CLAY_SEMANTIC_TOKENS,
  ...CLAY_TYPE_TOKENS,
  ...CLAY_SPACE_TOKENS,
  ...CLAY_RADIUS_TOKENS,
  ...CLAY_ELEVATION_TOKENS,
  ...CLAY_MOTION_TOKENS,
  ...CLAY_LAYER_TOKENS,
  ...CLAY_ASSET_SIZE_TOKENS,
} as const;

// Alias for consumers that prefer the GAME_UI_* naming family.
export { CLAY_OVERLAY_GLASS_TOKENS as GAME_UI_OVERLAY_GLASS_TOKENS } from './clay/tokens';

/** Opt-in attribute values for the official overlay-glass HUD scope. */
export const GAME_UI_OVERLAY = {
  toneAttr: 'data-game-ui-tone',
  toneGlass: 'glass',
  densityAttr: 'data-game-ui-density',
  densityCompact: 'compact',
  scopeClass: 'game-ui-overlay-scope',
} as const;

export const GAME_UI_TARGETS = CLAY_TARGET_TOKENS;

/**
 * The semantic `--game-ui-*` custom properties a *complete* theme must
 * override for full fidelity — this is the same list the official
 * `[data-game-ui-theme='night']` block in theme.css satisfies, enforced by
 * a guard test in src/tokens.test.ts. A downstream product building its own
 * full theme (e.g. `[data-game-ui-theme='abyss']`) can reuse this constant
 * to check its own CSS for the same completeness instead of eyeballing it —
 * see "自定义第三主题" in design-system-guide.md for a usage example.
 */
export const GAME_UI_THEME_CONTRACT = [
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
] as const;
