export const CLAY_COLOR_TOKENS = {
  ink: '#3b2d23',
  inkMuted: '#7b6652',
  parchment: '#fff8ec',
  parchmentDeep: '#f4e2c6',
  cream: '#f3e8d8',
  wood: '#6c4f38',
  woodDeep: '#3a2518',
  honey: '#f2b35c',
  orange: '#e8743b',
  teal: '#1d9a8b',
  green: '#4f9d6b',
  mint: '#7ee0b6',
  berry: '#9b6dd6',
  red: '#d85a45',
  sky: '#5ca6d8',
  shadow: 'rgba(76, 52, 28, 0.24)',
  glass: 'rgba(255, 248, 236, 0.82)',
  nightGlass: 'rgba(31, 24, 18, 0.76)',
} as const;

export const CLAY_SEMANTIC_TOKENS = {
  background: 'var(--game-ui-bg)',
  playfieldScrim: 'var(--game-ui-playfield-scrim)',
  surface: 'var(--game-ui-surface)',
  surfaceRaised: 'var(--game-ui-surface-raised)',
  panel: 'var(--game-ui-panel)',
  panelStrong: 'var(--game-ui-panel-strong)',
  text: 'var(--game-ui-text)',
  textMuted: 'var(--game-ui-text-muted)',
  accent: 'var(--game-ui-accent)',
  accentContrast: 'var(--game-ui-accent-contrast)',
  secondary: 'var(--game-ui-secondary)',
  success: 'var(--game-ui-success)',
  danger: 'var(--game-ui-danger)',
  warning: 'var(--game-ui-warning)',
  focusRing: 'var(--game-ui-focus-ring)',
  borderSubtle: 'var(--game-ui-border-subtle)',
  borderStrong: 'var(--game-ui-border-strong)',
  disabled: 'var(--game-ui-disabled)',
} as const;

export const CLAY_TYPE_TOKENS = {
  familyDisplay: 'var(--game-ui-font-display)',
  familyBody: 'var(--game-ui-font-body)',
  xs: 'var(--game-ui-font-xs)',
  sm: 'var(--game-ui-font-sm)',
  md: 'var(--game-ui-font-md)',
  lg: 'var(--game-ui-font-lg)',
  xl: 'var(--game-ui-font-xl)',
  xxl: 'var(--game-ui-font-xxl)',
  lineTight: 'var(--game-ui-line-tight)',
  lineBody: 'var(--game-ui-line-body)',
  weightBody: 'var(--game-ui-weight-body)',
  weightStrong: 'var(--game-ui-weight-strong)',
  weightTitle: 'var(--game-ui-weight-title)',
} as const;

export const CLAY_SPACE_TOKENS = {
  px2: 'var(--game-ui-space-2)',
  px4: 'var(--game-ui-space-4)',
  px6: 'var(--game-ui-space-6)',
  px8: 'var(--game-ui-space-8)',
  px10: 'var(--game-ui-space-10)',
  px12: 'var(--game-ui-space-12)',
  px16: 'var(--game-ui-space-16)',
  px20: 'var(--game-ui-space-20)',
  px24: 'var(--game-ui-space-24)',
  px32: 'var(--game-ui-space-32)',
  safeTop: 'var(--game-ui-safe-top)',
  safeRight: 'var(--game-ui-safe-right)',
  safeBottom: 'var(--game-ui-safe-bottom)',
  safeLeft: 'var(--game-ui-safe-left)',
} as const;

export const CLAY_RADIUS_TOKENS = {
  bead: 'var(--game-ui-radius-bead)',
  control: 'var(--game-ui-radius-control)',
  card: 'var(--game-ui-radius-card)',
  panel: 'var(--game-ui-radius-panel)',
  modal: 'var(--game-ui-radius-modal)',
} as const;

export const CLAY_ELEVATION_TOKENS = {
  button: 'var(--game-ui-shadow-button)',
  panel: 'var(--game-ui-shadow-panel)',
  modal: 'var(--game-ui-shadow-modal)',
  inset: 'var(--game-ui-shadow-inset)',
  stroke: 'var(--game-ui-stroke)',
} as const;

export const CLAY_MOTION_TOKENS = {
  fast: 'var(--game-ui-motion-fast)',
  base: 'var(--game-ui-motion-base)',
  slow: 'var(--game-ui-motion-slow)',
  easingPop: 'var(--game-ui-ease-pop)',
  easingSoft: 'var(--game-ui-ease-soft)',
  reducedMotion: 'var(--game-ui-reduced-motion-policy)',
} as const;

export const CLAY_LAYER_TOKENS = {
  playfield: 'var(--game-ui-z-playfield)',
  hud: 'var(--game-ui-z-hud)',
  sidebar: 'var(--game-ui-z-sidebar)',
  overlay: 'var(--game-ui-z-overlay)',
  modal: 'var(--game-ui-z-modal)',
  toast: 'var(--game-ui-z-toast)',
} as const;

export const CLAY_TARGET_TOKENS = {
  touchMinimumPx: 44,
  touchPrimaryPx: 52,
  touchIconPx: 48,
  touchRowPx: 46,
  adjacentSpacingPx: 8,
  mobileLandscapeMinHeightPx: 390,
  desktopProofWidthPx: 1440,
  desktopProofHeightPx: 900,
  mobileLandscapeProofWidthPx: 844,
  mobileLandscapeProofHeightPx: 390,
} as const;

export const CLAY_ASSET_SIZE_TOKENS = {
  iconSm: 'var(--game-ui-asset-icon-sm)',
  iconMd: 'var(--game-ui-asset-icon-md)',
  iconLg: 'var(--game-ui-asset-icon-lg)',
  iconXl: 'var(--game-ui-asset-icon-xl)',
  buttonSkinMinWidth: 'var(--game-ui-asset-button-min-width)',
  cardFanWidth: 'var(--game-ui-asset-card-fan-width)',
  stageTileMinHeight: 'var(--game-ui-stage-tile-min-height)',
  terrainSwatchSize: 'var(--game-ui-terrain-swatch-size)',
  terrainToolHitSize: 'var(--game-ui-terrain-tool-hit-size)',
  buildRailCardSize: 'var(--game-ui-build-rail-card-size)',
  brushNumberWidth: 'var(--game-ui-brush-number-width)',
} as const;

export const CLAY_UI_TOKENS = {
  colors: CLAY_COLOR_TOKENS,
  semantic: CLAY_SEMANTIC_TOKENS,
  typography: CLAY_TYPE_TOKENS,
  spacing: CLAY_SPACE_TOKENS,
  radius: CLAY_RADIUS_TOKENS,
  elevation: CLAY_ELEVATION_TOKENS,
  motion: CLAY_MOTION_TOKENS,
  layers: CLAY_LAYER_TOKENS,
  targets: CLAY_TARGET_TOKENS,
  assetSizing: CLAY_ASSET_SIZE_TOKENS,
} as const;

export type ClayTokenCategory = keyof typeof CLAY_UI_TOKENS;
