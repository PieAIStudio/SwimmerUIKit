# SwimmerUIKit Individual Donors

This file is the project-local discovery index for external upstream and donor
sources. `AGENTS.md` directs donor-aware work here before an agent reads or
adapts a donor. The files listed here are provenance and review sources; the
package runtime must use reviewed SwimmerUIKit code or released dependencies,
never a checkout from `_donors-individual/for_SwimmerUIKit/`.

## liquid-gooey

- Upstream repository: `https://github.com/Jakubantalik/Libraries.git`
- Upstream package: `packages/liquid-gooey/`
- Public demo: `https://gooey.jakubantalik.com/`
- Owner repository: `SwimmerUIKit`
- Combined-workspace checkout:
  `<portfolio-root>/_donors-individual/for_SwimmerUIKit/`
- Pinned commit: `422180dd7a5ac646c85deedc65500c4a74339127`
- Commit date: `2026-09-09T11:04:00+02:00`
- Upstream license: MIT
- Package version at the pinned commit: `0.2.1`
- Machine-readable pin: `donors-individual-lock.json`
- Legal notice: `NOTICE`

### Review and adoption boundary

The current SwimmerUIKit implementation is local code; no upstream files are
vendored or imported at runtime. The reviewed scope is the donor
package's `README.md`, `package.json`, `LICENSE`, and `src/**` so the kit can
trace the retained implementation in `src/LiquidGroup.tsx` and its supporting
modules.

Patterns retained in the local implementation are the SVG
silhouette/content split, Gaussian blur plus alpha color-matrix filtering,
rounded-rectangle geometry, token-compatible shadow syntax, spring-to-easing
compilation, and the donor's Move center/stretch/tail physics. SwimmerUIKit
adopted those Move physics for the selected indicator and progress leading
edge, and now directly adapts the donor's Morph shape evolution,
`contentBlur` content-layer cross-blur, Bend's velocity-bowed path plus
`--lg-bend-x` / `--lg-bend-y` / `--lg-bend-xn` / `--lg-bend-yn` CSS-variable
outlet, and the donor's group-level `waviness` and `wavinessFreq` filter pass as
a static, fixed-seed surface texture.

As of 2.0.0 the kit also adopts the donor's compositor split for outer
drop shadows: blurred offset layers without spread are CSS `drop-shadow()` on
the silhouette SVG (same convention as `box-shadow`, blur-radius = 2σ). Inset
and spread stay in the SVG filter. The filter pad no longer reserves the outer
blur. The silhouette also sets `will-change: filter, transform` so WebKit
promotes the CSS-filtered layer.

SwimmerUIKit also adapts the donor's pairwise image-melt engine into
`src/liquidGooeyImageMelt.tsx`. That module carries the first two
`effect="melt"` images, the two-palette colour/marbling pass, and the
image-only contact `dissolve` layer. The dissolve math is a scoped adaptation
of the donor's contact-observer behavior; it is not a transplant of the
donor's observer. Morph shape is deliberately token-on so the adopted default
is visible; callers can pass `morph={{ shape: false }}` to opt out.

Morph content blur, Bend's maximum deformation, Melt marbling, and dissolve
displacement are included in the filter-area accounting. No retained effect
adds an ambient clock. The donor's general observer remains outside the
imported scope because SwimmerUIKit already has its own process-wide
animation/filter-area budgets and a shared requestAnimationFrame loop that
sleeps when idle. Replacing that loop would lose the kit's explicit budget and
idle-sleep guarantees. Dissolve `flowSpeed` is gated by motion so a held-still
contact does not stir; that is an adaptation of the no-ambient-clock contract,
recorded in `rejectedScope` on 2026-08-30 rather than described as if it had
been refused from the start. The local implementation keeps its own
interaction boundary, token-driven values, graceful budget degradation, and
warnings that survive the published build; see `NOTICE` for legal attribution.

### Missed donor capabilities (not rejections)

A 2026-08-30 donor audit found several capabilities that were neither in the
implementation nor written down as refused. They are listed here as **missed**,
not as if the project had rejected them at the time.

Adopted in 2.0.0:

- **M1 / M11.** Outer no-spread shadows as CSS `drop-shadow()`; SVG pad no
  longer includes that blur radius.
- **M2.** `will-change: filter, transform` on the silhouette SVG.
- **M5 (API lie, not the feature).** Item `effect="move"` was a public union
  member that did nothing. 2.0.0 removes it rather than implementing
  item-level Move + `MoveTuning`. Group `motion="follow"` remains the Move
  entry. Implementing the item API is still missed.

Still missed, not scheduled this round. Product University has no call sites
for these, which is why they are deferred rather than built now:

- **M3 `blobInset` / M4 `bridgeGrow`.** Morph advanced knobs. No avatar-stack
  or photo-chip surface in the current product.
- **M5 remainder.** Item-level `effect="move"` and `MoveTuning`
  (springiness / wobble / stretch / trail / advanced). Would be a new
  feature on top of group follow, and it couples to the observer the kit
  rejected.
- **M6 `BendTuning.advanced`.** Product has zero Bend call sites.
- **M7 `dissolve.surface: 'image'`.** Product has zero dissolve call sites.
- **M8 Melt silhouette luminance mask.** Product has zero Melt call sites.
  Without it, melt colour can spill past the liquid edge.
- **M9 `downscaleHref`.** Product has zero Melt/dissolve images. Donor
  measured this as expensive on WebKit CPU once photos are used.

Do not move the deferred rows into `rejectedScope` unless a later review
actually decides against them.

### 2026-09-11 review of the range since `3862ffa`

Two upstream commits touched `packages/liquid-gooey` and only one changed
behaviour. `c5b6b44` is the repository rename to `Libraries.dev`, which moves
the `repository` and `bugs` URLs in `package.json` and nothing else. `ae953b9`
adds a `filter` prop: a raw SVG primitive string, injected with
`dangerouslySetInnerHTML`, that REPLACES the whole goo chain — the caller then
owns blur, contrast, waviness and the SVG half of the shadow stack.

**Declined, and the need behind it was real.** The escape hatch exists because
the chain is closed to extension, and SwimmerUIKit hit exactly that wall while
adding interior lighting to the liquid surface. But a string of primitives
spliced into the filter is outside everything this package promises: the
filter-area budget cannot account for passes it cannot see, `swimmer-ui-check`
cannot find raw colours inside an opaque string, and a caller who reproduces
the chain by hand is pinned to this version of it forever. The kit answered the
same need with a typed `gloss` pass instead, which the budget and the style
checker can both read.

Nothing else in the reviewed scope changed, so the adopted patterns above stand
as written. The pin advances to `422180d` to record that the range was read.

### Waviness: adopted, and now superseded in the kit's own forms

The donor's group-level `waviness`/`wavinessFreq` pass is still adopted and
still exported, and the attribution above is unchanged. It is no longer what
the kit's named forms use for an organic outline, and the measurement is worth
recording here because it is a property of the technique rather than of the
port: Chrome resamples `feDisplacementMap` with nearest-neighbour, so the
displaced contour can only land on whole pixels. Measured at device ratio 1
along a straight edge, a high frequency gives per-pixel jitter and a low one
gives a single one-pixel step across the whole side, with the rest of the
outline moved by a constant offset. The kit's `blob` draws the outline in path
data instead. That is a divergence from the donor, not a defect in it — the
donor's own demos use waviness on large, merging bodies where a pixel of
contour noise is invisible.

### Update policy

This donor is pinned for manual review and provenance only. It must not be
auto-synced, installed as a package dependency, or loaded by the published
runtime.

1. Inspect a candidate upstream commit in the detached checkout under
   `for_SwimmerUIKit/`.
2. Review the full changed range under `packages/liquid-gooey/`, including its
   package license and any media or demo files whose licenses may differ.
3. Keep only the local patterns and product behavior that fit SwimmerUIKit's
   package contract; do not transplant the donor wholesale.
4. If the reviewed scope or adopted patterns change, update this file,
   `donors-individual-lock.json`, and `NOTICE` in the same change, then run the normal
   package verification ladder.
