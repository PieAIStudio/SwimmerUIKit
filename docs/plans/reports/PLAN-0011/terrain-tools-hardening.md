# PLAN-0011 Block G — Terrain/build tools hardening

## Scope

- Repository: `/Users/yuanfei/PieAI/SwimmerUIKit`
- Worktree: `/Users/yuanfei/PieAI/SwimmerUIKit/.worktrees/plan-0011-terrain-tools-hardening`
- Branch: `codex/plan-0011-terrain-tools-hardening`
- Base: `origin/main` @ `a3203e8671b06ab2faa66e9108f9e4f8587e1d99`
- Stop-list honored: did not edit OwnMySpace, did not publish, did not deploy, did not touch tokens/secrets/billing.

## Skill/reference ledger

| Skill/reference | Used | Notes |
| --- | --- | --- |
| loop-library | Yes | Adapt / Repair / Verify loop: audit current kit state, make one bounded reusable UI-kit change, verify with tests/build/visual proof. |
| threejs-game-ui-designer | Yes | Loaded UI patterns plus game UI quality, HUD readability, responsive fit, and mobile input checklists. |
| game-studio:game-ui-frontend | Yes | Applied low-chrome game UI rule: terrain tools stay drawer/edge-friendly and protect the playfield. |
| frontend-design | Yes | Kept the clay game visual language while adding one intentional risk: patterned terrain material swatches rather than flat dashboard color chips. |

## Audit findings before change

The terrain/build pack already existed and exported the required components:

1. `GameTerrainBuildToolbox`
2. `GameTerrainModeControl`
3. `GameTerrainToolStrip`
4. `GameBrushControls`
5. `GameMaterialSwatches`
6. `GameUndoRedoActions`
7. `GameBuildLibrary`
8. `GameCompactGameDrawer`

Main hardening gaps:

- Mobile tool strip was strict icon-only by default; accessible labels existed through `GameIconButton`, but visual clarity depended too much on icon recognition.
- Terrain paint swatches were flat color chips only, which is weak for grass/path/stone/water-style terrain materials.
- Build library did not expose official thumbnail support for build pieces.
- Drawer relationship was derived from title only, which can collide or shift if a host has multiple drawers or renames the title.
- Storybook had desktop/mobile happy paths but not enough stress stories for responsive matrix, drawer closed, icon-only accessibility, longer labels, larger material sets, or overflow.

## Implementation summary

### Generic UI Kit strengthening

- Added `GameActionGrid` support for `iconLabelMode="caption"` plus action-level `compactLabel` and `ariaLabel`.
- Extended `GameHudActions` to accept safe HTML attributes so reusable action grids can expose layout data hooks without wrapper hacks.
- Added caption CSS for icon action grids with stable hit targets and no icon clipping.

### Terrain/build component API strengthening

- `GameTerrainToolStrip`
  - Added `compactLabelMode?: 'auto' | 'hidden' | 'caption'`.
  - Default `auto` resolves to visible compact captions on `mobile` / `small-mobile`, and hidden captions on desktop/dense.
- `GameTerrainBuildToolbox`
  - Added `toolCompactLabelMode` to pass the above behavior through the composite component.
- `GameTerrainModeControl`
  - Added compact visual labels and full aria-label preservation.
- `GameMaterialSwatches`
  - Added `compactLabel`, `pattern`, and `secondaryColor` for terrain-paint readable swatches.
  - Supported `solid`, `speckled`, `hatched`, and `grid` patterns through CSS.
- `GameBuildLibrary`
  - Added category/item compact labels.
  - Added build item `previewSrc` / `previewAlt` for official reusable thumbnails without importing host manifests.
  - Added status-aware `aria-label` and disabled click gating for locked/missing pieces.
- `GameCompactGameDrawer`
  - Added `panelId`, `triggerIcon`, and `closeIcon` for stable open/close/reopen relationships and multiple drawer support.
  - Kept controlled `open` API; no host state or app logic imported.

### Documentation and Storybook

- Updated `README.md` terrain/build usage with compact labels, material patterns, and `toolCompactLabelMode`.
- Updated `docs/design/terrain-build-tooling.md` with hardening additions and responsive matrix.
- Reworked `GameTerrainBuildTools.stories.tsx` with:
  - `Desktop`
  - `Dense`
  - `MobileDrawer`
  - `SmallMobileDrawer`
  - `IconOnlyMobileA11y`
  - `ResponsiveMatrix`
  - `BuildLibraryOverflow`
  - `DrawerClosed`
  - `InteractiveDrawer`

## Responsive matrix

| Target | Storybook proof | Result |
| --- | --- | --- |
| Desktop 1440×900 | `Desktop` | No console errors, no horizontal overflow, no clipped buttons. |
| Tablet 768×900 | `Dense` | No console errors, no horizontal overflow, no clipped buttons. |
| Mobile landscape 844×390 | `MobileDrawer` | Drawer open, no console errors, no horizontal overflow, no clipped buttons. |
| Small mobile 360×640 | `SmallMobileDrawer` | Drawer open, no console errors, no horizontal overflow, no clipped buttons. |
| Small mobile closed drawer 360×640 | `DrawerClosed` | Drawer closed, stable panel relationship, no console errors, no horizontal overflow, no clipped buttons. |

Playwright DOM proof output:

```json
[
  { "id": "desktop", "width": 1440, "height": 900, "errors": 0, "bodyScrollWidth": 1440, "bodyClientWidth": 1440, "htmlScrollWidth": 1440, "htmlClientWidth": 1440, "clippedButtons": 0, "drawerOpen": null },
  { "id": "tablet", "width": 768, "height": 900, "errors": 0, "bodyScrollWidth": 768, "bodyClientWidth": 768, "htmlScrollWidth": 768, "htmlClientWidth": 768, "clippedButtons": 0, "drawerOpen": null },
  { "id": "mobile-landscape", "width": 844, "height": 390, "errors": 0, "bodyScrollWidth": 844, "bodyClientWidth": 844, "htmlScrollWidth": 844, "htmlClientWidth": 844, "clippedButtons": 0, "drawerOpen": "true" },
  { "id": "small-mobile", "width": 360, "height": 640, "errors": 0, "bodyScrollWidth": 360, "bodyClientWidth": 360, "htmlScrollWidth": 360, "htmlClientWidth": 360, "clippedButtons": 0, "drawerOpen": "true" },
  { "id": "drawer-closed", "width": 360, "height": 640, "errors": 0, "bodyScrollWidth": 360, "bodyClientWidth": 360, "htmlScrollWidth": 360, "htmlClientWidth": 360, "clippedButtons": 0, "drawerOpen": "false" }
]
```

## Screenshot evidence

- `docs/plans/reports/PLAN-0011/screenshots/terrain-responsive-matrix.png` — 1280×900.
- `docs/plans/reports/PLAN-0011/screenshots/terrain-mobile-drawer.png` — 844×390.
- `docs/plans/reports/PLAN-0011/screenshots/terrain-small-mobile-drawer.png` — 360×640.
- `docs/plans/reports/PLAN-0011/screenshots/terrain-drawer-closed.png` — 360×640.

## Command evidence

| Command | Result |
| --- | --- |
| `npm ci` | Failed because this repository has `pnpm-lock.yaml` but no `package-lock.json`; npm requires `package-lock.json` or `npm-shrinkwrap.json` for `ci`. |
| `corepack pnpm install --frozen-lockfile` | Passed; installed from existing `pnpm-lock.yaml`. |
| `npm run typecheck` | Passed. |
| `npm test` | Passed: 17 files, 48 tests. |
| `npm run build` | Passed. |
| `npm run build-storybook` | Passed. Storybook emitted the existing large chunk warning for manager/preview assets, not a build failure. |
| Playwright screenshots | Passed; generated four PNG evidence files. |
| Playwright DOM responsive check | Passed; zero console errors, zero clipped buttons, no horizontal overflow for tested targets. |

## Files changed

- `README.md`
- `docs/design/terrain-build-tooling.md`
- `src/GameHudActions.tsx`
- `src/GameSurfacePack.tsx`
- `src/GameTerrainBuildTools.tsx`
- `src/GameTerrainBuildTools.test.tsx`
- `src/index.ts`
- `src/stories/GameTerrainBuildTools.stories.tsx`
- `src/styles.css`
- `docs/plans/reports/PLAN-0011/screenshots/*.png`

## Decision

SwimmerUIKit terrain/build tools are now strong enough for OwnMySpace to consume directly for the next large-island editing pass. The kit provides official controls, mobile drawer behavior, compact tool captions, accessible icon-only fallback, terrain material paint swatches, build thumbnails, undo/redo controls, and responsive proof stories without importing OwnMySpace runtime or business logic.

## Remaining risks / follow-up

- This pass validates Storybook DOM surfaces and static component output; it does not validate OwnMySpace in-canvas placement around player/camera/movement HUD because OwnMySpace is explicitly out of scope.
- The `npm ci` command remains incompatible with this repo unless a `package-lock.json` is intentionally added. Current repository truth is pnpm via `packageManager` and `pnpm-lock.yaml`.
- Storybook still warns about large chunks from existing Storybook/axe/docs assets. This is not introduced as a functional failure here, but it can be tuned later if Storybook deploy size matters.
