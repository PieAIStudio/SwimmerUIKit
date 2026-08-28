# LiquidGroup

`LiquidGroup` is the SwimmerUIKit first-version `morph` primitive: two or a
few nearby UI elements can visually join into one clay-like blob, then pull
apart with a short elastic thread. It uses an inline SVG filter built from
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
<LiquidGroup blur={6} contrast={18} filterPadding={24}>
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

## Motion and budget

The group uses one shared clock. It watches the small set of DOM geometry
signals needed by fixed morph scenes, paints the silhouette and content
wrapper together, and stops scheduling `requestAnimationFrame` after roughly
500 ms without movement or size change. A later target or geometry change
wakes it again. `motion="reduced"` is a deterministic override for previews;
otherwise the component follows `prefers-reduced-motion: reduce` and snaps
states without movement.

SVG filters are not WebGL contexts, so the separate gooey budget limits
simultaneously animated groups and the padded filter-area size. The defaults
are two animated groups and 480,000 CSS pixels per filter region. A group that
cannot acquire a slot stays rendered with its SVG filter and snaps to state;
it does not throw and does not disappear.

## First-version boundary

This primitive intentionally implements only `morph`. `move` (trail), `melt`
(image dissolution), `bend` (shape deformation), and `dissolve` are not part of
this version. A later version would need explicit product use cases, a larger
measurement/asset pipeline, and separate performance and accessibility tests
before adding those behaviors.
