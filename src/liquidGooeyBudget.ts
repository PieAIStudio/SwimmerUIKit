/**
 * Process-wide budget for animated liquid-gooey groups.
 *
 * SVG filters do not consume WebGL contexts, but they can still be expensive
 * to repaint. The default allows two animated groups and rejects regions
 * larger than the configured filter-area ceiling. A rejected group keeps its
 * SVG filter and snaps its content to each new state without animating.
 */

export const DEFAULT_LIQUID_GOOEY_ANIMATION_BUDGET = 2;
export const DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET = 480_000;

export interface LiquidGooeyBudgetOptions {
  maxAnimatedGroups?: number;
  maxFilterArea?: number;
}

export interface LiquidGooeyBudgetState {
  maxAnimatedGroups: number;
  maxFilterArea: number;
  activeGroups: number;
}

let maxAnimatedGroups = DEFAULT_LIQUID_GOOEY_ANIMATION_BUDGET;
let maxFilterArea = DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET;
let activeGroups = 0;

function normalizeLimit(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback;
}

export function getLiquidGooeyBudget(): LiquidGooeyBudgetState {
  return { maxAnimatedGroups, maxFilterArea, activeGroups };
}

/** Update one or both host-side performance limits. */
export function setLiquidGooeyBudget(next: number | LiquidGooeyBudgetOptions): void {
  if (typeof next === 'number') {
    maxAnimatedGroups = normalizeLimit(next, 0);
    return;
  }
  if (next.maxAnimatedGroups !== undefined) {
    maxAnimatedGroups = normalizeLimit(next.maxAnimatedGroups, 0);
  }
  if (next.maxFilterArea !== undefined) {
    maxFilterArea = normalizeLimit(next.maxFilterArea, 0);
  }
}

export function tryAcquireLiquidGooeyAnimation(filterArea: number): boolean {
  const area = Number.isFinite(filterArea) ? Math.max(0, filterArea) : Infinity;
  if (activeGroups >= maxAnimatedGroups || area > maxFilterArea) return false;
  activeGroups += 1;
  return true;
}

export function releaseLiquidGooeyAnimation(): void {
  if (activeGroups > 0) activeGroups -= 1;
}

/** Test hook: production code never resets the process-wide ledger. */
export function resetLiquidGooeyBudgetForTests(): void {
  maxAnimatedGroups = DEFAULT_LIQUID_GOOEY_ANIMATION_BUDGET;
  maxFilterArea = DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET;
  activeGroups = 0;
}
