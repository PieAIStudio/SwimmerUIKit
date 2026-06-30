---
id: PLAN-0005-BLOCK-E-SWIMMER-UIKIT-GAME-UI-ICON-SYSTEM
title: PLAN-0005 Block E SwimmerUIKit Game UI Icon System Report
type: plan
status: completed
canonical: false
owner: ai-assisted
created: 2026-06-28
last_reviewed: 2026-06-28
domain: ui-kit
tags:
  - plan-0005
  - block-e
  - swimmer-ui-kit
  - asset-card
  - icon-system
  - visual-proof
pinned: false
related: []
supersedes: []
superseded_by: null
---

# PLAN-0005 Block E SwimmerUIKit Game UI Icon System Report

## Goal

Create an isolated SwimmerUIKit reproduction for compressed asset-card icons, determine whether the component itself has a visual/capability problem, and repair the issue globally rather than with OwnMySpace-specific CSS.

## Workspace note

The requested source project was `/Users/yuanfei/PieAI/SwimmerUIKit`. DevSpace opened an isolated managed worktree at `/Users/yuanfei/.devspace/worktrees/SwimmerUIKit-c2fd7b46` from `main`. The DevSpace tool did not create the exact requested path `/Users/yuanfei/PieAI/SwimmerUIKit/.worktrees/plan-0005-game-ui-icon-system`. The source checkout was reported dirty before this task; this worktree was kept isolated. No commit, push, publish, deploy, provider, secret, or billing changes were made.

## Required reading

Read successfully:

- `package.json`
- `src/index.ts`
- `src/GameSurfacePack.tsx`
- `src/styles.css`
- `README.md`
- `src/GameSurfacePack.test.tsx`
- `src/stories/GameSurfacePack.stories.tsx`
- `src/GameUiPreview.tsx`
- `src/ClayComponents.tsx`
- existing preview/story/test file inventory

Relevant external skills/checklists read included `loop-library`, `threejs-game-ui-designer`, `threejs-qa-release`, and the screenwalk main skill. Attempts to read several screenwalk reference files were blocked by tool safety checks and were treated as blocked evidence.

## Attribution

SwimmerUIKit 0.6.0 had a real component-level gap. `GameAssetLibrary` and `GameAssetCard` supported comfortable and dense list cards, but had no official compressed/rail variant for mobile side rails. This forced host apps such as OwnMySpace to hide internal card copy and resize internal icon classes directly.

A second UIKit-level issue appeared in the isolated Storybook repro: standalone component stories did not always inherit the `.game-ui-clay-preview * { box-sizing: border-box }` scope. Under a narrow rail, padding and fixed preview sizes could be calculated as content-box, and the `GameAssetIcon size="xl"` selector had higher specificity than the old `.game-ui-asset-card-icon` size rule. The result was a real icon crop in compressed cards.

## Component changes

Changed files:

- `src/GameSurfacePack.tsx`
- `src/index.ts`
- `src/styles.css`
- `src/GameSurfacePack.test.tsx`
- `src/stories/GameSurfacePack.stories.tsx`

Implemented globally:

- Added `GameAssetCardVariant = 'list' | 'rail'`.
- Added `variant?: GameAssetCardVariant` to `GameAssetCard` and `GameAssetLibrary`.
- Added `data-asset-card-variant` and `data-asset-library-variant` attributes for stable styling and testability.
- Added default `aria-label` on `GameAssetCard` buttons so rail mode can hide visual copy while preserving accessible names.
- Added official rail styling for compressed asset libraries: hidden text/count/header chrome, one-column icon-only cards, stable 52px preview slots, internal padding, and selected-state preservation.
- Added box-model hardening for asset cards/previews so Storybook and external consumers do not depend on a preview wrapper for `box-sizing`.
- Replaced the weak `.game-ui-asset-card-icon` sizing rule with `.game-ui-asset-card-preview .game-ui-asset-card-icon`, which overrides `GameAssetIcon size="xl"` correctly inside asset-card previews.
- Added a `RailCompressed` Storybook story for isolated visual proof.
- Added unit coverage for rail variant attributes and accessible naming.

No package version bump or publish was performed because the repository convention requires the registry workflow and no release was requested.

## Visual evidence

Before:

- General preview matrix: `.devspace-visual/block-e-before/swimmer-responsive/responsive-report.json`
- General preview screenshots: `.devspace-visual/block-e-before/swimmer-responsive/desktop.png`, `tablet.png`, `mobile.png`, `small-mobile.png`

Isolated repro and repair:

- First isolated rail story after initial repair attempt: `.devspace-visual/block-e-after/swimmer-rail-story/screenshot.png` showed leaked/overflowing icons and was rejected.
- Second and third attempts: `.devspace-visual/block-e-after2/swimmer-rail-story/screenshot.png` and `.devspace-visual/block-e-after3/swimmer-rail-story/screenshot.png` removed overflow but still showed crop risk because of CSS box model and specificity.
- Final isolated rail story: `.devspace-visual/block-e-after5/swimmer-rail-story/screenshot.png` shows complete rail icons inside the official component story, with no leak beyond the card and no clipping by the preview slot.
- After responsive matrix: `.devspace-visual/block-e-after/swimmer-responsive/responsive-report.json` plus `desktop.png`, `tablet.png`, `mobile.png`, and `small-mobile.png`.

Visual verdict: the isolated `RailCompressed` Storybook story now proves that SwimmerUIKit itself can render compressed rail asset cards safely. The repair is not tied to OwnMySpace class names.

## Verification

- `npm install`: passed. NPM printed allow-scripts warnings for install scripts in `esbuild` and `fsevents`; dependencies installed.
- `npm run typecheck`: passed.
- `npm run test`: passed, 16 files and 39 tests. Storybook printed a harmless “No story files found for the specified pattern: src/**/*.mdx” warning.
- `npm run build`: passed, emitted `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, and `dist/styles.css`.
- `git diff --check`: passed.

## Merge and downstream guidance

Merge SwimmerUIKit first. After the normal package-release path publishes a new registry version, OwnMySpace should consume that package version and move its right-side rail to the official `GameAssetLibrary variant="rail"` contract. Until that package is available, the OwnMySpace worktree keeps only a compatible layout-pressure repair against the currently installed `@pieaistudio/swimmer-ui-kit@0.6.0`.
