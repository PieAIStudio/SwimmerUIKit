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

Variants are `desktop`, `dense`, `mobile`, and `small-mobile`. The mobile variants use compact drawer and icon tool-strip behavior; the small-mobile variant compresses material choices and build cards.

New sizing tokens are `--game-ui-terrain-swatch-size`, `--game-ui-terrain-tool-hit-size`, `--game-ui-build-rail-card-size`, and `--game-ui-brush-number-width`. These are exported through `CLAY_ASSET_SIZE_TOKENS` because they are reusable game-control sizing contracts.
