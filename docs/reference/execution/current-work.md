---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-09-12
domain: meta
tags:
  - current-work
  - navigation
pinned: true
related:
  - SPEC-0001
  - SPEC-0002
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
---

# Current Work

This file is the current project work index. It is not the agents-routing algorithm.

## Current Focus

- Liquid presence refinement preserves the Owner-approved body and the existing
  optional `./liquid-presence` entry. It adds continuous gather/retraction,
  event-driven DOM positioning, interruption/visibility guards and high-contrast
  rendering, without changing ordinary controls or adding a runtime dependency.
  The sole cross-repository record is SwimmerNerveKit's
  `docs/plans/completed/liquid-presence-refinement.md`; the API and lifecycle
  contract remains in this Kit's [design guide](../design-system-guide.md#液体协作身体源码候选).
  Local checkpoints preserve the approved baseline. Publication and actual
  device/provider/production acceptance remain separate.

- Completed local implementation, unpublished: **Liquid Presence** adds the optional `./liquid-presence`
  renderer and CSS leaf for an existing assistant's grounded split/fly/dock/return
  gesture. It reuses the liquid geometry, material and budget, not another agent
  or media connection. Usage lives in the design guide; the single cross-project
  plan and preview evidence belong to SwimmerNerveKit's
  `docs/plans/completed/liquid-presence.md`. No package publication is implied and
  ordinary controls keep their existing defaults.

- Active: **2.7.0 optional contextual help**, requested by Directing's creator
  feedback across backup, navigation and writing panels. `GameHelpTip` composes
  maintained Floating UI interaction/positioning with brand tokens and a native
  non-submit control. Existing tooltip and dialog APIs remain compatible.
  Local verification passes 365 tests, docs, production CSS/JS, Storybook and
  publint/type packaging. A real 390px touch browser opened help within a native
  modal, then Escape dismissed only help; its screenshot was inspected.
  Evidence: `.devspace-reports/creator-help/`. The old zero-runtime-dependency
  test failed first, then was explicitly changed to an exact one-dependency
  allowlist for this reviewed feature, not removed. Publication/consumer
  acceptance remain separate from these local results.

- Completed: **2.6 liquid controls and beginner catalog, delivered as 2.6.1**,
  authorized after the 2.5.0 research delivery. Scope, current gates, real npm
  tarball/type checks and live-site evidence are in
  [PLAN-0004](../../plans/completed/PLAN-0004-liquid-controls-and-catalog.md).
  Use 2.6.1: it fixes the compiled-CSS press regression found while accepting
  2.6.0. Both registry and live interaction checks passed; no University migration
  was performed. No unfinished implementation or release task remains in this unit.

- Completed: **2.5.0 discoverability and maintainability release**.
  npm publication, live showcase checks and remaining boundaries are recorded in
  [the completed closeout](../../plans/completed/PLAN-0003-component-discovery-2.5.0.md).
  Version truth is `package.json`; release changes are in `CHANGELOG.md`.
  No export/subpath restructure, liquid-engine rewrite or consumer migration.
  There is no ongoing implementation task from this release.
- Primary entry: [component selection](../component-selection-guide.md).
  The generated [API inventory](../public-api-inventory.md) is the exhaustive
  index, not the beginner's first reading assignment.
- Current consumer proof target: University can pin all three packages from
  2.5.0 to 2.6.1 without changing existing imports; optional custom-CTA adoption follows
  the [upgrade playbook](../usage-and-upgrade-playbook.md). University owns its
  routing transition and product regression; this repository does not perform it.
- [Earlier research](../liquid-next-stage-research.md) retains decisions and
  deferred donor experiments. Actual API/material truth belongs in the design
  guide; unadopted image optimizations remain research.
- SPEC-0001/0002 are provenance for earlier packaging and design-system work;
  their old version targets are not this release's checklist.
- Runtime-dependency boundary: existing dialogs and ordinary controls remain
  native. 2.7.0 adds the reviewed Floating UI React dependency only for contextual
  help: current CSS-only tooltip cannot provide touch dismissal, collision
  avoidance and modal-aware portals. It does not replace native dialogs or the
  liquid renderer. Native popover was considered but does not alone provide the
  required hover/focus/click composition and viewport positioning across hosts.
- Distribution direction: public npmjs package plus a publicly readable GitHub
  repository under the PieAI Limited Use License. Releases use the manual
  `npm-publish.yml` Trusted Publishing workflow; no long-lived npm write token.

## Reading Order

1. `docs/reference/component-selection-guide.md` — choose by task.
2. `docs/reference/design-system-guide.md` — tokens, theming, motion, a11y,
   tailwind bridge, wrapped-app rules.
3. `docs/reference/usage-and-upgrade-playbook.md` — consumers + release SOP.
4. `CHANGELOG.md` — release history and migration notes.

## Verification

`pnpm verify` (includes generated API drift check and current tests) ·
`pnpm docs:check` · `pnpm build-storybook` · `pnpm build:site` · `npx publint` ·
`npx @arethetypeswrong/cli --pack . --entrypoints . ./package.json --profile esm-only`.
Use current command output for test counts; do not add historical totals together.

## Completed Proof History

Completed plans and specs live in:

- `docs/plans/completed/`
- `docs/specs/completed/`

Do not move completed work back into active. Create a new plan and link the completed record as provenance.
