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
adopted only the donor's Move physics for the selected indicator and progress
leading edge; it deliberately did not take the donor's Melt, Bend, or dissolve
systems, general observer, or image-melt engine. The
local implementation adds token-driven values, process-wide animation and
filter-area budgets, an idle-sleeping shared animation clock, and its own
interaction boundary; see `NOTICE` for the legal attribution.

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
