import { validPresenceRect, type LiquidPresenceRect } from '../geometry';

/** Layout bookkeeping for this UI family only, not application/task state.
 * Anchors publish their current visible footprint and remove it on unmount. */
const panels = new Map<Element, LiquidPresenceRect>();
const listeners = new Set<() => void>();
export function reportLiquidPanel(element: Element, rect: LiquidPresenceRect | null) {
  const previous = panels.get(element);
  const next =
    rect && validPresenceRect(rect)
      ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      : null;
  if (
    (!previous && !next) ||
    (previous &&
      next &&
      previous.x === next.x &&
      previous.y === next.y &&
      previous.width === next.width &&
      previous.height === next.height)
  )
    return;
  if (next) panels.set(element, next);
  else panels.delete(element);
  for (const notify of [...listeners]) {
    try {
      notify();
    } catch {
      /* A label observer cannot prevent panel cleanup. */
    }
  }
}
export function readLiquidPanels(label: Element): LiquidPresenceRect[] {
  return [...panels]
    .filter(
      ([element]) => element.isConnected && !element.contains(label) && !label.contains(element),
    )
    .map(([, rect]) => rect);
}
export function observeLiquidPanels(notify: () => void) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

/** Floating UI chooses the preferred side; this bounded packing pass handles
 * sibling panels it cannot know about. No room means no hidden clickable label.
 * Candidate edges are actual measured rectangles, never guessed target positions. */
export function clearLiquidLabel(
  preferred: { x: number; y: number },
  dimensions: { width: number; height: number },
  viewport: LiquidPresenceRect,
  input: readonly LiquidPresenceRect[],
) {
  const { width, height } = dimensions;
  const padding = 12,
    gap = 8;
  if (!Number.isFinite(width + height) || width <= 0 || height <= 0) return null;
  const minX = viewport.x + padding,
    minY = viewport.y + padding;
  const maxX = viewport.x + viewport.width - width - padding;
  const maxY = viewport.y + viewport.height - height - padding;
  if (maxX < minX || maxY < minY) return null;
  const obstacles = input.filter(validPresenceRect);
  const xs = [preferred.x, minX, maxX],
    ys = [preferred.y, minY, maxY];
  for (const obstacle of obstacles) {
    xs.push(obstacle.x - width - gap, obstacle.x + obstacle.width + gap);
    ys.push(obstacle.y - height - gap, obstacle.y + obstacle.height + gap);
  }
  let best: { x: number; y: number } | null = null;
  let distance = Infinity;
  for (const rawX of xs)
    for (const rawY of ys) {
      const x = Math.min(maxX, Math.max(minX, rawX));
      const y = Math.min(maxY, Math.max(minY, rawY));
      if (
        obstacles.some(
          (o) =>
            x < o.x + o.width + gap &&
            x + width > o.x - gap &&
            y < o.y + o.height + gap &&
            y + height > o.y - gap,
        )
      )
        continue;
      const d = (x - preferred.x) ** 2 + (y - preferred.y) ** 2;
      if (d < distance) {
        best = { x, y };
        distance = d;
      }
    }
  return best;
}
