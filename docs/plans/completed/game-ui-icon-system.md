---
id: PLAN-0005-GAME-UI-ICON-SYSTEM
title: PLAN-0005 Game UI Icon System
type: plan
status: completed
canonical: false
owner: ai-assisted
created: 2026-06-28
last_reviewed: 2026-06-28
domain: implementation
tags:
  - plan-0005
  - swimmer-ui-kit
  - game-surface-pack
  - asset-card
  - icons
  - responsive
  - visual-evidence
related:
  - PLAN-0004-GAME-ICON-SURFACE-FIX
---

# PLAN-0005 Game UI Icon System

## Scope

This report records the SwimmerUIKit-side work for PLAN-0005 Block E: official UI visual ownership proof / icon clipping repair.

The goal was not to patch OwnMySpace with a local UI kit. The goal was to prove ownership of the visual defect and, if the package lacked a durable compressed layout behavior, upgrade the official game surface pack so every consumer can use `GameAssetCard` / `GameAssetLibrary` in dense, rail, mobile, and compressed contexts without clipping asset icons.

## Method

The work followed the requested loop-library modes:

- Compare: OwnMySpace's current asset rail was compared with SwimmerUIKit's isolated preview behavior.
- Audit: the failure mode was checked visually, not only by DOM existence or source inspection.
- Adapt: the package gained official compressed / rail behavior instead of asking OwnMySpace to keep overriding internals.
- Repair: the fix was verified in SwimmerUIKit preview and then consumed by OwnMySpace locally for after screenshots.

This was a same-agent repair verification pass, not an independent ScreenWalk after-critic pass.

## Attribution

The defect was a two-part ownership issue:

1. SwimmerUIKit did not expose an official compressed asset-library behavior. In a narrow container, the default `GameAssetLibrary` list surface could overflow horizontally, and source-mode clay icons could still look cut when the preview became very small.
2. OwnMySpace had compensated by directly targeting official internal classes such as `.game-ui-asset-card`, `.game-ui-asset-card-preview`, and `.game-ui-asset-card-copy`. That kept the game playable but made the visual contract fragile and app-specific.

Therefore the durable owner is SwimmerUIKit for the component capability, while OwnMySpace should only keep outer layout glue and official CSS variable tuning.

## Isolated Repro Evidence

A new preview proof section was added to `GameUiPreview`: `Asset card compression proof`.

It renders the same official `GameAssetLibrary` in three containers:

- comfortable: 320px
- narrow: 156px
- rail: 64px

Before the repair, the narrow and rail captures showed clipped / overflowing library contents:

- `.devspace-visual/block-e-before-uikit-repro/comfortable-surface.png`
- `.devspace-visual/block-e-before-uikit-repro/narrow-surface.png`
- `.devspace-visual/block-e-before-uikit-repro/rail-surface.png`
- `.devspace-visual/block-e-before-uikit-repro/rail-selected-preview.png`

After the repair, the same proof shows icon-only rail behavior with the icon inside the preview rather than leaking outside the container:

- `.devspace-visual/block-e-after-uikit-repro/comfortable-surface.png`
- `.devspace-visual/block-e-after-uikit-repro/narrow-surface.png`
- `.devspace-visual/block-e-after-uikit-repro/rail-surface.png`
- `.devspace-visual/block-e-after-uikit-repro/rail-selected-preview.png`

The outer repro label is intentionally outside the component contract; the inspected target is the official `GameAssetLibrary` / selected preview inside the compressed frame.

## Changes

### `src/GameSurfacePack.tsx`

- Added `GameAssetCardLayout = 'auto' | 'list' | 'rail'`.
- Added `cardLayout?: Exclude<GameAssetCardLayout, 'auto'>` to `GameAssetCard`.
- Added `data-asset-card-layout` on `GameAssetCard`.
- Added `cardLayout?: GameAssetCardLayout` to `GameAssetLibrary`, defaulting to `auto`.
- Added `data-card-layout` on `GameAssetLibrary` so CSS can own auto / rail behavior globally.
- Lead review update: `GameAssetLibrary` now passes the resolved non-`auto`
  `cardLayout` into each rendered `GameAssetCard`, so the official DOM hooks are
  consistent at both the library and card levels.

### `src/GameSurfaces.tsx`

- Extended `GamePanelProps` from `HTMLAttributes<HTMLElement>` and spread safe HTML/data attributes onto the rendered section.
- This lets composed package components attach official `data-*` state without inventing parallel wrappers.

### `src/styles.css`

- Made `.game-ui-asset-library` an inline-size container.
- Added official CSS variables for host tuning:
  - `--game-ui-asset-card-min-width`
  - `--game-ui-asset-card-dense-min-width`
  - `--game-ui-asset-rail-card-size`
  - `--game-ui-asset-rail-preview-size`
- Added automatic rail rules for `data-card-layout="auto"` when the asset library is <= 180px wide.
- Added explicit rail rules for `data-card-layout="rail"` and standalone `GameAssetCard cardLayout="rail"`.
- Scaled the nested `game-ui-asset-card-icon` in rail mode so source PNG icons remain visually complete inside very small previews.

### Tests and preview

- `src/GameSurfacePack.test.tsx`: added a regression assertion for official rail layout hooks.
- `src/stories/GameSurfacePack.stories.tsx`: added `CompressedAssetRail`.
- `src/GameUiPreview.tsx`: added the isolated asset compression proof used for screenshots.
- `src/index.ts`: exported `GameAssetCardLayout`.

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

- `npm install`: passed. npm emitted allow-scripts warnings for install-script packages; install completed.
- `npm run typecheck`: passed.
- `npm test`: passed, 16 test files and 39 tests.
- `npm run build`: passed and emitted `dist/styles.css`, `dist/index.js`, and `dist/index.cjs`.
- `git diff --check`: passed.

## Package / Merge Strategy

Lead review update: this branch now bumps `@pieaistudio/swimmer-ui-kit` from
`0.6.0` to `0.6.1`. The already-published registry version `0.6.0` should not
be reused for new package contents.

No publish, commit, push, or deploy was performed.

Recommended order:

1. Merge and release the SwimmerUIKit branch first as `0.6.1`.
2. Then update OwnMySpace to consume `@pieaistudio/swimmer-ui-kit@^0.6.1`.
3. Then merge the OwnMySpace branch that removes app-specific internal card overrides and relies on the official package behavior.
4. OwnMySpace after evidence in this task used a locally built SwimmerUIKit `dist` copied into `node_modules` only for proof. That local copy is not a committed dependency strategy.

## Residual Risks

- The package now supports compressed rail behavior, but hosts can still make a rail so small that it is technically complete but visually too tiny. That should be treated as a layout readability problem.
- The preview uses source asset mode, while many consumers use inline fallback mode by default. The repair covers both by scaling the wrapper rather than hardcoding a single asset path.
- An independent ScreenWalk after-critic would still be valuable after merge; this report records the same-agent repair verification evidence only.
