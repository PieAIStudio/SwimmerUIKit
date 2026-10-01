/**
 * The default fraction is intentionally derived from the rendered surface,
 * not from the requested waviness token. A fixed pixel displacement is safe
 * on a large blob but can consume a thin control's whole visual height.
 */
export const LIQUID_GOOEY_WAVINESS_MAX_FRACTION = 0.3;

export type LiquidGooeyWavinessClamp = number | false;

/**
 * Resolve the requested waviness against the measured shorter side.
 *
 * A zero shorter side means the host has not been measured yet (SSR and the
 * first client render), so preserve the requested value until layout provides
 * a real size. Passing `false` is the explicit escape hatch for a deliberately
 * exaggerated surface.
 */
export function resolveLiquidGooeyWaviness(
  requested: number,
  shorterSide: number,
  maxFraction: LiquidGooeyWavinessClamp = LIQUID_GOOEY_WAVINESS_MAX_FRACTION,
): number {
  const safeRequested = Math.max(0, Number.isFinite(requested) ? requested : 0);
  if (maxFraction === false) return safeRequested;

  const safeFraction = Math.max(
    0,
    Number.isFinite(maxFraction) ? maxFraction : LIQUID_GOOEY_WAVINESS_MAX_FRACTION,
  );
  const safeShorterSide = Math.max(0, Number.isFinite(shorterSide) ? shorterSide : 0);

  return safeShorterSide > 0
    ? Math.min(safeRequested, safeShorterSide * safeFraction)
    : safeRequested;
}
