---
id: PLAN-0004-GAME-ICON-SURFACE-FIX
title: PLAN-0004 Game Icon Surface Fix
type: plan
status: completed
canonical: false
owner: ai-assisted
created: 2026-06-28
last_reviewed: 2026-06-28
domain: implementation
tags:
  - plan-0004
  - game-surface-pack
  - icons
  - asset-card
  - responsive
  - preview-evidence
related: []
---

# PLAN-0004 Game Icon Surface Fix

## Scope

This report records the SwimmerUIKit-side fix for abnormal game-surface icon rendering discovered while OwnMySpace consumed the official `@pieaistudio/swimmer-ui-kit` package.

The fix was made from the global component-surface perspective: `GameAssetCard` must keep its icon visible when a consumer uses a compact asset rail or otherwise shrinks the preview container. This is not an OwnMySpace-only behavior.

## Observed Problem

Fresh OwnMySpace screenshots showed that HUD fact icons and toolbar icons were visible, but asset-card icons in the mobile / small-mobile rail were clipped so only a corner or slice of the icon appeared.

Source inspection confirmed the contract mismatch:

- `GameAssetCard` renders fallback icons through `GameAssetIcon` at `size="xl"`.
- `.game-ui-asset-card-preview` can be legitimately resized by a consumer.
- The nested `GameAssetIcon` wrapper retained the `xl` token size even when the preview was smaller.
- Because the preview has `overflow: hidden`, the icon was clipped instead of fitting the container.

This was not a missing icon mapping or broken fallback. `src/clay/assets.ts` already provides semantic icon mappings, source asset resolution, and inline SVG fallbacks.

## Changes

Changed `src/GameSurfacePack.tsx`:

- `GameAssetCard` now gives its generated fallback `GameAssetIcon` a stable class name: `game-ui-asset-card-icon`.

Changed `src/styles.css`:

- Added a global card-surface rule:
  - `.game-ui-asset-card-icon { width: min(100%, var(--game-ui-asset-icon-xl)); height: min(100%, var(--game-ui-asset-icon-xl)); }`
- This preserves the 64px default when the preview is 64px or larger, but lets the icon shrink with smaller preview containers.

Changed `src/GameSurfacePack.test.tsx`:

- Added a regression assertion that `GameAssetCard` markup includes the `game-ui-asset-card-icon` hook.

## Preview / Story Evidence

SwimmerUIKit preview evidence was captured under `.devspace-visual/plan-0004-game-icon-surface-fix/preview-flow/`.

- Flow report: `.devspace-visual/plan-0004-game-icon-surface-fix/preview-flow/flow-report.json`
- Preview top screenshot: `.devspace-visual/plan-0004-game-icon-surface-fix/preview-flow/preview-top.png`
- Game surface pack screenshot: `.devspace-visual/plan-0004-game-icon-surface-fix/preview-flow/surface-pack.png`
- Lower preview screenshot: `.devspace-visual/plan-0004-game-icon-surface-fix/preview-flow/surface-pack-lower.png`

Flow result:

- Status: pass.
- Page: `Swimmer UI Kit Preview`.
- Console errors: none.
- Runtime page errors: none.
- Network failures / HTTP errors: none.
- The preview includes the `OwnMySpace game surface pack` section and responsive proof targets.

## Verification

Commands run in the SwimmerUIKit worktree:

```bash
npm install
npm run typecheck
npm test
npm run build
git diff --check
```

Results:

- `npm install`: passed. npm reported allow-scripts warnings for install-script packages, but dependency installation completed.
- `npm run typecheck`: passed.
- `npm test`: passed, 16 test files and 38 tests.
- `npm run build`: passed. Vite built `dist/styles.css`, `dist/index.js`, and `dist/index.cjs`; TypeScript declaration build completed.
- `git diff --check`: passed.

## Consumer Strategy

OwnMySpace was not switched to this local worktree or a temporary tarball as its final strategy. The OwnMySpace worktree remains a registry-package consumer. This SwimmerUIKit fix should be published through the normal package release path before relying on it for other consumers.

## Residual Risks

- This fix addresses fallback icon fit inside `GameAssetCard`. It does not audit every future custom consumer override of `.game-ui-asset-icon`.
- Source PNG asset mode still requires the host app to serve the clay asset files. Inline mode remains the default fallback for package consumers.
- If a consumer shrinks asset-card previews below practical touch or readability size, icons may technically fit while still being too small for a good player experience. That should be treated as a layout quality issue, not an icon-path failure.
