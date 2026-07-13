---
id: REF-LEARNING-TOOLING-DECISIONS-VITEST-INCLUDE-GLOB-SILENTLY-EXCLUDED-ALL-TEST-TSX-FILES
title: "vitest include glob silently excluded all .test.tsx files"
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-07-13
last_reviewed: 2026-07-13
domain: learning
tags:
  - learning-recall
  - tooling-decisions
pinned: false
related: []
category: tooling-decisions
module: "PGS learning capture"
capture_mode: pgs-native
---

# vitest include glob silently excluded all .test.tsx files

## Guidance

vitest.config.ts's unit-test project had include: ['src/**/*.test.ts'], which matches only literal .ts files — .test.tsx does NOT match despite looking like it should. This silently excluded 5 real test files (GameContractorTools, GamePanelSystem, GameSurfacePack, GameTerrainBuildTools, and any new component test) covering 30+ tests from every 'pnpm test' run, with the command still exiting 0 and reporting a misleadingly stable pass count. Detected because adding tests to a .tsx file didn't move the total test count. Fix: widen the glob to 'src/**/*.test.{ts,tsx}'. Fixing it surfaced two more dormant bugs that had never been exercised: (1) a test asserting the JSX-cased string tabIndex="0" against renderToStaticMarkup output, which always lowercases HTML attributes to tabindex="0"; (2) a test asserting real asset filenames (back-v1.png) without calling setClayAssetMode('source') first, so it was actually rendering inline SVG data URIs by default. Prevention: whenever a test suite's pass/file count doesn't change after adding or renaming a test file, verify the include glob literally matches the file's extension before trusting a green run.

## Applies When

- The work is complete and verified.
- The lesson is non-obvious, reusable, and not already documented.
