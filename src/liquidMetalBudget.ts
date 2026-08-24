/**
 * Process-wide ledger for liquid-metal WebGL2 contexts.
 *
 * Chrome gives a tab about 16 contexts (Android about 8) and silently
 * kills the oldest when the cap is hit. In University that oldest context
 * is the 3D world map. These buttons are allowed to light up a shader,
 * but they are not allowed to evict the map — so the default budget is
 * 2, hosts can raise or lower it, and a button that cannot get a slot
 * stays on the CSS renderer without throwing.
 */

export const DEFAULT_LIQUID_METAL_CONTEXT_BUDGET = 2;

let limit = DEFAULT_LIQUID_METAL_CONTEXT_BUDGET;
let used = 0;

export type LiquidMetalRendererMode = 'auto' | 'css' | 'webgl';

export function getLiquidMetalContextBudget(): { limit: number; used: number } {
  return { limit, used };
}

export function setLiquidMetalContextBudget(nextLimit: number): void {
  // A host that cannot afford even one shader (a page that already owns
  // the 3D map plus a post-process stack) must be able to pin this at 0.
  limit = Number.isFinite(nextLimit) ? Math.max(0, Math.floor(nextLimit)) : 0;
}

export function tryAcquireLiquidMetalContext(): boolean {
  if (used >= limit) return false;
  used += 1;
  return true;
}

export function releaseLiquidMetalContext(): void {
  if (used > 0) used -= 1;
}

/** Test hook: production code never resets the ledger mid-session. */
export function resetLiquidMetalContextBudgetForTests(): void {
  limit = DEFAULT_LIQUID_METAL_CONTEXT_BUDGET;
  used = 0;
}

export function shouldAttemptWebGL(input: {
  renderer: LiquidMetalRendererMode;
  hasWebGL2: boolean;
  prefersReducedMotion: boolean;
  isInViewport: boolean;
}): boolean {
  // `css` is a hard pin so a side-by-side demo can show the fallback
  // without the CSS column spending a context the WebGL column needs.
  if (input.renderer === 'css') return false;
  if (!input.hasWebGL2) return false;
  if (input.prefersReducedMotion) return false;
  if (!input.isInViewport) return false;
  return true;
}
