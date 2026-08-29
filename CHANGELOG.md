# Changelog

All notable changes to `@pieai/swimmer-ui-kit`.
Format: [Keep a Changelog](https://keepachangelog.com); versioning: semver.

## Unreleased

### Added

- **Morph shape evolution and content cross-blur.** `LiquidGroup.Item` now
  accepts `morph={{ shape, speed, bounce, contentBlur }}`. The adopted centre →
  size → corner timeline makes the liquid change form like jelly, while the
  default `contentBlur: 7` is written to the content wrapper only and clears as
  the motion settles. The brand-kit token default deliberately enables shape;
  pass `shape: false` for a calm opt-out.
- **Surface-glued Bend.** `effect="bend"` follows an externally moved child,
  bows its long edges and deforms its rounded caps without a lagging body or
  tail. It publishes `--lg-bend-x`, `--lg-bend-y`, `--lg-bend-xn`, and
  `--lg-bend-yn` on the item for content tilt/rotation.
- **Knob stories and budget evidence.** Storybook now exposes conservative,
  default, and bold points for Morph and Bend, plus contentBlur off/default/bold
  comparisons and a combined filter-area readout.

### Performance

- Morph content-blur and Bend deformation slack are part of the existing
  480,000 CSS-pixel filter-area ceiling. The shared requestAnimationFrame clock
  remains event-driven and sleeps completely after stillness; an over-budget
  group snaps to static filtered rendering with a development warning.
- **Image Melt and contact dissolve for `LiquidGroup.Item`.** The first two
  `effect="melt"` items now render the donor-shaped measured image pair with
  crisp-face seam masks, two-palette colour mixing, and a visible marbling
  pass. `dissolve` is an image-only contact modifier with liquid displacement
  and release hysteresis; DOM text stays in the crisp content layer, and the
  modifier is ignored with a development warning under `effect="move"`.
  Numeric knobs are token-backed, share the 480,000 px² filter-area and
  process-wide concurrency budgets, degrade visibly with a one-time warning
  when over budget, and sleep their requestAnimationFrame clock at rest.

## 1.11.1

### Fixed

- **Waviness now scales to the element it decorates.** `waviness` is an absolute
  pixel amount, and 6px is 11.5% of a 52px segmented control and 42.9% of a 14px
  progress bar — the same token reading as texture in one place and as bites
  taken out of the bar in the other. The effective amplitude is capped at a
  fraction of the shorter side, so the default is safe wherever it lands instead
  of requiring every consumer to remember a rule that fails silently.

- **A clean contour after displacement.** The wavy silhouette is made by moving
  the alpha edge between pixels and nothing reconstructed it afterwards. A 0.5px
  blur on the displaced shape gives the rasteriser something to antialias, and
  the filter region grows to fit it — a blur with no room to spread would have
  traded a ragged edge for a clipped one.

  This addresses the reconstruction, not the noise. Two octaves at a low base
  frequency is blocky, and a displacement inherits the shape of what drives it;
  the rectangular notches visible on a 14px bar are consistent with that, and
  that hypothesis is still open.

## 1.11.0

### Added

- **The rest of the donor's liquid vocabulary.** `morph.shape` gives the
  surface a timeline instead of a resize — the mass travels to the new centre,
  size follows, corners sharpen last. `morph.contentBlur` acts on your content
  rather than the silhouette, which is what makes text read as sitting *in* the
  liquid instead of on it. `effect="bend"` deforms the body with velocity while
  staying glued to its content, and publishes `--lg-bend-x/y` plus unitless
  twins so the content can lean with it. `effect="melt"` runs two images into
  each other with real colour averaging and a marbling pass at the seam, and
  `dissolve` is the same physics as an image-only modifier on a morph item.
  All of them ship on: an effect that defaults to off is one nobody sees, and
  1.10.0 spent a release proving that with `waviness: 0`.

  Every effect enabled at once measures 307,892 px² of the 480,000 the process
  budget allows, degrades to a static snap rather than throwing when it runs
  out, and the shared clock still stops dead at rest.

  The donor's general observer is still not taken, and now the reason is
  written down rather than grouped into a list: this kit's loop meters a
  process-wide budget and sleeps completely when nothing moves, and the donor's
  does neither. Effects are recipes; the loop is the kitchen.

### Fixed

- **Image dissolve no longer inherits the default content blur.** `contentBlur`
  arriving on by default reached the DOM text that image-only `dissolve` exists
  to keep crisp. Neither adoption was wrong on its own; the combination was.

## 1.10.1

### Fixed

- **`<LiquidGroup>` threw where `window` exists and `matchMedia` does not.**
  The reduced-motion hook guarded on `typeof window === 'undefined'`, which is
  true in node and false in jsdom — and jsdom has no `matchMedia`. Any consumer
  testing in jsdom, and any server render that shims `window`, hit a TypeError
  inside a `useState` initializer. Both the initializer and the subscription now
  ask for the function itself. The kit's own suite runs in node, so the middle
  case had never been exercised; a regression test now pins it.

## 1.10.0

### Added

- **`motion="follow"` for selection and progress.** `<LiquidGroup>` now carries
  the donor's Move surface through the token layer and shared animation and
  filter-area budgets. It is used only by `GameSegmentedControl`'s selected
  indicator and `GameProgress`'s leading edge; the shared clock sleeps
  completely at rest.
- **Optional static waviness on `<LiquidGroup>`.** The new group-level
  `waviness` and `wavinessFreq` knobs adapt the pinned liquid-gooey noise
  displacement so merged silhouettes read as fluid instead of as two rounded
  rectangles. The displaced `shape` feeds both SVG shadow passes and the final
  SVG raster shadow, so the shadow follows the same edge. The token default is
  `0` to preserve existing output; the recommended brand preset is `6px` at
  `0.018`, with `3px`/`0.022` and `10px`/`0.014` available as conservative and
  bold points on the same intensity axis. The noise is fixed-seed and static,
  so it adds no idle animation clock. Its maximum displacement is reserved in
  the filter region and counted by the 480,000 px² budget.

### Fixed

- **`<LiquidGroup>` drew nothing under React StrictMode.** The effect cleanup
  marked the memoized engine disposed for good, so StrictMode's second mount
  acquired its budget, reported an active group, and then returned early from
  `wake()`. The merged path's `d` stayed empty, which meant every app rendering
  under StrictMode — that is, every app we ship — got no Morph and no Move at
  all, with nothing in the console to say so. `register()` now revives a
  disposed engine and resets the observer and listener state with it, a
  StrictMode regression test asserts the path is not empty, and the
  budget-exhausted path warns once in development instead of degrading in
  silence. Storybook runs with StrictMode on.

## 1.9.0

### Added

- **`<LiquidGroup>`, a budgeted liquid-merge primitive.** Two or more nearby
  children share one gooey silhouette while their own content stays crisp: an
  SVG blur-plus-contrast filter builds the merged shape, and the content is
  drawn unfiltered on top. It is a one-shot primitive for celebrations, merge
  moments and transitions — not a resident background, not behind body text,
  and not on navigation. `blur`, `contrast` and `filterPadding` are the shape
  knobs; `motion="reduced"` snaps instead of springing.
- **`stroke` on `<LiquidGroup>`.** The border belongs to the merged silhouette,
  not to the pieces. Passing a CSS border shorthand draws one continuous
  outline that deforms with the merge, including across the liquid bridge. A
  child that draws its own `border` will show a static circle that refuses to
  merge — that is the bug this prop exists to remove, and the story documents
  it as a rule rather than a preference.

### Fixed

- **The `LiquidGroup` stories now demonstrate the supported composition.** The
  demo buttons reset their browser border and background so they do not paint
  hard-edged content-layer circles over the merged silhouette. The stories now
  show the continuous outline on `LiquidGroup`, with a dedicated
  `stroke` + `shadow` example that makes the group-owned treatment explicit.

## 1.8.1

### Fixed

- **`<LiquidMetalButton>` came apart in a stretched container.** The host is
  `inline-flex` and the button inside it was `fit-content`, so in a flex or
  grid column that stretches — a pricing card, a form footer — the host took
  the full width while the button kept its own. The opaque plate and the outer
  glow are painted on the host and the rim, the sweep and the label on the
  button, so the control rendered as a wide dark pill with a short metal
  button parked at its left edge. The button now fills the host; in an inline
  context, where the host was already the button's width, nothing changes.

## 1.8.0

### Added

- **`<LiquidMetalButton>`**, a decision-surface CTA with two renderers and
  one set of tokens. Default is CSS (zero WebGL contexts). It upgrades to
  the ThreeUI dispersion shader (MIT, inlined — not the iframe wrapper)
  only when webgl2 is available, `prefers-reduced-motion` is not `reduce`,
  the button is on screen, and a process-wide budget (default **2**,
  `setLiquidMetalContextBudget`) still has a slot. Exhausted budget, a
  missing webgl2, or reduced motion stays on CSS without throwing. Hidden
  tabs pause RAF rather than destroying the context.

  Use it on checkout, sign-up, unlock, landing CTA. Do not use it on
  reading, queues, forms, or the map. More than two on a page means the
  page is the wrong place.

  Colours are `--game-ui-liquid-metal-face` / `--ink` (defined on both
  light and night so they cannot inherit an inverting ink) plus the
  existing accent; the effect knobs are `--game-ui-liquid-metal-dispersion`,
  `--sweep-speed`, and `--rest`.

## 1.7.0

### Fixed

- **Every tooltip was invisible on the night theme.** `.game-ui-tooltip
  [role='tooltip']` painted `background: var(--game-ui-text)` with
  `color: var(--game-ui-text-on-dark)`. On light that is a dark chip over a
  pale page and reads correctly. On night `--game-ui-text` flips to cream, so
  the chip became cream-on-cream at **1.15:1**. The light theme looking right
  is exactly why this survived. There is now a dedicated
  `--game-ui-tooltip-surface` / `--game-ui-tooltip-ink` pair, defined per
  theme, keeping the inverted look on light and readable on night.

### Added

- **`swimmer-ui-check` reports references to tokens this kit does not define.**
  `var()` takes a fallback, so `var(--game-ui-border, #253048)` renders forever
  against a token that does not exist — the rule looks token-driven while the
  fallback does all the work, and no brand change can reach it. A consumer had
  six borders in that state, in a cold blue-grey, in a warm brown app. Another
  was the reason `--game-ui-font-mono` got added in 1.6.0.

  Two things are exempt and neither is a typo: tokens the scanned files define
  themselves (downstream theming), and tokens written from code
  (`style={{ '--game-ui-card-offset': n }}`), found by scanning sibling
  sources. Anything else is indistinguishable from a misspelling, and the way
  to declare a deliberate knob is to give it a default in `:root`.

- **`pnpm check:styles`, and `pnpm verify` now runs it.** The kit shipped a
  contrast checker in 1.5.0 and never pointed it at itself, which is how the
  tooltip above survived a release that was specifically about contrast.

## 1.6.0

### Added

- **`--game-ui-font-mono`.** Three consumer stylesheets were already writing
  `var(--game-ui-font-mono, ui-monospace, …)` against a token this kit never
  defined. Because `var()` takes a fallback, nothing failed anywhere: the CSS
  looked token-driven while the fallback did all the work, and a brand change
  to code type could not reach any of them. The stack includes a CJK mono
  face, because a code block with a Chinese comment in it is the normal case
  for these products.
- **A reading scale** — `--game-ui-font-reading`, `--game-ui-line-reading`,
  `--game-ui-measure-reading`. The existing scale is a HUD scale and stops at
  `--game-ui-font-lg` (1.18rem), which is right beside a button and wrong for a
  screen someone reads for eight minutes. The three values are not invented:
  they are what a consumer measured against real content (Chinese prose around
  2,300 characters per screen, with code in it) and then had to keep in its own
  stylesheet because the kit had nowhere to put them. A product holding its own
  reading typography is a product whose reading typography drifts from the
  brand.
- `CLAY_TYPE_TOKENS` mirrors all four, and a test now asserts every mirrored
  type token is actually defined in `theme.css` — the mirror is a promise that
  a variable of that name exists, and the mono gap is exactly that promise
  being broken quietly.

Additive only. No existing token, class or component changed.

## 1.5.0 — 2026-08-22

`swimmer-ui-check` now also fails on token pairs that cannot be read.

The raw-colour rule kept consumers on tokens. It never stopped them choosing
two tokens that do not contrast, and one pairing is genuinely inviting:
`--game-ui-accent-ink` reads like "the ink for accent things" and means the
opposite — accent-COLOURED ink, for a surface. Painted on `--game-ui-accent`
it measures 1.48:1 on night and 1.91:1 on light. It reached a shipping
product's primary button, the one control every user has to find, and every
test that product had was green.

PRODUCT.md promises contrast-safe token combinations. That promise only ever
covered the pairs the kit uses itself; nothing checked the pairs a consumer
built. Now something does.

### Added

- Contrast checking in `swimmer-ui-check`. Rules that set both a background
  and a colour from bare tokens are resolved against this package's own
  `dist/styles.css`, per theme, and reported below WCAG AA (4.5:1) with the
  ratio and the theme named.

### Notes on what it deliberately does not do

- Only bare `var(--game-ui-x)` values are judged. `color-mix`, gradients and
  anything composited are skipped: a tint of the accent behind accent-coloured
  text is readable, and reading the first token out of the expression scores it
  1.00:1. The first draft did that and flagged four rules that were fine — a
  linter that cries wolf gets the next real finding skimmed too.
- Tokens carrying alpha are skipped for the same reason. What they composite
  against is not knowable from a stylesheet.

### Compatibility

Additive. Existing raw-colour behaviour is unchanged; a project that was clean
stays clean unless it genuinely has an unreadable pair.

## 1.4.0 — 2026-08-22

The kit shipped an icon set that no consumer could see. Nothing was broken and
nothing errored, which was the problem: with no setup the kit draws lettered
placeholder squares, and a placeholder that looks deliberate gets shipped. A
product could put eight identical coloured squares in its navigation and never
file a bug, because it reads as a design choice rather than a missing step.

The sculpted PNGs were never missing — 350 files travel inside the package, in
`dist/assets`. What was missing was any route from there to a path the host
actually serves. `CLAY_ASSET_BASE_PATH` names an absolute URL on the
*consumer's* origin, and nothing copied, exported or explained it. The kit's own
Storybook worked throughout, because its assets sit in `public/`.

### Added

- `swimmer-ui-assets [dir] [--base=…] [--force]` — a `bin` that copies the
  sculpted set into a host's static root. Bundler-agnostic and explicit; no
  postinstall, because a package that writes into your repo on install is worse
  than the problem it solves.
- `"./assets/*"` export, so bundler-based consumers can import an individual
  file and get a content-hashed URL instead of copying the whole tree.
- `setClayAssetBasePath()` / `getClayAssetBasePath()` for a CDN or a sub-path
  deploy. Resolution rebases on the way out, so the variant table stays a
  single source of truth.
- A one-time `console.warn` the first time a placeholder is actually drawn,
  naming the two commands that fix it, and `acknowledgeClayPlaceholders()` for
  anyone using them on purpose.

### Changed

- README states plainly that the default is placeholders rather than the icon
  set, and records that the sculpted family is 96px art which cannot take a
  `currentColor` tint — so it is the wrong family for a dense nav rail or
  toolbar however correctly it is served.

### Compatibility

Additive only. Defaults are unchanged, so every existing consumer renders
exactly what it rendered before and gains one console line telling it why.

## 1.3.2 — 2026-08-17

Follows 1.3.1 with the contrast work that release only half did. The new off
state paired a muted track with a `--game-ui-panel-strong` bead, which is a
light colour on the light theme and a dark one on night — so on night the bead
measured 1.8:1 against its own track and all but disappeared in exactly the
state it had just been added to show.

### Fixed

- The off track is now an inset well (`--game-ui-surface` plus
  `--game-ui-shadow-inset`) rather than a muted fill, so off and on differ in
  form — recessed versus filled — and not only in hue. That difference is the
  kit's own existing vocabulary; `.game-ui-progress-track` is drawn the same
  way.
- The bead is `--game-ui-text`, the one token guaranteed to read against every
  surface its own theme defines, replacing `--game-ui-panel-strong`, which
  tracks the surface and therefore inverts between themes. Measured on night:
  13.1:1 bead against the off track, up from 1.8:1, and 6.1:1 between the two
  track colours.
- The regression test now asserts the bead's inset offset flips sign between
  the two states. Position is the half of the state that survives both palettes
  and both kinds of colour vision, and it is also the half a future edit is
  most likely to drop.

## 1.3.1 — 2026-08-17

Gives `<GameToggle>` a visible off state. Since the component shipped, its
track carried a single unconditional rule — an always-on `--game-ui-secondary`
fill with the bead parked right — and no selector anywhere keyed on
`aria-checked`, so a switch rendered pixel-identically whether it was on or
off, in every theme, for every consumer. The `aria-checked` attribute was
correct the whole time, which is why nothing caught it: the switch told screen
readers the truth and told everyone else nothing.

### Fixed

- `.game-ui-toggle-track` now has two states. Off is a muted track with the
  bead inset on the left; on fills the track with `--game-ui-secondary` and
  moves the bead to the right, so the state is carried by position as well as
  by colour.
- The bead is opaque rather than a 62% mix of the panel colour.
- `.game-ui-toggle-track` joins the `prefers-reduced-motion: reduce` list, so
  the state change is instant for readers who asked for that.

### Added

- `GameToggle` coverage in `src/GameSurfaces.test.tsx`, asserting both the
  `aria-checked` markup and the two CSS states. The visual half reads
  `styles.css` directly, because a rendering test cannot see a state that only
  exists in a stylesheet — which is exactly how this shipped.

## 1.3.0 — 2026-07-25

Gives `<GameCallout>` its class name back. Since the preview split in 0.6 the
demo-table speech bubble had been left behind in `styles.css` under the same
`.game-ui-callout` class the component uses, so every product's callout
silently inherited scenery layout. Four products had each patched it locally.
Also stops `.game-ui-badge` from wrapping mid-token as a flex item, and lets
`<GameProgress>` label progress in domain units (counts) instead of only as a
rounded percentage.

### Fixed

- `.game-ui-callout` no longer inherits `position: absolute` and
  `white-space: nowrap`. `styles.css` declared the class twice — first as the
  absolutely-positioned bubble pinned to the demo table in `<GameUiPreview />`,
  then as the real component. The second rule never re-declared `position` or
  `white-space`, so the cascade kept the scenery values and every
  `<GameCallout>` rendered out of flow: it overlapped whatever sat behind it
  and swallowed those elements' clicks. The bubble now lives in `preview.css`
  as `.game-ui-seat-callout`, next to the `.game-ui-seat` scenery it belongs
  to, and `.game-ui-callout` is owned by `<GameCallout>` alone.
- `.game-ui-badge` no longer wraps mid-label when placed as a flex item next to
  a growing text block. Flex items default to `min-width: auto` (min-content);
  for CJK that is one character, so `flex-shrink` was splitting badges like
  "课程已发布" across two lines. A badge is a single short token — the base
  rule now sets `white-space: nowrap`.

### Added

- Internal `cssOwnership` analyzer plus `src/cssOwnership.test.ts`, enforcing
  one structural owner per class: a bare single-class selector may declare
  layout properties (`position`, `display`, `float`, `white-space`, inset,
  grid placement, `flex-direction`) in exactly one unconditional rule.
  Cosmetic and motion rules may still be split across sections, and `@media` /
  `@supports` overrides stay exempt, so the existing "base rule here, motion
  rule in the motion section" pattern is untouched. `styles.css` and
  `preview.css` are both asserted clean, which makes this class of name
  collision a build failure rather than four downstream workarounds.
- `<GameProgress valueLabel="3 / 21">` — optional domain-unit text shown next
  to the bar in place of the percentage. Passing a non-empty `valueLabel` is
  enough (no need for `showValue`); absent `valueLabel` keeps the existing
  `showValue` percentage behaviour. When set, `aria-valuetext` mirrors the
  label so assistive tech does not announce a percentage while the screen
  shows a count.

### Removed

- `.game-ui-callout.is-a` / `.game-ui-callout.is-b` from `styles.css`. These
  were never public API — undocumented preview scenery that leaked out of the
  0.6 preview split. A grep across the whole PieAI portfolio found no consumer
  outside `GameUiPreview.tsx`, which moved to `.game-ui-seat-callout` in the
  same commit. Products that render `<GameUiPreview />` must already be
  loading `preview.css`, where the bubble now lives.

### Migration notes

- No product action is required; callouts start laying out correctly on
  upgrade. Products may now delete their local re-anchoring patches:
  SupaLuv `apps/web/src/styles/meta.css` (`.settings-panel .game-ui-callout`),
  Sea `sea-viewer.css` / `sea-console.css` (`position: static !important`),
  and Anvil `AiConnectionCenter.module.css`. Those overrides are harmless if
  left in place — they now merely restate the kit default.

## 1.2.0 — 2026-07-18

Purely additive: an official "overlay glass" HUD surface tone plus a compact
density, for products that float kit chrome over a live scene (TuringPact 3D
tavern, SupaLuv cinematic stage). No exported component, prop, class, or token
was removed or renamed.

### Added

- Overlay glass scope: `data-game-ui-tone="glass"` (alias class
  `.game-ui-overlay-scope`) re-scopes semantic surface/text/elevation tokens on
  a subtree to dark translucent glass — fill `rgba(12,14,20,0.72)`, 1px light
  border, no clay box-shadow, warm accent hover/primary, WCAG-visible warm
  focus ring (`--game-ui-overlay-glass-focus-ring`). Nests inside light or
  `night` page themes.
- Compact density: `data-game-ui-density="compact"` (orthogonal to tone) —
  34px control floor, tighter panel/chip padding for HUD clusters.
- Primitive tokens `--game-ui-overlay-glass-*` in `theme.css`; TS mirrors
  `CLAY_OVERLAY_GLASS_TOKENS` and `GAME_UI_OVERLAY` attr/class constants.
- Clay `GameAssetIcon` gets a soft dark drop-shadow inside glass scope so
  sculpted icons read on translucent dark chips.
- Stories/preview compare: same HUD cluster in default clay vs overlay glass
  over a busy scene background, light and night contexts.

### Migration notes

- Consumers opt in per subtree; nothing changes without the attribute.
- SupaLuv can delete its `.vn-stage .game-ui-button` `!important` overrides
  (stage.css ~217-360) after wrapping its HUD in the glass scope.

## 1.1.0 — 2026-07-13

A design-system quality pass: fixes real bugs in the existing surface
(radial menu, contrast, fonts) and starts paying down the "central kitchen"
governance/packaging debt (token adoption checker, theme contract export,
demo CSS split). No exported component or prop was removed or renamed.

### Added

- `GAME_UI_THEME_CONTRACT`, an exported `readonly string[]` of every
  semantic token a complete theme (like the official `night` theme) must
  override. Downstream custom themes (e.g. an `abyss` theme) can assert
  their own CSS covers the same list instead of eyeballing the docs.
- Optional `./fonts.css` subpath: `@font-face` rules + bundled Latin-subset
  woff2 for Baloo 2 and Geist Variable (SIL OFL), the two families
  `theme.css`'s font stack already names. Not loading it still works
  (progressive enhancement, system-font fallback) but non-standard font
  weights (620/860/930) collapse to 400/700 without it.
- `swimmer-ui-check`, a zero-dependency bin (`npx swimmer-ui-check <dir>`)
  that scans a consumer's own CSS/TSX for raw color literals outside
  `:root`/`[data-*theme*]` blocks — the same "no bare colors in component
  rules" rule `src/tokens.test.ts` enforces inside this repo, made runnable
  against downstream code.
- `GameModal` gained `position="bottom"`, a mobile action-sheet variant of
  the same native `<dialog>` (unchanged focus trap/Esc/backdrop, only the
  frame's placement/shape/entrance differ). Replaces the hand-rolled
  backdrop+slide-up-panel pattern some consumers were building themselves
  (a known source of missing focus-trap/Esc handling).
- `GameRadialMenu` gained an `onSelect?: (id: string) => void` callback
  (previously clicking an item did nothing).
- Demo site and Storybook both gained a light/night theme toggle (demo site:
  navbar control using the kit's own `GameToggle`-style button; Storybook:
  a global toolbar entry that sets `data-game-ui-theme` for every story).

### Changed

- **`GameRadialMenu` is now actually styled.** It rendered as unstyled
  browser-default buttons before (`.game-ui-radial-item` had no CSS rule at
  all); it's now a real circular wheel using clock-position placement.
  `role="menu"`/`role="menuitem"` (which had no working keyboard model)
  changed to `role="group"` + plain buttons.
- **Button/tab/badge text contrast, both themes.** WCAG-measured failures
  as low as 2.52:1 on the primary button in the night theme (need 4.5:1).
  Fixed at the token layer only (`theme.css`): `--game-ui-accent-contrast`
  is now a dark-ink color shared by primary/danger/success buttons, the
  active tab/segmented pill, avatar initials, and the checkbox check —
  component rules did not change. Two further raw-brand-color-as-text
  spots (`--game-ui-danger` on `.game-ui-field-error`/`-required`,
  `--game-ui-accent` on the first-session step numbers) got their own new
  `--game-ui-danger-ink`/`--game-ui-accent-ink` tokens. HUD-chip and
  fact-chip secondary text (`.game-ui-hud-chip small/em`,
  `.game-ui-fact-copy small/em`) stopped fading `--game-ui-text-on-dark` to
  72% opacity, which dropped under 4.5:1 against realistic glass-chip
  backdrops. All of the above are locked in by an expanded WCAG contrast
  guard test (`src/tokens.test.ts`), not just fixed once.
- `GameSlider`'s range input now has a token-styled clay thumb/track
  (`::-webkit-slider-thumb`/`::-moz-range-thumb`) instead of bare
  `accent-color`.
- `GameTooltip` auto-generates `aria-describedby` linking the trigger to
  the tooltip text (was visual-only). `GameTabs` accepts an optional `id` +
  per-tab `panelId` to auto-populate `aria-controls`.
- Interactive controls get a `@media (forced-colors: active)` fallback
  (Windows High Contrast) — pressed/selected states get a real border
  instead of relying on a `color-mix()` wash forced-colors mode ignores.
- Storybook's `@storybook/addon-a11y` gate went from cosmetic
  (`test: 'todo'`) to enforced (`test: 'error'`) — a real axe violation now
  fails `pnpm test`, not just shows up in the Storybook UI.

### Fixed

- Three accessibility bugs the newly-enforced Storybook a11y gate caught:
  `GameCardFan` used an invalid `role="listitem"` on an `<article>`
  (changed to a plain `<li>`); two scrollable job-list containers in
  `GameContractorTools` had no keyboard focus path; `GameContractorPanel`'s
  mobile drawer rendered the selected job twice (drawer + standalone card)
  when open, producing duplicate ARIA landmarks.
- `vitest.config.ts`'s unit-test include glob was `src/**/*.test.ts` —
  it silently excluded every `*.test.tsx` file. Five files and ~30 tests
  had never actually run via `pnpm test` despite the command exiting 0.
  Fixed the glob, which then surfaced (and fixed) two further dormant test
  bugs it had been hiding.
- The demo site's token ledger truncated every value to `var(--…` and
  broke token names mid-word (`TOUCHMINIM UMPX`); values now wrap instead
  of ellipsis-truncating, and cards no longer stretch to their tallest
  sibling in the grid.

### Breaking (packaging only — no component/prop/class/token removed)

- **`GameUiPreview`'s demo-only CSS moved to a new optional `./preview.css`
  subpath.** It was ~13KB of stage/showcase-only rules
  (`.game-ui-preview-*`, `.game-ui-swatch`/`.game-ui-token-*`,
  `.game-ui-stage-world`, `.game-ui-proof-frame`, the first-session demo
  world) that every consumer paid for in `styles.css` even though
  `GameUiPreview` is a kit-internal showcase component almost nobody
  renders in production. If you render `<GameUiPreview />` (as TuringPact's
  `/ui-preview` route does), add
  `import '@pieai/swimmer-ui-kit/preview.css'` alongside `./styles.css` or
  it renders unstyled. Everyone else needs no code change —
  `.game-ui-*`/`--game-ui-*` names are unchanged, only which file the CSS
  ships in. `dist/styles.css` dropped from 89.2KB to 77.8KB minified.

## 1.0.1 — 2026-07-11

### Added

- `GameCallout`, a token-driven notice surface for wallet pitches, onboarding
  hints, warnings, success messages, and other compact product notices.

### Changed

- `GameButton` keeps a 44px minimum hit target on coarse pointers while allowing
  denser 40px controls for precise pointers.

## 1.0.0 — 2026-07-03

1.0 is a stability contract, not a feature drop: exported components and
props, `.game-ui-*` class names, and `--game-ui-*` token names are now
public API — additive-only within the 1.x major. Spec: SPEC-0002.

Distribution is public through npmjs and the source repository is publicly
readable under the PieAI Limited Use License. This is source-available, not an
open-source license; bundled visual assets remain restricted.

The npmjs package uses PieAI's existing user scope: `@pieai/swimmer-ui-kit`.
Earlier GitHub Packages releases used `@pieaistudio/swimmer-ui-kit`; consumers
moving to npmjs must update the dependency name and import specifiers once.

### Breaking (package identity and packaging)

- **npm scope changed once.** Public npmjs distribution is
  `@pieai/swimmer-ui-kit`; the earlier `@pieaistudio/swimmer-ui-kit` identity
  remains only in GitHub Packages history. Consumers must update dependency
  keys and import specifiers from `@pieaistudio` to `@pieai`.

- **ESM-only.** `dist/index.cjs` and the `require` export condition are
  removed. Every known consumer is a Vite ESM app; CJS consumers on
  Node ≥22 can `require(esm)` or use dynamic `import()`.
- **`./theme.css` subpath removed.** It was a confusing legacy alias of
  `./styles.css` (verified unused by all consumers). Use `./styles.css`.
- **Tailwind fully decoupled.** `tailwindcss` and `@tailwindcss/vite`
  peerDependencies are gone. `dist/styles.css` is now 100% standard CSS —
  the Tailwind v4 `@theme inline` bridge moved to a new **optional**
  `./tailwind.css` export (verified unused by all consumers, so no one
  needs to add it; it exists for future Tailwind hosts that want
  `bg-primary` etc. to map to kit tokens).

### Fixed

- Vite 8 / lightningcss consumers no longer get "unknown at-rule @theme"
  warnings: the shipped CSS contains no Tailwind at-rules, and the CSS
  build itself fails on any lightningcss warning (scripts/build-css.mjs).
- Type resolution is clean under every strategy (`arethetypeswrong`:
  node10/node16-ESM/bundler all green; `publint`: zero findings). Types
  are bundled into one flat `dist/index.d.ts`; the entry no longer leaks
  `import './styles.css'` into declarations.
- The published package no longer contains test declarations
  (`*.test.d.ts`), story files, or `.DS_Store`.

### Added

- Wrapped-app (Capacitor/Tauri WebView) hardening: interactive controls
  ship `touch-action: manipulation` + transparent tap highlight; game
  control surfaces (movement pad, toolbars, HUD) are
  `user-select: none` + `-webkit-touch-callout: none`; hover-lift effects
  moved behind `@media (hover: hover)` so touch devices never get sticky
  hover; all safe-area reads flow through `--game-ui-safe-*` tokens
  (hosts can override the env() source, e.g. Capacitor Android
  edge-to-edge). All guard-tested in `src/tokens.test.ts`.
- `./package.json` export; `CHANGELOG.md` (this file).

## 0.9.0 — 2026-07-03

- Full tokenization: zero raw color literals in `styles.css`; alpha tints
  derived from semantic tokens via `color-mix()`; guard tests enforce it.
- Official `night` theme (`[data-game-ui-theme='night']`).
- Panel system: `GameCollapsiblePanel`, `GameWindowPanel`, `GameModal`
  (native `<dialog>`: free focus trap, Esc, top layer).
- All component CSS wrapped in `@layer swimmer-ui` — unlayered consumer
  CSS always wins overrides.
- A11y: tabs keyboard navigation (roving tabindex), unified focus ring,
  tooltip focus/`:focus-within` support, themed scrollbars/selection.
- Docs: `design-system-guide.md`, `usage-and-upgrade-playbook.md`.

## 0.8.0 and earlier

Extraction from TuringPact into a standalone package; OwnMySpace surface
pack; terrain/build tooling; AI contractor queue; first-session shell;
GitHub Packages publish workflow. See git history.
