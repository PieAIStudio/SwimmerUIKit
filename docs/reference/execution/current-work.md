---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-07-03
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

- Current phase: **1.0.0 shipped** (SPEC-0002, on top of SPEC-0001's 0.9.0
  hardening): ESM-only packaging with flat bundled types (publint + attw
  green), `dist/styles.css` is 100% standard CSS built by lightningcss
  (warning = build failure), Tailwind fully decoupled (optional
  `./tailwind.css` bridge; no Tailwind peers), wrapped-app hardening
  (touch-action / tap-highlight / hover guards / safe-area tokens),
  `CHANGELOG.md` + 1.x compatibility contract.
- Current active spec: `docs/specs/active/SPEC-0002-v1-release-readiness.md`
  (SPEC-0001 is `stable`).
- Current proof target: consumers upgrade 0.9.0 → 1.0.0 with **zero code
  changes** (breaking changes are packaging-only, verified unused); Vite 8
  consumers see zero CSS warnings.
- Runtime-dependency policy: **zero runtime deps** — browser-native
  dialog/popover/color-mix/cascade-layers cover current needs; Base UI 1.0
  recorded as the future escape hatch for complex headless widgets.
- Distribution direction: public npmjs package plus a publicly readable GitHub
  repository under the PieAI Limited Use License. Releases use the manual
  `npm-publish.yml` Trusted Publishing workflow; no long-lived npm write token.

## Reading Order

1. `docs/reference/design-system-guide.md` — tokens, theming, motion, a11y,
   tailwind bridge, wrapped-app rules.
2. `docs/reference/usage-and-upgrade-playbook.md` — consumers + release SOP.
3. `CHANGELOG.md` — release history and migration notes.
4. `docs/specs/active/SPEC-0002-v1-release-readiness.md` — why.

## Verification

`pnpm typecheck` · `pnpm test` (70 tests incl. token + packaging guards) ·
`pnpm build` (fails on any CSS warning) · `pnpm build-storybook` ·
`pnpm docs:check` · `npx publint` · `npx @arethetypeswrong/cli --pack .`.

## Completed Proof History

Completed plans and specs live in:

- `docs/plans/completed/`
- `docs/specs/completed/`

Do not move completed work back into active. Create a new plan and link the completed record as provenance.
