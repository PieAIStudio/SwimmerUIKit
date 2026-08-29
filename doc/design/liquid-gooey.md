# LiquidGroup

`LiquidGroup` is the SwimmerUIKit first-version liquid primitive. Its `merge`
(Morph) gesture lets two or a few nearby UI elements visually join into one
clay-like blob, then pull apart with a short elastic thread; its `follow`
(Move) gesture is reserved for the selected indicator and progress leading
edge. It uses an inline SVG filter built from
`feGaussianBlur` and `feColorMatrix`; it does not add a WebGL or npm runtime
dependency.

## Use it for a moment, not an atmosphere

Use this effect for a one-off celebration, merge moment, reward settlement, or
short transition. It is **not a persistent background**, must not sit behind
body copy, and must not be placed on navigation. If the user needs to read,
scan, or operate something repeatedly, use an ordinary kit surface instead.

## Content and silhouette are separate

`LiquidGroup.Item` (also exported as `LiquidItem`) renders its children in the
real DOM content layer. The SVG behind it contains only measured rounded-rect
silhouettes. The SVG is `aria-hidden` and `pointer-events: none`; the filter is
attached to the SVG group, never to the button, text, or other interactive
child. This keeps focus rings, hit testing, accessible names, and text
rendering native.

```tsx
<LiquidGroup blur={6} contrast={18} filterPadding={24} waviness={6} wavinessFreq={0.018}>
  <LiquidGroup.Item x={24} transition="snappy">
    <button type="button">Collect</button>
  </LiquidGroup.Item>
  <LiquidGroup.Item x={-24} transition="snappy">
    <button type="button">Bonus</button>
  </LiquidGroup.Item>
</LiquidGroup>
```

The default `fill` is the theme token
`var(--game-ui-surface, var(--game-ui-panel-strong))`. Pass another
`--game-ui-*` token expression when a different surface is needed. The
`shadow` prop follows the same rule and accepts token-based CSS box-shadow
syntax.

## Surface texture

`waviness` and `wavinessFreq` are group-level knobs. They adapt the pinned
donor's `feTurbulence` plus `feDisplacementMap` pass: the post-goo silhouette
is displaced once with `seed="7"`, and the resulting `shape` is the source for
the SVG shadow passes as well as the final rendered silhouette. This keeps the
neck and its shadow on one edge instead of making the shadow expose a second,
geometric contour.

The texture is static. There is no animated `baseFrequency`, no time-based
seed, and no additional requestAnimationFrame work; the existing shared clock
still sleeps after the normal settle window. The shipped token default is
`--game-ui-liquid-gooey-waviness: 0` so existing consumers keep their exact
edge. The recommended brand preset is `6` with
`--game-ui-liquid-gooey-waviness-freq: 0.018`; `3`/`0.022` is conservative and
`10`/`0.014` is bold on the same strength axis.

`waviness` also expands the filter pad by the same maximum number of pixels on
each side. The resulting `(width + 2 × pad) × (height + 2 × pad)` area is the
value checked against the 480,000 CSS-pixel animation ceiling, so enabling the
texture cannot under-report its raster cost.

## Motion and budget

The group uses one shared clock. It watches the small set of DOM geometry
signals needed by fixed morph scenes, paints the silhouette and content
wrapper together, and stops scheduling `requestAnimationFrame` after roughly
500 ms without movement or size change. A later target or geometry change
wakes it again. `motion="reduced"` is a deterministic override for previews;
otherwise the component follows `prefers-reduced-motion: reduce` and snaps
states without movement.

SVG filters are not WebGL contexts, so the separate gooey budget limits
simultaneously animated groups and the padded filter-area size, including the
waviness slack. The defaults are two animated groups and 480,000 CSS pixels
per filter region. A group that cannot acquire a slot stays rendered with its
SVG filter and snaps to state; it does not throw and does not disappear.

## First-version boundary

This primitive intentionally implements only `morph` and the adopted `follow`
(Move) surface. `melt` (image dissolution), `bend` (shape deformation), and
`dissolve` are not part of this version. A later version would need explicit
product use cases, a larger measurement/asset pipeline, and separate
performance and accessibility tests before adding those behaviors.
