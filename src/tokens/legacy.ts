export const CLAY_COLOR_TOKENS = {
  ink: '#3b2d23',
  inkMuted: '#786250',
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
  /** Official HUD-on-scene glass fill (matches SupaLuv stage chrome). */
  overlayGlass: 'rgba(12, 14, 20, 0.72)',
  overlayGlassText: '#fff6ee',
  /** Liquid-metal plate fill (light). Dedicated so it cannot inherit ink-deep, which inverts on night. */
  liquidMetalFace: '#3a2518',
  liquidMetalInk: '#fff8ec',
} as const;

/**
 * Effect knobs for `<LiquidMetalButton>`. Face/ink are real colours (both
 * themes must set them); accent aliases `--game-ui-accent` so a host can
 * retint just this button without rebranding every primary.
 */
export const CLAY_LIQUID_METAL_TOKENS = {
  face: 'var(--game-ui-liquid-metal-face)',
  ink: 'var(--game-ui-liquid-metal-ink)',
  accent: 'var(--game-ui-liquid-metal-accent)',
  dispersion: 'var(--game-ui-liquid-metal-dispersion)',
  sweepSpeed: 'var(--game-ui-liquid-metal-sweep-speed)',
  rest: 'var(--game-ui-liquid-metal-rest)',
  bloom: 'var(--game-ui-liquid-metal-bloom)',
} as const;

/**
 * Token references for the adopted liquid-gooey Move physics. The values are
 * deliberately numeric custom properties so a host theme can tune the feel
 * without putting physics constants in the engine.
 */
export const CLAY_LIQUID_GOOEY_TOKENS = {
  morphShape: 'var(--game-ui-liquid-gooey-morph-shape)',
  morphSpeed: 'var(--game-ui-liquid-gooey-morph-speed)',
  morphBounce: 'var(--game-ui-liquid-gooey-morph-bounce)',
  evolveMassStiffness: 'var(--game-ui-liquid-gooey-evolve-mass-stiffness)',
  evolveMassDamping: 'var(--game-ui-liquid-gooey-evolve-mass-damping)',
  evolveSizeStiffness: 'var(--game-ui-liquid-gooey-evolve-size-stiffness)',
  evolveSizeDamping: 'var(--game-ui-liquid-gooey-evolve-size-damping)',
  evolveRadiusStiffness: 'var(--game-ui-liquid-gooey-evolve-radius-stiffness)',
  evolveRadiusDamping: 'var(--game-ui-liquid-gooey-evolve-radius-damping)',
  evolveContentBlur: 'var(--game-ui-liquid-gooey-evolve-content-blur)',
  evolveRoundness: 'var(--game-ui-liquid-gooey-evolve-roundness)',
  evolveCornerDuration: 'var(--game-ui-liquid-gooey-evolve-corner-duration)',
  evolveCornerDelay: 'var(--game-ui-liquid-gooey-evolve-corner-delay)',
  evolveCornerEase: 'var(--game-ui-liquid-gooey-evolve-corner-ease)',
  evolveAnticipation: 'var(--game-ui-liquid-gooey-evolve-anticipation)',
  evolveTravel: 'var(--game-ui-liquid-gooey-evolve-travel)',
  contentBlurAreaMultiplier: 'var(--game-ui-liquid-gooey-content-blur-area-multiplier)',
  bendVertical: 'var(--game-ui-liquid-gooey-bend-vertical)',
  bendHorizontal: 'var(--game-ui-liquid-gooey-bend-horizontal)',
  bendVelocityVertical: 'var(--game-ui-liquid-gooey-bend-velocity-vertical)',
  bendVelocityHorizontal: 'var(--game-ui-liquid-gooey-bend-velocity-horizontal)',
  bendSmoothing: 'var(--game-ui-liquid-gooey-bend-smoothing)',
  bendActiveThreshold: 'var(--game-ui-liquid-gooey-bend-active-threshold)',
  bendVerticalCap: 'var(--game-ui-liquid-gooey-bend-vertical-cap)',
  bendHorizontalCap: 'var(--game-ui-liquid-gooey-bend-horizontal-cap)',
  bendRadiusMin: 'var(--game-ui-liquid-gooey-bend-radius-min)',
  bendRadiusMax: 'var(--game-ui-liquid-gooey-bend-radius-max)',
  bendLeadingCapFactor: 'var(--game-ui-liquid-gooey-bend-leading-cap-factor)',
  bendTrailingCapFactor: 'var(--game-ui-liquid-gooey-bend-trailing-cap-factor)',
  moveStiffness: 'var(--game-ui-liquid-gooey-move-stiffness)',
  moveDamping: 'var(--game-ui-liquid-gooey-move-damping)',
  moveStretch: 'var(--game-ui-liquid-gooey-move-stretch)',
  moveTail: 'var(--game-ui-liquid-gooey-move-tail)',
  moveForce: 'var(--game-ui-liquid-gooey-move-force)',
  moveTailSpringStiffness: 'var(--game-ui-liquid-gooey-move-tail-spring-stiffness)',
  moveTailSpringDamping: 'var(--game-ui-liquid-gooey-move-tail-spring-damping)',
  moveStretchSpeed: 'var(--game-ui-liquid-gooey-move-stretch-speed)',
  moveStretchSquash: 'var(--game-ui-liquid-gooey-move-stretch-squash)',
  moveSpeedThreshold: 'var(--game-ui-liquid-gooey-move-speed-threshold)',
  moveTailOnsetSpeed: 'var(--game-ui-liquid-gooey-move-tail-onset-speed)',
  moveTailOnsetRange: 'var(--game-ui-liquid-gooey-move-tail-onset-range)',
  moveTailRamp: 'var(--game-ui-liquid-gooey-move-tail-ramp)',
  moveTailMinRadius: 'var(--game-ui-liquid-gooey-move-tail-min-radius)',
  moveTailWobble: 'var(--game-ui-liquid-gooey-move-tail-wobble)',
  moveTailPhaseSpeed: 'var(--game-ui-liquid-gooey-move-tail-phase-speed)',
  moveTailMidpointA: 'var(--game-ui-liquid-gooey-move-tail-midpoint-a)',
  moveTailMidpointB: 'var(--game-ui-liquid-gooey-move-tail-midpoint-b)',
  moveTailMidRadiusA: 'var(--game-ui-liquid-gooey-move-tail-mid-radius-a)',
  moveTailMidRadiusB: 'var(--game-ui-liquid-gooey-move-tail-mid-radius-b)',
  moveTailWobblePhase: 'var(--game-ui-liquid-gooey-move-tail-wobble-phase)',
  moveMinPerpendicular: 'var(--game-ui-liquid-gooey-move-min-perpendicular)',
  moveLagBase: 'var(--game-ui-liquid-gooey-move-lag-base)',
  moveLagForce: 'var(--game-ui-liquid-gooey-move-lag-force)',
  moveSettleDistance: 'var(--game-ui-liquid-gooey-move-settle-distance)',
  moveSettleSpeed: 'var(--game-ui-liquid-gooey-move-settle-speed)',
  moveIntegrationRate: 'var(--game-ui-liquid-gooey-move-integration-rate)',
  waviness: 'var(--game-ui-liquid-gooey-waviness)',
  wavinessFreq: 'var(--game-ui-liquid-gooey-waviness-freq)',
  meltBlur: 'var(--game-ui-liquid-gooey-melt-blur)',
  meltContrast: 'var(--game-ui-liquid-gooey-melt-contrast)',
  meltReach: 'var(--game-ui-liquid-gooey-melt-reach)',
  meltFade: 'var(--game-ui-liquid-gooey-melt-fade)',
  meltWarp: 'var(--game-ui-liquid-gooey-melt-warp)',
  meltMix: 'var(--game-ui-liquid-gooey-melt-mix)',
  meltMixBlur: 'var(--game-ui-liquid-gooey-melt-mix-blur)',
  meltGravity: 'var(--game-ui-liquid-gooey-melt-gravity)',
  meltWaviness: 'var(--game-ui-liquid-gooey-melt-waviness)',
  dissolveBlur: 'var(--game-ui-liquid-gooey-dissolve-blur)',
  dissolveWarp: 'var(--game-ui-liquid-gooey-dissolve-warp)',
  dissolvePull: 'var(--game-ui-liquid-gooey-dissolve-pull)',
  dissolveRange: 'var(--game-ui-liquid-gooey-dissolve-range)',
  dissolveZone: 'var(--game-ui-liquid-gooey-dissolve-zone)',
  dissolveMix: 'var(--game-ui-liquid-gooey-dissolve-mix)',
  dissolveGravity: 'var(--game-ui-liquid-gooey-dissolve-gravity)',
  dissolveTaper: 'var(--game-ui-liquid-gooey-dissolve-taper)',
  dissolveWarpFreq: 'var(--game-ui-liquid-gooey-dissolve-warp-freq)',
  dissolveFlowSpeed: 'var(--game-ui-liquid-gooey-dissolve-flow-speed)',
  dissolveDetail: 'var(--game-ui-liquid-gooey-dissolve-detail)',
  dissolveReleaseMs: 'var(--game-ui-liquid-gooey-dissolve-release-ms)',
  dissolveFadeMs: 'var(--game-ui-liquid-gooey-dissolve-fade-ms)',
  dissolveStrength: 'var(--game-ui-liquid-gooey-dissolve-strength)',
  dissolveSink: 'var(--game-ui-liquid-gooey-dissolve-sink)',
  dissolveSeamBlur: 'var(--game-ui-liquid-gooey-dissolve-seam-blur)',
} as const;

/**
 * Semantic CSS vars for the official overlay-glass HUD tone
 * (`data-game-ui-tone="glass"` / `.game-ui-overlay-scope`).
 */
export const CLAY_OVERLAY_GLASS_TOKENS = {
  bg: 'var(--game-ui-overlay-glass-bg)',
  bgHover: 'var(--game-ui-overlay-glass-bg-hover)',
  bgStrong: 'var(--game-ui-overlay-glass-bg-strong)',
  bgPanel: 'var(--game-ui-overlay-glass-bg-panel)',
  border: 'var(--game-ui-overlay-glass-border)',
  borderHover: 'var(--game-ui-overlay-glass-border-hover)',
  text: 'var(--game-ui-overlay-glass-text)',
  textMuted: 'var(--game-ui-overlay-glass-text-muted)',
  blur: 'var(--game-ui-overlay-glass-blur)',
  focusRing: 'var(--game-ui-overlay-glass-focus-ring)',
  primaryFill: 'var(--game-ui-overlay-glass-primary-fill)',
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
  familyMono: 'var(--game-ui-font-mono)',
  xs: 'var(--game-ui-font-xs)',
  sm: 'var(--game-ui-font-sm)',
  md: 'var(--game-ui-font-md)',
  lg: 'var(--game-ui-font-lg)',
  xl: 'var(--game-ui-font-xl)',
  xxl: 'var(--game-ui-font-xxl)',
  lineTight: 'var(--game-ui-line-tight)',
  lineBody: 'var(--game-ui-line-body)',
  /* Long-form reading. See theme.css — the scale above is a HUD scale. */
  reading: 'var(--game-ui-font-reading)',
  lineReading: 'var(--game-ui-line-reading)',
  measureReading: 'var(--game-ui-measure-reading)',
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

export const CLAY_SCROLLBAR_TOKENS = {
  size: 'var(--game-ui-scrollbar-size)',
  track: 'var(--game-ui-scrollbar-track)',
  thumb: 'var(--game-ui-scrollbar-thumb)',
  thumbHover: 'var(--game-ui-scrollbar-thumb-hover)',
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
  scrollbars: CLAY_SCROLLBAR_TOKENS,
  elevation: CLAY_ELEVATION_TOKENS,
  motion: CLAY_MOTION_TOKENS,
  layers: CLAY_LAYER_TOKENS,
  targets: CLAY_TARGET_TOKENS,
  assetSizing: CLAY_ASSET_SIZE_TOKENS,
  overlayGlass: CLAY_OVERLAY_GLASS_TOKENS,
  liquidMetal: CLAY_LIQUID_METAL_TOKENS,
  liquidGooey: CLAY_LIQUID_GOOEY_TOKENS,
} as const;

export type ClayTokenCategory = keyof typeof CLAY_UI_TOKENS;
