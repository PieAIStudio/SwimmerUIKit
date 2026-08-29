# LiquidGroup

`LiquidGroup` is the SwimmerUIKit liquid primitive for short, user-caused
surface motion. Its `merge` (Morph) gesture lets two or a few nearby UI
elements visually join into one clay-like blob, then pull apart with a short
elastic thread; `shape` adds the donor's centre → size → corner jelly timeline;
`follow` (Move) remains reserved for the selected indicator and progress
leading edge; `bend` deforms a moving surface while keeping content glued to
its own rendered rectangle. It uses an inline SVG filter built from
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
  <LiquidGroup.Item
    morph={{ shape: true, speed: 1, bounce: 0.5, contentBlur: 7 }}
    x={24}
    transition="snappy"
  >
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

## Morph shape and content blur

`morph.shape` is token-on in this brand-kit adoption so the default is visible;
`morph={{ shape: false }}` is the explicit calm opt-out. The other adopted
defaults are `speed: 1`, `bounce: 0.5`, and `contentBlur: 7`. `speed` changes
tempo without changing the spring character. `bounce: 0` is critically damped;
higher values add overshoot and jelly wobble.

Shape physics are adapted from the pinned donor implementation: the centre
travels first, width/height follow, and the corner timeline resolves last. The
content blur is separate from the SVG silhouette: it is applied to the item
content wrapper while the evolve motion envelope is non-zero and removed as
the surface settles. A child button remains a real, focusable DOM control; the
silhouette never receives the content blur.

The raw evolve values are also token-backed under
`--game-ui-liquid-gooey-evolve-*`. Use the normalized knobs for normal product
work; the `advanced` field is for a reviewed design-system preset.

## Bend

`effect="bend"` implies `observe`: the item measures the child's rendered
rectangle, so the liquid surface tracks the child directly. Vertical velocity
bows the top and bottom edges (middle leads, ends lag); horizontal velocity
reshapes the caps (front blunts, back stretches). There is no lagging body and
no Move tail, so text and icons cannot slide out of their own card.

The defaults are `vertical: 0.6` and `horizontal: 0.35`. The live shape is
published on the item as `--lg-bend-x` / `--lg-bend-y` in px and
`--lg-bend-xn` / `--lg-bend-yn` as unitless values:

```css
.card-content {
  transform: rotate(calc(var(--lg-bend-yn, 0) * 0.35deg));
}
```

The Bend implementation and its file header point to the donor URL, pinned
commit, copyright, MIT license, and this `NOTICE` file. No donor checkout is a
runtime dependency.

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
`--game-ui-liquid-gooey-waviness: 6`; `0` remains an explicit calm override.
The recommended brand preset is `6` with
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
waviness, Morph content-blur, and Bend deformation slack. The defaults are two
animated groups and 480,000 CSS pixels per filter region. The live group
attributes `data-liquid-filter-area` and `data-liquid-feature-padding` expose
the accounting for Storybook/QA. A group that cannot acquire a slot stays
rendered with its SVG filter and snaps to state; it does not throw and does not
disappear.

## First-version boundary

The retained action vocabulary is `merge`, `follow`, `shape`, `bend`,
`dissolve`, and `still`. This package implements `merge`/Morph, Morph `shape`,
`follow`/Move, and Bend. The donor's Melt, image-melt, dissolve systems, and
general observer remain outside this brand-kit boundary until a separate
product use case, asset pipeline, and performance/accessibility review exists.
