# PLAN-0011 Block D — Terrain/build tool pack report

## Baseline

- Repository: SwimmerUIKit
- Worktree: `/Users/yuanfei/PieAI/SwimmerUIKit/.worktrees/plan-0011-terrain-build-tool-pack`
- Branch: `codex/plan-0011-terrain-build-tool-pack`
- Base: `origin/main@6e17f6d774579743c2c7f1cbd92353587c0d7c1b`
- Main checkout note: source checkout had an unrelated untracked `.agents/skills/loop-library`; the task worktree was created from `origin/main` and stayed isolated.

## Loop adaptation

Adapted Loop 010 as a finite product evaluation loop for this pack:

1. Observe current SwimmerUIKit primitives and OwnMySpace read-only usage.
2. Decide which gaps are cross-game UI primitives.
3. Implement one bounded component group at a time.
4. Verify by typecheck, tests, build, Storybook/preview, and screenshots.
5. Record accepted/rejected responsibilities and rerun failing scenarios.

Loop 009 was applied after the first typecheck failure: the failure was exact optional prop handling; regression coverage stayed in the new render tests; the code was corrected and typecheck reran clean.

## Component gap matrix

| Need | Existing coverage | Decision | Result |
| --- | --- | --- | --- |
| Mode segmented control | `GameSegmentedControl` exists but lacks game-tool metadata/icons/hooks | Accept as reusable pack component | `GameTerrainModeControl` |
| Raise/lower/flatten/smooth/paint tools | `GameActionGrid` exists | Compose existing primitive | `GameTerrainToolStrip` |
| Brush radius/strength numeric controls | `GameSlider`, `GameInput`, `GameField` exist separately | Accept paired brush control | `GameBrushControls` |
| Material swatches | No official game swatch selector | Accept reusable selector | `GameMaterialSwatches` |
| Undo/redo icon actions | `GameActionGrid` exists | Compose existing primitive | `GameUndoRedoActions` |
| Build category/library | `GameAssetLibrary` exists for assets, not modular build categories | Accept reusable build-library surface | `GameBuildLibrary` |
| Compact drawer/tool strip | OwnMySpace has local drawer glue only | Accept reusable drawer shell, leave placement to consumer | `GameCompactGameDrawer` |
| Status/progress/error/disabled states | Badges/progress/buttons exist | Compose and expose state props | `GameTerrainBuildToolbox` status area |
| Desktop/dense/mobile/small-mobile | Existing pack has density/layout but no terrain variants | Accept explicit variants | All new terrain/build components support `variant` |
| Terrain schema, edit reducer, picking, save/export | Not UI | Reject from UIKit | Consumer responsibility |

## Public API examples

```tsx
<GameTerrainBuildToolbox
  activeModeId="terrain"
  activeToolId="raise"
  activeMaterialId="grass"
  activeBuildCategoryId="foundation"
  brush={{ radius: 2.75, strength: 0.45 }}
  modes={[{ id: 'terrain', label: 'Terrain' }, { id: 'build', label: 'Build' }]}
  tools={[{ id: 'raise', label: 'Raise' }, { id: 'flatten', label: 'Flatten' }]}
  materials={[{ id: 'grass', label: 'Grass', color: '#4f9d6b' }]}
  buildCategories={[{ id: 'foundation', label: 'Foundation', items: [{ id: 'floor-2x2', label: '2x2 floor' }] }]}
  undoRedo={{ canUndo: true, canRedo: false }}
  label="Terrain and build tools"
  title="Island tools"
/>
```

Use `variant="mobile"` or `variant="small-mobile"` for compact drawer behavior. Consumers still own where the drawer sits in their HUD/canvas layout.

## Accepted components

- `GameTerrainBuildToolbox`
- `GameTerrainModeControl`
- `GameTerrainToolStrip`
- `GameBrushControls`
- `GameMaterialSwatches`
- `GameUndoRedoActions`
- `GameBuildLibrary`
- `GameCompactGameDrawer`

## Rejected components / consumer responsibility

- OwnMySpace-specific terrain document shape.
- Terrain command reducers and validation.
- Canvas picking and brush preview mesh.
- Save, reload, export, migration, and persistence.
- Collision, chunk rebuild, and Three.js/R3F ownership.
- Exact drawer/HUD placement around OwnMySpace movement and generation controls.

## Verification evidence

- `npm ci`: passed. NPM warned about unapproved install scripts for `esbuild` and optional `fsevents` packages; no package publish or token action was performed.
- `npm run typecheck`: passed after exact optional prop repair.
- `npm test`: passed, 17 files / 45 tests. Vitest emitted a post-run close-timeout warning, but the command returned success.
- `npm run build`: passed. Output emitted `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, and `dist/styles.css`.
- `npm run build-storybook`: passed twice consecutively after lead review removed duplicate public-asset copying between Storybook `staticDirs` and Vite `publicDir`. Storybook still reports the existing chunk-size warning for large docs/iframe chunks; no build failure.
- Preview responsive matrix: captured under `.devspace-visual/plan-0011-terrain-build/preview-responsive/` for desktop, tablet, mobile, and small-mobile.
- Storybook isolated matrix: captured under `.devspace-visual/plan-0011-terrain-build/storybook-isolated/` for comfortable, narrow, mobile, and small-mobile stories.
- Interaction flow: captured under `.devspace-visual/plan-0011-terrain-build/drawer-flow/`; controlled drawer close/reopen verified in `InteractiveDrawer`.
- Visual inspection notes: icon-only shortcut badges initially crowded mobile tool icons and undo/redo actions. CSS was repaired to keep shortcuts accessible in markup while hiding them visually in icon-only terrain/undo areas. Re-captured isolated story screenshots show no horizontal overflow and stable hooks across all variants.
- `git diff --check -- README.md src docs`: passed.

## Package version

The branch is prepared as `0.7.0`, because this adds public exported terrain/build components and type surface. No package was published from the task worktree; lead integration owns tag and registry release.

Lead review also added official `undo` and `redo` icon semantics backed by the existing clay asset catalog, replacing the temporary list/copy metaphors. Fresh Storybook screenshots were regenerated after that correction.
