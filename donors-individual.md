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
- Pinned commit: `3862ffa345217443b63696a8c331a0664eea4b04`
- Commit date: `2026-08-28T13:21:03+02:00`
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
