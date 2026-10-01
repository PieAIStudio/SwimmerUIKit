/** Material is independent of a widget's meaning and a form's motion. */
export type LiquidFinish = 'matte' | 'glossy';

/**
 * Reuse the existing specular pass. Undefined preserves the caller's historical
 * lighting, including a form's engaged lighting; matte removes only that pass.
 * A raw `gloss` on LiquidGroup remains the explicit advanced override.
 */
export function liquidFinishGloss(finish: LiquidFinish | undefined, existing: number): number {
  if (finish === 'matte') return 0;
  if (finish === 'glossy') return existing > 0 ? existing : 5;
  return existing;
}
