# LiquidGroup

`LiquidGroup` is the SwimmerUIKit liquid primitive for short, user-caused
surface motion. Its `merge` (Morph) gesture lets two or a few nearby UI
elements visually join into one clay-like blob, then pull apart with a short
elastic thread; `shape` adds the donor's centre → size → corner jelly timeline;
`follow` (Move) remains reserved for the selected indicator and progress
leading edge; `bend` deforms a moving surface while keeping content glued to
its own rendered rectangle. Its image surface adds pairwise `Melt` and contact
`dissolve` layers without filtering the real content DOM. It uses inline SVG
filters built from
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

## Image Melt

`effect="melt"` is an image-pair surface, not a replacement for the ordinary
content layer. The first two Melt items form one pair because the seam
calculation is a two-body calculation. The runtime follows their measured
rects, averages both palettes in the contact zone, pulls each crisp face back
with a seam mask, and adds a separate marbling pass that folds the palettes
into streaks.

```tsx
<LiquidGroup>
  <LiquidGroup.Item effect="melt" melt={{ mix: 1 }}>
    <img alt="warm palette" src={warmImage} />
    <span>Warm label stays crisp</span>
  </LiquidGroup.Item>
  <LiquidGroup.Item effect="melt" melt={{ mix: 1 }}>
    <img alt="cool palette" src={coolImage} />
    <span>Cool label stays crisp</span>
  </LiquidGroup.Item>
</LiquidGroup>
```

The donor defaults are available through the token layer:
`meltBlur=7`, `meltContrast=40`, `meltReach=0.8`,
`meltFade=17`, `meltWarp=0`, `meltMix=1`,
`meltMixBlur=8`, `meltGravity=1.9`, and
`meltWaviness=12`. A `melt={{ src }}` override is useful when the source image
URL is supplied by a manifest or changes independently of the child image's
current `src`.

## Contact dissolve

`dissolve` is a modifier on a normal `LiquidGroup.Item`, not a separate group
effect. `dissolve`, `dissolve={0.5}`, and
`dissolve={{ mix: 0.7, active: dragging }}` are supported. Proximity to the
nearest item grows the contact strength; release uses a short hysteresis window
so the image does not pop when a moving neighbor crosses a pixel boundary.
The layer uses displacement, turbulence and two-liquid erosion rather than a
plain blur. Only the `img` pixels receive the mask and SVG layer. Text and
other DOM content remain crisp and accessible.

With `effect="move"`, `dissolve` is intentionally ignored and warns once in
development: Move's liquid surface intentionally lags the measured image rect,
so the two coordinate systems would visibly disagree.

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
waviness, Morph content-blur, Bend deformation, Melt marbling, and dissolve
displacement slack. The defaults are two animated groups and 480,000 CSS pixels
per filter region. The live group attributes `data-liquid-filter-area` and
`data-liquid-feature-padding` expose the accounting for Storybook/QA. A group
that cannot acquire a slot stays rendered with its SVG filter and snaps to
state; the image layer restores crisp pixels and emits one development warning.

The image layer has its own scoped measurement loop rather than adopting the
donor's general observer. It wakes for registration, geometry, image, scroll,
transition, and mutation signals, then stops scheduling requestAnimationFrame
after roughly 500 ms of stillness. A settled SVG remains painted, but its
clock is asleep; removing the pair/contact releases its budget lease.

The retained action vocabulary is `merge`, `follow`, `shape`, `bend`, `melt`,
`dissolve`, and `still`. This package implements `merge`/Morph, Morph `shape`,
`follow`/Move, Bend, pairwise image Melt, and image-only contact dissolve.

## Donor boundary

The image Melt engine in `src/liquidGooeyImageMelt.tsx` is a local adaptation of
the pinned donor `imageMelt.tsx`; the scoped contact-dissolve math was reviewed
from that same commit's observer code. The donor checkout is provenance only.
The donor's general observer loop remains rejected because the kit's own
budgeted, idle-sleeping runtime provides the process-wide limits and lifecycle
behavior required here.

The supported surfaces are `morph`, `move`, `bend`, pairwise image `melt`, and
image-only contact `dissolve`. The donor checkout remains provenance only.
