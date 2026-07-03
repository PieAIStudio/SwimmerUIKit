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
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
---

# Current Work

This file is the current project work index. It is not the agents-routing algorithm.

## Current Focus

- Current phase: **0.9.0 design-system hardening shipped** (SPEC-0001):
  full tokenization (zero raw colors in styles.css, guard-tested), official
  `night` theme, `@layer swimmer-ui`, panel system
  (GameCollapsiblePanel / GameWindowPanel / GameModal on native dialog),
  tabs keyboard navigation, unified focus ring.
- Current active spec: `docs/specs/active/SPEC-0001-design-system-hardening.md`.
- Current proof target: consumers upgrade to 0.9.0 with zero API breakage;
  downstream theme overrides cascade fully (TuringPact can shrink its
  651-line clay-overrides toward pure token overrides).
- Runtime-dependency policy: **zero runtime deps** — browser-native
  dialog/popover/color-mix/cascade-layers cover current needs; Base UI 1.0
  recorded as the future escape hatch for complex headless widgets.

## Reading Order

1. `docs/reference/design-system-guide.md` — tokens, theming, motion, a11y.
2. `docs/reference/usage-and-upgrade-playbook.md` — consumers + release SOP.
3. `docs/specs/active/SPEC-0001-design-system-hardening.md` — why.

## Verification

`pnpm typecheck` · `pnpm test` (65 tests incl. token guards) · `pnpm build` ·
`pnpm build-storybook` · `pnpm docs:check`.

## Completed Proof History

Completed plans and specs live in:

- `docs/plans/completed/`
- `docs/specs/completed/`

Do not move completed work back into active. Create a new plan and link the completed record as provenance.
