/** One material for the CTA, presence, reveal panels and liquid fill.
 * Forms may change motion and multi-body bridge blur, never their weight. */
export const LIQUID_MATERIAL = {
  blur: 5,
  contrast: 18,
  gloss: 1.5,
  blob: 3.5,
  lobes: 3,
  filterPadding: 20,
  shadow: 'var(--game-ui-liquid-material-shadow)',
} as const;

export const TIDE_FILL = {
  top: 'var(--game-ui-cta-from)',
  bottom: 'var(--game-ui-cta-to)',
  sheen: 0.3,
} as const;
