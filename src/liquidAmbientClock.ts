/** Low-rate courtesy work shares one timed wake, not one 60Hz loop per surface.
 * One-shot requests re-arm only while their owner remains visible and enabled.
 * Leases still belong to the existing liquidGooeyBudget, not this clock. */
const pending = new Map<symbol, { at: number; paint: (now: number) => void }>();
let timer: ReturnType<typeof setTimeout> | undefined;
let frame: number | undefined;
let draining = false;

function arm() {
  if (draining || frame !== undefined) return;
  clearTimeout(timer);
  timer = undefined;
  if (!pending.size) return;
  const at = Math.min(...[...pending.values()].map((item) => item.at));
  timer = setTimeout(
    () => {
      timer = undefined;
      frame = requestAnimationFrame((now) => {
        frame = undefined;
        draining = true;
        try {
          for (const [key, task] of [...pending]) {
            if (task.at > now + 1 || !pending.has(key)) continue;
            pending.delete(key);
            task.paint(now);
          }
        } finally {
          draining = false;
          arm();
        }
      });
    },
    Math.max(0, at - performance.now()),
  );
}

export function requestLiquidAmbient(paint: (now: number) => void, delay = 1000 / 12) {
  const key = Symbol();
  pending.set(key, { at: performance.now() + delay, paint });
  arm();
  return () => {
    pending.delete(key);
    if (!pending.size && frame !== undefined) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
    arm();
  };
}
