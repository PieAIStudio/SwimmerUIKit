---
id: PLAN-DOCS-PLANS-REPORTS-PLAN-0002-OWNMYSPACE-GAME-SURFACE-PACK
title: "PLAN-0002 OwnMySpace Game Surface Pack Report"
type: plan
status: completed
canonical: false
owner: project
created: 2026-07-02
last_reviewed: 2026-07-02
domain: project-docs
tags:
  - project-docs
pinned: false
related: []
---
# PLAN-0002 OwnMySpace Game Surface Pack Report

## Scope Ledger

- Workspace root: `/Users/yuanfei/PieAI/SwimmerUIKit`
- Worktree path: `/Users/yuanfei/PieAI/SwimmerUIKit/.worktrees/plan-0002-ownmyspace-game-surface-pack`
- Branch: `codex/plan-0002-ownmyspace-game-surface-pack`
- Base: `main @ b3b8068c606e92e38defc3f02ff6fcc405ea2c39`
- Loop budget: 8 rounds maximum
- Loops used: 5 implementation/evidence loops
- Commit: not committed

## Read First Evidence

Read/inspected:

- `package.json`
- `package-lock.json`
- `README.md`
- `src/index.ts`
- `src/GameButton.tsx`
- `src/GameSurfaces.tsx`
- `src/ClayComponents.tsx`
- `src/FirstSessionGameShell.tsx`
- `src/GameUiPreview.tsx`
- `src/styles.css`
- `src/tokens.test.ts`
- `.github/workflows/publish.yml`
- `/Users/yuanfei/PieAI/OwnMySpace/docs/plans/reports/PLAN-0002/block-v-official-ui-replacement.md`

Not accessible through DevSpace allowed roots:

- `/Users/yuanfei/.devspace/worktrees/SwimmerUIKit-dfc70660/docs/plans/reports/PLAN-0002/ownmyspace-ui-readiness-audit.md`

## Components Added

Implemented first-class official game-surface components in `src/GameSurfacePack.tsx`:

- `GameShell`
- `GameSceneHudLayout` alias
- `GameFactList`
- `GameStatList` alias
- `GameMovementPad`
- `GameAssetLibrary`
- `GameAssetCard`
- `GamePlacementToolbar`
- `GameObjectToolbar` alias
- `GameActionGrid`

Also added:

- Public exports from `src/index.ts` for all components and their types.
- Official CSS classes in `src/styles.css` for shell slots, HUD facts, movement pad, asset library/card, placement toolbar, dense/mobile layout hooks, and preview demo scene.
- Render/a11y/variant tests in `src/GameSurfacePack.test.tsx`.
- Storybook examples in `src/stories/GameSurfacePack.stories.tsx`.
- Game UI preview section in `src/GameUiPreview.tsx` so the package preview includes the OwnMySpace surface pack.
- Documentation in `README.md` and `doc/design/ownmyspace-game-surface-pack.md`.

## Component API Summary

### `GameShell` / `GameSceneHudLayout`

Slot-based shell for a host app scene/canvas. Props include:

- `title`
- `children`
- `hud`
- `assetLibrary`
- `sidePanel`
- `movementPad`
- `bottomBar`
- `overlay`
- `density: 'comfortable' | 'dense'`
- `layout: 'auto' | 'desktop' | 'mobile'`

The shell does not import runtime or scene code. Host apps pass the R3F/canvas surface as `children`.

### `GameFactList` / `GameStatList`

Reusable HUD/stat chip list. Props include:

- `label`
- `facts: GameFactItem[]`
- `density`
- `variant: 'facts' | 'stats'`

Each fact supports `id`, `label`, `value`, optional `meta`, optional official clay `icon`, and optional badge `tone`.

### `GameMovementPad`

Official movement controls. Props include:

- `label`
- `actions`
- `layout: 'dpad' | 'row'`
- `density`
- `disabled`
- `helpText`
- `onMove(direction)`

Default actions render arrow/WASD controls with accessible labels. The focusable pad maps arrow keys and WASD to `onMove` without importing host movement logic.

### `GameAssetCard`

Selectable placement-ready asset card. Props include:

- `assetId`
- `title`
- `source: 'starter' | 'generated' | 'imported'`
- `status: 'ready' | 'generating' | 'missing' | 'placed' | 'selected' | 'error'`
- `description`
- `thumbnailSrc` / `thumbnailAlt`
- `icon`
- `facts`
- `badges`
- `selected`
- `disabled`
- `onSelect(assetId)`

It visibly distinguishes starter/generated/imported assets with official badges and `data-asset-source` hooks.

### `GameAssetLibrary`

Official grouped asset library. Props include:

- `title`
- `label`
- `subtitle`
- `groups: GameAssetGroup[]`
- `selectedAssetId`
- `onSelectAsset(assetId)`
- `emptyTitle`
- `emptyDescription`
- `emptyAction`
- `density`

It computes and renders source counts for starter/generated/imported assets and maps each asset to `GameAssetCard`.

### `GamePlacementToolbar` / `GameObjectToolbar`

Official placement/object toolbar. Props include:

- `title`
- `selectedTitle`
- `statusLabel`
- `statusValue`
- `statusTone`
- `placedObjects`
- `maxObjects`
- `capacityLabel`
- `actions`
- `objectActions`
- `density`

It uses `GameFactList`, `GameProgress`, and `GameActionGrid` to avoid host apps composing a local toolbar design.

### `GameActionGrid`

Official action pattern for full-width buttons or icon-only controls. Props include:

- `label`
- `actions: GameUiAction[]`
- `style: 'button' | 'icon'`
- `density`

Each action supports `id`, `label`, optional `icon`, `tone`, `disabled`, `selected`, `shortcut`, `badge`, and `onAction(id)`.

## What OwnMySpace Local UI Can Now Delete

Once OwnMySpace consumes registry version `@pieaistudio/swimmer-ui-kit@0.6.0`, it should be able to delete or greatly shrink local DOM UI glue for:

- Local game shell/HUD layout wrappers around the 3D scene.
- Local movement pad button/grid styles and event affordance UI.
- Local starter/generated/imported asset library panels.
- Local asset cards and source/status chip/badge styling.
- Local placement toolbar/object toolbar panels.
- Local action grid/button/icon-button wrapper patterns.
- Local fact/stat chip visual treatments for object count, selected object, placement status, and player position.
- Long-term committed `vendor/packages/*.tgz` bridge for SwimmerUIKit.

OwnMySpace should still keep:

- R3F/Three.js/canvas runtime.
- Scene state, placement math, persistence, keyboard/game input orchestration, generated/imported asset manifests, save/reload flows, provider adapters, and tests.
- Minimal layout glue only when the host page has product-specific routing or viewport composition that the UI kit should not own.

## Distribution Strategy Replacing Long-Term TGZ Bridge

The package already had an official GitHub Packages route:

- `package.json` uses name `@pieaistudio/swimmer-ui-kit`.
- `package.json` already has `publishConfig.registry = https://npm.pkg.github.com`.
- `.github/workflows/publish.yml` builds and publishes on `v*` tags or manual dispatch.

This task did not change package name or publish config. It did bump the package version from `0.5.1` to `0.6.0` so the OwnMySpace surface pack can be published as a distinct registry version.

Documented official consumption path:

```json
{
  "dependencies": {
    "@pieaistudio/swimmer-ui-kit": "0.6.0"
  }
}
```

Consuming apps should configure the scope registry:

```ini
@pieaistudio:registry=https://npm.pkg.github.com
```

Authentication must come from the host environment, such as `NODE_AUTH_TOKEN` or platform package-read secrets. No tokens were added. Committed `.tgz` files should be treated only as emergency bridges before a registry version exists, not as the durable OwnMySpace integration path.

## Remaining Gaps

No blocking component-design gap was found.

Known limitations and follow-ups:

- This work does not publish `0.6.0`; it prepares the package for the existing GitHub Packages workflow. A release tag or workflow dispatch is still required.
- This work does not edit OwnMySpace's committed tarball dependency directly. Removing `vendor/packages/pieaistudio-swimmer-ui-kit-0.5.1.tgz` should happen in OwnMySpace after `0.6.0` is published and package-read auth is configured in local/CI/Vercel environments.
- `GameMovementPad` provides official accessible controls and keyboard mapping, but host apps still own camera/avatar movement semantics.
- `GameAssetLibrary` keeps asset grouping generic; host apps still normalize starter/generated/imported data before passing it into the kit.
- The inaccessible readiness audit was not used; the accessible OwnMySpace Block V report was used as the gap source instead.

## Visual Evidence

### Desktop preview inspection

- Command used: `with-dev-server` + `inspect-webpage` against the package preview.
- Evidence folder: `.devspace-visual/ownmyspace-game-surface-pack/preview/`
- Inspected files:
  - `.devspace-visual/ownmyspace-game-surface-pack/preview/inspection-report.json`
  - `.devspace-visual/ownmyspace-game-surface-pack/preview/screenshot.png`
- Observed facts:
  - Page title: `Swimmer UI Kit Preview`.
  - Console errors: none.
  - Page errors: none.
  - Failed network requests: none.
  - Screenshot includes a new `OwnMySpace game surface pack` preview section with HUD facts, a scene slot, movement controls, placement toolbar, and an asset library showing starter/generated/imported assets.

### Responsive preview inspection

- Command used: `with-dev-server` + `capture-responsive`.
- Evidence folder: `.devspace-visual/ownmyspace-game-surface-pack/responsive/`
- Inspected files:
  - `.devspace-visual/ownmyspace-game-surface-pack/responsive/responsive-report.json`
  - `.devspace-visual/ownmyspace-game-surface-pack/responsive/mobile.png`
  - `.devspace-visual/ownmyspace-game-surface-pack/responsive/small-mobile.png`
- Observed facts:
  - Captures were produced for desktop `1440x900`, tablet `768x1024`, mobile `390x844`, and small-mobile `360x740`.
  - Mobile and small-mobile screenshots show the OwnMySpace surface pack section, including the scene slot, movement controls, placement toolbar, and asset library in a stacked/compact layout.

## Verification Output

| Command | Result |
| --- | --- |
| `npm ci` | Passed after version/lockfile update; installed 262 packages. |
| `npm run typecheck` | Passed: `tsc -p tsconfig.build.json --noEmit`. |
| `npm test` | Passed: 16 test files, 38 tests. Storybook reported no `.mdx` story files and telemetry notice, but Vitest passed. |
| `npm run build` | Passed: Vite built `dist/styles.css`, `dist/index.js`, `dist/index.cjs`; declaration build passed. |
| `git diff --check` | Passed after report write. |

## Files Changed

- `package.json`
- `package-lock.json`
- `README.md`
- `doc/design/ownmyspace-game-surface-pack.md`
- `docs/plans/reports/PLAN-0002/ownmyspace-game-surface-pack.md`
- `src/GameSurfacePack.tsx`
- `src/GameSurfacePack.test.tsx`
- `src/GameUiPreview.tsx`
- `src/index.ts`
- `src/stories/GameSurfacePack.stories.tsx`
- `src/styles.css`

## Loop Ledger

### Loop 1: Worktree and source intake

- Goal: create the requested SwimmerUIKit worktree and identify OwnMySpace UI gaps.
- Evidence inspected: git worktree list/status, required package sources, OwnMySpace Block V report.
- Observed facts: OwnMySpace used a temporary committed tgz bridge and still needed official package-level shell, movement, asset library, placement toolbar, and action patterns.
- Decision: iterate.

### Loop 2: Component implementation

- Goal: implement first-class reusable components without importing OwnMySpace runtime code.
- Scoped change: added `src/GameSurfacePack.tsx`, public exports, and official CSS.
- Verification: first `npm run typecheck` found two `exactOptionalPropertyTypes` issues; after targeted fix, typecheck passed.
- Decision: iterate.

### Loop 3: Tests and docs

- Goal: prove render shape, a11y labels, source distinction, dense/mobile hooks, and action pattern.
- Scoped change: added `src/GameSurfacePack.test.tsx`, README docs, and design docs.
- Verification: `npm test` passed.
- Decision: iterate.

### Loop 4: Preview and visual evidence

- Goal: make the surface pack visible in official preview evidence.
- Scoped change: added OwnMySpace surface pack sample to `GameUiPreview` and Storybook stories.
- Verification: `inspect-webpage` and `capture-responsive` produced fresh evidence with no console errors, page errors, failed requests, or HTTP errors.
- Decision: iterate.

### Loop 5: Distribution strategy and final verification

- Goal: replace long-term tgz-bridge expectation with official registry distribution strategy.
- Scoped change: documented GitHub Packages consumption path, kept package name/publish config unchanged, bumped version to `0.6.0`, and updated lockfile.
- Verification: `npm ci`, `npm run typecheck`, `npm test`, and `npm run build` passed.
- Decision: final.

## Stop-List Confirmations

- Did not change package name.
- Did not change `publishConfig`.
- Did not add secrets or tokens.
- Did not modify billing, cloud deploy, schema/RPC, or provider code.
- Did not import OwnMySpace runtime code into SwimmerUIKit.
- Did not commit.
