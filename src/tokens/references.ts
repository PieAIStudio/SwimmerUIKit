/**
 * Token references for the adopted liquid-gooey Move physics. The values are
 * deliberately numeric custom properties so a host theme can tune the feel
 * without putting physics constants in the engine.
 */
export const liquidTokens = {
  morphShape: 'var(--swimmer-liquid-gooey-morph-shape)',
  morphSpeed: 'var(--swimmer-liquid-gooey-morph-speed)',
  morphBounce: 'var(--swimmer-liquid-gooey-morph-bounce)',
  evolveMassStiffness: 'var(--swimmer-liquid-gooey-evolve-mass-stiffness)',
  evolveMassDamping: 'var(--swimmer-liquid-gooey-evolve-mass-damping)',
  evolveSizeStiffness: 'var(--swimmer-liquid-gooey-evolve-size-stiffness)',
  evolveSizeDamping: 'var(--swimmer-liquid-gooey-evolve-size-damping)',
  evolveRadiusStiffness: 'var(--swimmer-liquid-gooey-evolve-radius-stiffness)',
  evolveRadiusDamping: 'var(--swimmer-liquid-gooey-evolve-radius-damping)',
  evolveContentBlur: 'var(--swimmer-liquid-gooey-evolve-content-blur)',
  evolveRoundness: 'var(--swimmer-liquid-gooey-evolve-roundness)',
  evolveCornerDuration: 'var(--swimmer-liquid-gooey-evolve-corner-duration)',
  evolveCornerDelay: 'var(--swimmer-liquid-gooey-evolve-corner-delay)',
  evolveCornerEase: 'var(--swimmer-liquid-gooey-evolve-corner-ease)',
  evolveAnticipation: 'var(--swimmer-liquid-gooey-evolve-anticipation)',
  evolveTravel: 'var(--swimmer-liquid-gooey-evolve-travel)',
  contentBlurAreaMultiplier: 'var(--swimmer-liquid-gooey-content-blur-area-multiplier)',
  bendVertical: 'var(--swimmer-liquid-gooey-bend-vertical)',
  bendHorizontal: 'var(--swimmer-liquid-gooey-bend-horizontal)',
  bendVelocityVertical: 'var(--swimmer-liquid-gooey-bend-velocity-vertical)',
  bendVelocityHorizontal: 'var(--swimmer-liquid-gooey-bend-velocity-horizontal)',
  bendSmoothing: 'var(--swimmer-liquid-gooey-bend-smoothing)',
  bendActiveThreshold: 'var(--swimmer-liquid-gooey-bend-active-threshold)',
  bendVerticalCap: 'var(--swimmer-liquid-gooey-bend-vertical-cap)',
  bendHorizontalCap: 'var(--swimmer-liquid-gooey-bend-horizontal-cap)',
  bendRadiusMin: 'var(--swimmer-liquid-gooey-bend-radius-min)',
  bendRadiusMax: 'var(--swimmer-liquid-gooey-bend-radius-max)',
  bendLeadingCapFactor: 'var(--swimmer-liquid-gooey-bend-leading-cap-factor)',
  bendTrailingCapFactor: 'var(--swimmer-liquid-gooey-bend-trailing-cap-factor)',
  moveStiffness: 'var(--swimmer-liquid-gooey-move-stiffness)',
  moveDamping: 'var(--swimmer-liquid-gooey-move-damping)',
  moveStretch: 'var(--swimmer-liquid-gooey-move-stretch)',
  moveTail: 'var(--swimmer-liquid-gooey-move-tail)',
  moveForce: 'var(--swimmer-liquid-gooey-move-force)',
  moveTailSpringStiffness: 'var(--swimmer-liquid-gooey-move-tail-spring-stiffness)',
  moveTailSpringDamping: 'var(--swimmer-liquid-gooey-move-tail-spring-damping)',
  moveStretchSpeed: 'var(--swimmer-liquid-gooey-move-stretch-speed)',
  moveStretchSquash: 'var(--swimmer-liquid-gooey-move-stretch-squash)',
  moveSpeedThreshold: 'var(--swimmer-liquid-gooey-move-speed-threshold)',
  moveTailOnsetSpeed: 'var(--swimmer-liquid-gooey-move-tail-onset-speed)',
  moveTailOnsetRange: 'var(--swimmer-liquid-gooey-move-tail-onset-range)',
  moveTailRamp: 'var(--swimmer-liquid-gooey-move-tail-ramp)',
  moveTailMinRadius: 'var(--swimmer-liquid-gooey-move-tail-min-radius)',
  moveTailWobble: 'var(--swimmer-liquid-gooey-move-tail-wobble)',
  moveTailPhaseSpeed: 'var(--swimmer-liquid-gooey-move-tail-phase-speed)',
  moveTailMidpointA: 'var(--swimmer-liquid-gooey-move-tail-midpoint-a)',
  moveTailMidpointB: 'var(--swimmer-liquid-gooey-move-tail-midpoint-b)',
  moveTailMidRadiusA: 'var(--swimmer-liquid-gooey-move-tail-mid-radius-a)',
  moveTailMidRadiusB: 'var(--swimmer-liquid-gooey-move-tail-mid-radius-b)',
  moveTailWobblePhase: 'var(--swimmer-liquid-gooey-move-tail-wobble-phase)',
  moveMinPerpendicular: 'var(--swimmer-liquid-gooey-move-min-perpendicular)',
  moveLagBase: 'var(--swimmer-liquid-gooey-move-lag-base)',
  moveLagForce: 'var(--swimmer-liquid-gooey-move-lag-force)',
  moveSettleDistance: 'var(--swimmer-liquid-gooey-move-settle-distance)',
  moveSettleSpeed: 'var(--swimmer-liquid-gooey-move-settle-speed)',
  moveIntegrationRate: 'var(--swimmer-liquid-gooey-move-integration-rate)',
  waviness: 'var(--swimmer-liquid-gooey-waviness)',
  wavinessFreq: 'var(--swimmer-liquid-gooey-waviness-freq)',
  meltBlur: 'var(--swimmer-liquid-gooey-melt-blur)',
  meltContrast: 'var(--swimmer-liquid-gooey-melt-contrast)',
  meltReach: 'var(--swimmer-liquid-gooey-melt-reach)',
  meltFade: 'var(--swimmer-liquid-gooey-melt-fade)',
  meltWarp: 'var(--swimmer-liquid-gooey-melt-warp)',
  meltMix: 'var(--swimmer-liquid-gooey-melt-mix)',
  meltMixBlur: 'var(--swimmer-liquid-gooey-melt-mix-blur)',
  meltGravity: 'var(--swimmer-liquid-gooey-melt-gravity)',
  meltWaviness: 'var(--swimmer-liquid-gooey-melt-waviness)',
  dissolveBlur: 'var(--swimmer-liquid-gooey-dissolve-blur)',
  dissolveWarp: 'var(--swimmer-liquid-gooey-dissolve-warp)',
  dissolvePull: 'var(--swimmer-liquid-gooey-dissolve-pull)',
  dissolveRange: 'var(--swimmer-liquid-gooey-dissolve-range)',
  dissolveZone: 'var(--swimmer-liquid-gooey-dissolve-zone)',
  dissolveMix: 'var(--swimmer-liquid-gooey-dissolve-mix)',
  dissolveGravity: 'var(--swimmer-liquid-gooey-dissolve-gravity)',
  dissolveTaper: 'var(--swimmer-liquid-gooey-dissolve-taper)',
  dissolveWarpFreq: 'var(--swimmer-liquid-gooey-dissolve-warp-freq)',
  dissolveFlowSpeed: 'var(--swimmer-liquid-gooey-dissolve-flow-speed)',
  dissolveDetail: 'var(--swimmer-liquid-gooey-dissolve-detail)',
  dissolveReleaseMs: 'var(--swimmer-liquid-gooey-dissolve-release-ms)',
  dissolveFadeMs: 'var(--swimmer-liquid-gooey-dissolve-fade-ms)',
  dissolveStrength: 'var(--swimmer-liquid-gooey-dissolve-strength)',
  dissolveSink: 'var(--swimmer-liquid-gooey-dissolve-sink)',
  dissolveSeamBlur: 'var(--swimmer-liquid-gooey-dissolve-seam-blur)',
} as const;

/**
 * Semantic CSS vars for the official overlay-glass HUD tone
 * (`data-game-ui-tone="glass"` / `.game-ui-overlay-scope`).
 */
export const overlayTokens = {
  bg: 'var(--swimmer-overlay-glass-bg)',
  bgHover: 'var(--swimmer-overlay-glass-bg-hover)',
  bgStrong: 'var(--swimmer-overlay-glass-bg-strong)',
  bgPanel: 'var(--swimmer-overlay-glass-bg-panel)',
  border: 'var(--swimmer-overlay-glass-border)',
  borderHover: 'var(--swimmer-overlay-glass-border-hover)',
  text: 'var(--swimmer-overlay-glass-text)',
  textMuted: 'var(--swimmer-overlay-glass-text-muted)',
  blur: 'var(--swimmer-overlay-glass-blur)',
  focusRing: 'var(--swimmer-overlay-glass-focus-ring)',
  primaryFill: 'var(--swimmer-overlay-glass-primary-fill)',
} as const;

export const semanticTokens = {
  background: 'var(--swimmer-game-bg)',
  playfieldScrim: 'var(--swimmer-playfield-scrim)',
  surface: 'var(--swimmer-game-surface)',
  surfaceRaised: 'var(--swimmer-game-surface-raised)',
  surfaceSunken: 'var(--swimmer-surface-sunken)',
  text: 'var(--swimmer-game-text)',
  textMuted: 'var(--swimmer-game-text-muted)',
  accent: 'var(--swimmer-game-accent)',
  accentContrast: 'var(--swimmer-accent-contrast)',
  secondary: 'var(--swimmer-secondary)',
  success: 'var(--swimmer-game-success)',
  danger: 'var(--swimmer-game-danger)',
  warning: 'var(--swimmer-game-warning)',
  focusRing: 'var(--swimmer-focus-ring)',
  borderSubtle: 'var(--swimmer-border-subtle)',
  borderStrong: 'var(--swimmer-border-strong)',
  disabled: 'var(--swimmer-disabled)',
} as const;

export const typeTokens = {
  familyDisplay: 'var(--swimmer-game-font-display)',
  familyBody: 'var(--swimmer-game-font-body)',
  familyMono: 'var(--swimmer-font-mono)',
  xs: 'var(--swimmer-font-xs)',
  sm: 'var(--swimmer-font-sm)',
  md: 'var(--swimmer-font-md)',
  lg: 'var(--swimmer-font-lg)',
  xl: 'var(--swimmer-font-xl)',
  xxl: 'var(--swimmer-font-xxl)',
  lineTight: 'var(--swimmer-line-tight)',
  lineBody: 'var(--swimmer-line-body)',
  /* Long-form reading. See theme.css — the scale above is a HUD scale. */
  reading: 'var(--swimmer-font-reading)',
  lineReading: 'var(--swimmer-line-reading)',
  measureReading: 'var(--swimmer-measure-reading)',
  weightBody: 'var(--swimmer-weight-body)',
  weightStrong: 'var(--swimmer-weight-strong)',
  weightTitle: 'var(--swimmer-weight-title)',
} as const;

export const spaceTokens = {
  px2: 'var(--swimmer-game-space-2)',
  px4: 'var(--swimmer-game-space-4)',
  px6: 'var(--swimmer-game-space-6)',
  px8: 'var(--swimmer-game-space-8)',
  px10: 'var(--swimmer-game-space-10)',
  px12: 'var(--swimmer-game-space-12)',
  px16: 'var(--swimmer-game-space-16)',
  px20: 'var(--swimmer-space-20)',
  px24: 'var(--swimmer-space-24)',
  px32: 'var(--swimmer-space-32)',
  safeTop: 'var(--swimmer-safe-top)',
  safeRight: 'var(--swimmer-safe-right)',
  safeBottom: 'var(--swimmer-safe-bottom)',
  safeLeft: 'var(--swimmer-safe-left)',
} as const;

export const radiusTokens = {
  bead: 'var(--swimmer-radius-bead)',
  control: 'var(--swimmer-game-radius-control)',
  card: 'var(--swimmer-radius-card)',
  radiusPanel: 'var(--swimmer-game-radius-panel)',
  radiusModal: 'var(--swimmer-radius-modal)',
} as const;

export const scrollbarTokens = {
  size: 'var(--swimmer-scrollbar-size)',
  track: 'var(--swimmer-scrollbar-track)',
  thumb: 'var(--swimmer-scrollbar-thumb)',
  thumbHover: 'var(--swimmer-scrollbar-thumb-hover)',
} as const;

export const elevationTokens = {
  shadowRaised: 'var(--swimmer-game-shadow-raised)',
  stroke: 'var(--swimmer-stroke)',
} as const;

export const motionTokens = {
  fast: 'var(--swimmer-game-motion-fast)',
  base: 'var(--swimmer-motion-base)',
  slow: 'var(--swimmer-motion-slow)',
  easingPop: 'var(--swimmer-ease-pop)',
  easingSoft: 'var(--swimmer-ease-soft)',
  reducedMotion: 'var(--swimmer-reduced-motion-policy)',
} as const;

export const layerTokens = {
  playfield: 'var(--swimmer-z-playfield)',
  hud: 'var(--swimmer-z-hud)',
  sidebar: 'var(--swimmer-z-sidebar)',
  overlay: 'var(--swimmer-z-overlay)',
  zModal: 'var(--swimmer-z-modal)',
  toast: 'var(--swimmer-z-toast)',
} as const;

export const targetTokens = {
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

export const assetSizeTokens = {
  iconSm: 'var(--swimmer-icon-sm)',
  iconMd: 'var(--swimmer-icon-md)',
  iconLg: 'var(--swimmer-icon-lg)',
  buttonSkinMinWidth: 'var(--swimmer-asset-button-min-width)',
  stageTileMinHeight: 'var(--swimmer-stage-tile-min-height)',
  terrainSwatchSize: 'var(--swimmer-terrain-swatch-size)',
  terrainToolHitSize: 'var(--swimmer-terrain-tool-hit-size)',
  buildRailCardSize: 'var(--swimmer-build-rail-card-size)',
  brushNumberWidth: 'var(--swimmer-brush-number-width)',
} as const;
