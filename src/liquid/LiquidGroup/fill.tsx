import { type ReactNode } from 'react';

/**
 * A shared liquid silhouette behind crisp item content.
 *
 * Put the visual treatment on the group: `fill`, `stroke`, and `shadow` are
 * rebuilt on the merged silhouette. Do NOT add border, outline, or box-shadow
 * to children directly; those styles live on the content layer and cannot
 * merge with the liquid shape.
 *
 * Its motion vocabulary is intentionally small and semantic:
 *
 * | gesture | meaning |
 * | --- | --- |
 * | **merge** (Morph) | two things become one: reward settling, collecting, confirming |
 * | **follow** (Move) | selection, progress, dragging |
 * | **shape** (Morph shape) | the liquid changes size and corners like jelly |
 * | **bend** | speed bows the surface while content stays glued to it |
 * | **dissolve** | replacement, transition |
 * | **still** | THE DEFAULT |
 *
 * Liquid appears only on a state change the user caused. There is no ambient,
 * idle, or decorative liquid; keep the filter-area budget visible when more
 * than one group is on a screen.
 */
/**
 * A liquid body's paint.
 *
 * A colour paints the body flat. `{ top, bottom }` is the light the coloured
 * liquid theme settled on (University, 2026-09-30): a narrow brighter band at
 * the top, the colour falling from `top` to `bottom`, and the foot a touch
 * deeper, so a body reads as having thickness without a white rim. `sheen` is
 * how far the top band leans to white (0–1, default 0.3). Colours may be tokens:
 * the bands are mixed with CSS `color-mix`, not computed here.
 */
export type LiquidFill =
  | string
  | { readonly top: string; readonly bottom?: string; readonly sheen?: number };

/** One gradient per group; each item's own box maps it, so every body gets the whole fall. */
export function LiquidFillGradient({
  id,
  fill,
}: {
  id: string;
  fill: Exclude<LiquidFill, string>;
}): ReactNode {
  const bottom = fill.bottom ?? fill.top;
  const sheen = Math.round(Math.min(1, Math.max(0, fill.sheen ?? 0.3)) * 100);
  const stops: [number, string][] = [
    [0, `color-mix(in srgb, ${fill.top}, white ${sheen}%)`],
    [0.16, `color-mix(in srgb, ${fill.top}, white ${Math.round(sheen / 2)}%)`],
    [0.5, `color-mix(in srgb, ${fill.top}, ${bottom})`],
    [1, `color-mix(in srgb, ${bottom}, black 5%)`],
  ];
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        {stops.map(([offset, color]) => (
          <stop key={offset} offset={offset} style={{ stopColor: color }} />
        ))}
      </linearGradient>
    </defs>
  );
}
