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

The current SwimmerUIKit implementation is local code; its Move physics is
adapted into `src/liquidGooeyMove.ts`; no upstream files are vendored or imported
at runtime. The reviewed scope is the donor
package's `README.md`, `package.json`, `LICENSE`, and `src/**` so the kit can
trace the morph design and implementation patterns that informed
`src/LiquidGroup.tsx` and its supporting modules.

Patterns retained in the local implementation are the SVG
silhouette/content split, Gaussian blur plus alpha color-matrix filtering,
rounded-rectangle geometry, token-compatible shadow passes, spring-to-easing
compilation, and the donor's Move center/stretch/tail physics. SwimmerUIKit
adopted the donor's Move physics for the selected indicator and progress
leading edge, and now adapts the donor's pairwise image-melt engine into
`src/liquidGooeyImageMelt.tsx`. That module carries the first two
`effect="melt"` images, the two-palette colour/marbling pass, and the
image-only contact `dissolve` layer. The dissolve math is a scoped adaptation
of the donor's contact-observer behavior; it is not a transplant of the
donor's observer.

The donor's general observer remains outside the imported scope because
SwimmerUIKit already has its own process-wide animation/filter-area budgets
and a shared requestAnimationFrame loop that sleeps when idle. Replacing that
loop with a general observer would lose the kit's explicit budget and idle
sleep guarantees. The local implementation keeps its own interaction
boundary, token-driven values, graceful budget degradation, and one-time
development warning; see `NOTICE` for legal attribution. The existing
group-level `waviness` and `wavinessFreq` pass remains static and fixed-seed,
with its maximum displacement included in the filter-area budget.

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
