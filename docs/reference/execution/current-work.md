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

- Active: **2.6.0 liquid controls and beginner catalog**, authorized after the
  2.5.0 research delivery. Execution and gates live in
  [PLAN-0004](../../plans/active/PLAN-0004-liquid-controls-and-catalog.md).
  The finish API and six liquid control categories are implemented candidates;
  registry publication is not yet verified. No University migration.

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
  2.5.0 to 2.6.0 without changing existing imports; optional custom-CTA adoption follows
  the [upgrade playbook](../usage-and-upgrade-playbook.md). University owns its
  routing transition and product regression; this repository does not perform it.
- [Earlier research](../liquid-next-stage-research.md) retains decisions and
  deferred donor experiments. Actual API/material truth belongs in the design
  guide; unadopted image optimizations remain research.
- SPEC-0001/0002 are provenance for earlier packaging and design-system work;
  their old version targets are not this release's checklist.
- Runtime-dependency policy: **zero runtime deps** — browser-native
  dialog/color-mix/cascade-layers cover current implementations. Native controls
  or a reviewed mature headless package are future options, not preinstalled deps.
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
