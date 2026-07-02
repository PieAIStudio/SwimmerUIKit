---
id: REF-DOCS-DESIGN-TERRAIN-BUILD-TOOLING
title: "Terrain/build tooling design notes"
type: reference
status: active
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
# Terrain/build tooling design notes

## Scope

SwimmerUIKit now provides official DOM controls for terrain editing and build tooling across Pie game surfaces. The components accept data and callbacks through props. They do not import host runtime stores, Three.js/R3F objects, terrain schemas, provider code, persistence adapters, or billing logic.

## Accepted reusable components

- `GameTerrainModeControl`: mode segmented control.
- `GameTerrainToolStrip`: raise, lower, flatten, smooth, paint tool selection.
- `GameBrushControls`: paired range and numeric controls for brush radius and strength.
- `GameMaterialSwatches`: accessible material selector.
- `GameUndoRedoActions`: official icon action pair for edit history.
- `GameBuildLibrary`: build category and item library.
- `GameCompactGameDrawer`: compact mobile/small-mobile drawer.
- `GameTerrainBuildToolbox`: composite shell.

## Rejected from UIKit

OwnMySpace terrain document shape, brush world picking, edit reducers, save/reload/export, collision, terrain sampling, chunk rebuild, Three.js mesh ownership, and app-specific placement around movement or generation controls remain consumer responsibility.

## Stable hooks

The pack exposes `data-ui-hook` values for `terrain-mode-control`, `terrain-tool-strip`, `brush-controls`, `material-swatches`, `undo-redo-actions`, `build-library`, `compact-game-drawer`, and `terrain-build-toolbox`. It also exposes `data-mode-id`, `data-active-tool`, `data-material-id`, `data-build-category-id`, `data-build-item-id`, and `data-build-item-status`.

## Variants and tokens

Variants are `desktop`, `dense`, `mobile`, and `small-mobile`. The mobile variants use compact drawer behavior. Terrain tool strips default to compact icon captions on mobile and small-mobile through `toolCompactLabelMode="auto"`, while `toolCompactLabelMode="hidden"` remains available for strict icon-only HUDs that still expose full aria labels.

New sizing tokens are `--game-ui-terrain-swatch-size`, `--game-ui-terrain-tool-hit-size`, `--game-ui-build-rail-card-size`, and `--game-ui-brush-number-width`. These are exported through `CLAY_ASSET_SIZE_TOKENS` because they are reusable game-control sizing contracts.

## Hardening additions

- `GameActionGrid` now supports `iconLabelMode="caption"` and action-level `compactLabel` / `ariaLabel` so dense game HUDs can show short visual captions without losing full accessibility labels.
- `GameTerrainToolStrip` exposes `compactLabelMode` and `GameTerrainBuildToolbox` exposes `toolCompactLabelMode` for consumer-level control over captioned versus strict icon-only terrain tools.
- `GameTerrainModeControl`, `GameMaterialSwatches`, and `GameBuildLibrary` accept `compactLabel` values to prevent small-mobile text squeeze while preserving full aria labels.
- `GameMaterialSwatches` supports `pattern`, `secondaryColor`, and color CSS variables so terrain paint options can be visually distinct beyond a flat color chip.
- `GameBuildLibrary` build items support `previewSrc` / `previewAlt` for reusable official thumbnails without importing host app asset manifests.
- `GameCompactGameDrawer` accepts `panelId`, `triggerIcon`, and `closeIcon` so hosts can keep stable drawer relationships through close/reopen cycles and avoid ID collisions.

## Responsive proof matrix

| Target | Storybook proof | Expected behavior |
| --- | --- | --- |
| Desktop 1440 | `Desktop`, `ResponsiveMatrix` | Full labels, 3-column terrain controls, build library visible, no horizontal overflow. |
| Tablet 768 | `Dense`, `ResponsiveMatrix` | Dense mode reflows brush controls below tool/history controls. |
| Mobile landscape 844 | `MobileDrawer`, `ResponsiveMatrix` | Drawer opens with compact captioned tool icons and scrollable panel. |
| Small mobile 360 | `SmallMobileDrawer`, `ResponsiveMatrix`, `IconOnlyMobileA11y` | Compact labels, two-column mode/material/category grids, rail build pieces, stable drawer open/close. |
