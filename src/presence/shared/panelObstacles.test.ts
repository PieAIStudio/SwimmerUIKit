import { describe, expect, it } from 'vitest';
import { clearLiquidLabel } from './panelObstacles';

describe('label fits beside sibling panels, not above them by z-index', () => {
  const viewport = { x: 0, y: 0, width: 390, height: 844 };
  it('retains the preferred position if it is already clear', () => {
    expect(clearLiquidLabel({ x: 40, y: 100 }, { width: 90, height: 40 }, viewport, [])).toEqual({
      x: 40,
      y: 100,
    });
  });
  it('moves clear of the actual panel and target with bounded viewport edges', () => {
    const panel = { x: 25, y: 480, width: 340, height: 280 };
    const target = { x: 135, y: 414, width: 50, height: 40 };
    const position = clearLiquidLabel({ x: 115, y: 478 }, { width: 100, height: 44 }, viewport, [
      panel,
      target,
    ])!;
    expect(position).not.toBeNull();
    expect(position.x).toBeGreaterThanOrEqual(12);
    expect(position.x + 100).toBeLessThanOrEqual(378);
    for (const rect of [panel, target])
      expect(
        position.x >= rect.x + rect.width + 8 ||
          position.x + 100 <= rect.x - 8 ||
          position.y >= rect.y + rect.height + 8 ||
          position.y + 44 <= rect.y - 8,
      ).toBe(true);
  });
  it('does not invent room in a covered or too-small viewport', () => {
    expect(
      clearLiquidLabel({ x: 20, y: 20 }, { width: 100, height: 44 }, viewport, [viewport]),
    ).toBeNull();
    expect(clearLiquidLabel({ x: 20, y: 20 }, { width: 900, height: 44 }, viewport, [])).toBeNull();
  });
});
