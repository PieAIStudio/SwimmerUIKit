---
id: PLAN-DOCS-PLANS-REPORTS-PLAN-0002-OWNMYSPACE-UI-READINESS-AUDIT
title: "PLAN-0002 Block V — OwnMySpace UI Readiness Audit"
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
# PLAN-0002 Block V — OwnMySpace UI Readiness Audit

## Summary

This is a readiness audit for replacing OwnMySpace runtime UI with the current official `@pieaistudio/swimmer-ui-kit` package. It is intentionally report-only: no OwnMySpace runtime files were edited, and no SwimmerUIKit `src/**`, package, lockfile, cloud, deployment, secret, billing, schema, or RPC files were changed.

**Decision:** full OwnMySpace official UI replacement should **not** proceed yet.

SwimmerUIKit `0.5.0` has enough stable primitives to start a replacement spike for buttons, panels, badges, loading status, HUD facts, and some asset-card-like rows. However, OwnMySpace currently needs several first-class game UI surfaces that are not official SwimmerUIKit components yet: a docked game HUD/layout primitive, movement/D-pad controls, asset library source rail + grouped placement-ready asset cards, a placement/object editing toolbar, dense mobile variants, and a more explicit icon/action pattern for object editing.

The recommended next step is to upgrade SwimmerUIKit first, then replace OwnMySpace UI from those official components. Do not compensate by inventing OwnMySpace-local components for the missing surfaces if the goal is a full official UI replacement.

## Scope and source evidence

### SwimmerUIKit evidence read

- `README.md`
- `package.json`
- `src/index.ts`
- `src/GameButton.tsx`
- `src/GameSurfaces.tsx`
- `src/ClayComponents.tsx`
- `src/GameDisplay.tsx`
- `src/GameForms.tsx`
- `src/GameHudActions.tsx`
- `src/styles.css` as supporting CSS evidence for responsive/dense behavior and implemented class contracts

### OwnMySpace evidence read

- `src/App.tsx`
- `src/ui/AssetLibraryPanel.tsx`
- `src/ui/PlacementToolbar.tsx`
- `src/ui/placement-state.ts`
- `src/styles.css`
- `src/assets/placeable-asset-catalog.ts` was not directly opened because the DevSpace read call was blocked, but read-only `rg` evidence confirmed the exported source order, source types, labels, and mapping fields used by `AssetLibraryPanel`.

### Loop ledger

| Round | Fresh evidence | Scoped audit/update | Decision |
| --- | --- | --- | --- |
| 1 | SwimmerUIKit README, package, exports, and component source | Identify official component inventory and package status | Iterate: need OwnMySpace UI inventory |
| 2 | OwnMySpace App, UI components, placement state, styles | Build surface inventory and initial component mapping | Iterate: write report and verify |
| 3 | Report file created in allowed docs path | Run required checks and update verification section | Pending until checks complete |

## OwnMySpace UI surface inventory

### 1. HUD facts

OwnMySpace renders a right-side HUD panel inside `.hud-panel`. It includes:

- Header copy: `Private Island 01` eyebrow and the app headline.
- Movement state facts in `.island-facts`:
  - position as `x, z`, aria-live polite;
  - boundary state: `Edge reached` or `Inside island`;
  - object count.
- Placement-specific facts inside `PlacementToolbar`:
  - object count as `current/max`;
  - selected object id or `None`;
  - placement status.

These are compact definition-list rows, not only decorative badges. They require stable label/value/meta handling, numeric alignment, and live status support.

### 2. Movement controls

OwnMySpace currently has a four-button walking control pad:

- Buttons: forward, left, backward, right.
- Visual layout: custom grid using arrow positions, not a linear toolbar.
- Input behavior:
  - click nudges direction;
  - pointer down/up/leave/cancel maintains active movement state;
  - keyboard WASD/arrow support lives in `App.tsx`, separate from the visual pad.

This surface needs a real game movement control primitive, not just four generic icon buttons.

### 3. Asset library chips/groups/cards

`AssetLibraryPanel` renders:

- Panel heading with eyebrow and title.
- Source count rail using chips: starter/generated/imported style source summaries.
- Grouped sections by source, each with its own heading.
- Placement-ready asset grid.
- Selectable asset cards with:
  - `aria-pressed` selected state;
  - source-specific data attributes;
  - thumb/icon slot currently implemented as text glyph fallback;
  - title and meta text;
  - scrollable max-height desktop behavior and responsive two-column/one-column behavior.

This is more specialized than a generic `GameStageTile` because it needs source grouping, compact cards, selected asset state, and asset metadata density.

### 4. Placement toolbar

`PlacementToolbar` renders:

- Panel heading tied to the currently selected asset title.
- Island state facts: object count, selected object, status.
- Object editing action grid:
  - place;
  - move west/east;
  - rotate;
  - delete;
  - save;
  - reload;
  - reset.
- Per-action disabled states and labels/titles.
- Object budget behavior through `canPlace`, `objectCount`, and `maxObjectCount`.

The toolbar is an object-editing command surface. It needs a dense action grid, icon+label convention, disabled state styling, and state summary integration.

### 5. Loading state

OwnMySpace has `SceneLoadingFallback`, a full scene-panel fallback with `role="status"` and `Loading island…` text. It is centered in the scene canvas area and inherits the app’s sky background.

This can be represented by SwimmerUIKit loading primitives, but the scene-panel placement and full-panel sizing are layout concerns.

### 6. Status/badges

OwnMySpace status needs include:

- Asset source chips: starter/generated/imported, with source-specific styling.
- Placement status: `Ready`, `Placed`, `Moved`, `Rotated`, `Deleted`, `Saved`, `Reloaded`, `At budget`.
- Boundary status: `Edge reached` vs `Inside island`.
- Selected asset/object state through `aria-pressed` and selected object label.
- Disabled action states, especially placement budget and selected-object-dependent commands.

Existing statuses are mostly text/fact rows and chips. A full official replacement should standardize tones and source semantics.

### 7. Mobile responsive needs

OwnMySpace current responsive behavior is explicit:

- Desktop: two-column shell, scene on left and HUD on right, `minmax(320px, 410px)` HUD width.
- Under `920px`: single-column shell, scene above HUD, asset grid becomes two columns, toolbar actions become two columns, asset group max-height removed.
- Under `520px`: tighter padding/gaps, scene min-height lowered, asset grid and toolbar actions become one column.
- The HUD panel is scrollable on desktop via `max-height: calc(100vh - 32px)` and non-scroll-clamped on mobile.

SwimmerUIKit has mobile-landscape proof CSS and first-session shell behavior, but it does not expose a general OwnMySpace-style responsive game shell primitive with scene region + HUD sidecar + mobile collapse rules.

## SwimmerUIKit mapping

| OwnMySpace surface | Can use directly | Can compose from official components | Gap / caveat |
| --- | --- | --- | --- |
| App-level scene + HUD two-column shell | None | `GamePanel` for panel surfaces, `GameHud` for HUD chips, tokens from `CLAY_UI_TOKENS` / `GAME_UI_TARGETS` | Missing general game HUD layout primitive for scene + sidecar + mobile collapse. Existing `.game-ui-stage-demo` and first-session shell are preview/demo oriented, not exported layout contracts. |
| HUD heading | None | `GamePanel` title or plain host heading styled with tokens | Missing heading/eyebrow primitive. `GamePanel` only supports optional `title` and no eyebrow/subtitle/header actions. |
| HUD facts: position, boundary, object count | `GameHud` partially | `GameHud` items can represent label/value/meta chips; `GameBadge` can represent boundary/status tone | `GameHud` is horizontal chip HUD; OwnMySpace needs compact definition-list rows inside side panel and live value semantics. Missing `GameFactList` / `GameStatList` style primitive. |
| Movement controls / D-pad | None | `GameIconButton` or `GameButton` can render individual buttons | Missing movement pad primitive with directional layout, hold-to-move pointer lifecycle, pressed/active state, disabled state, and optional keyboard hint copy. |
| Asset source rail | `GameBadge` partially | `GameBadge tone="neutral"/"ai"` can approximate source chips | Missing source-aware chip group with counts and source-specific tones for starter/generated/imported. |
| Asset groups | None | `GamePanel` + custom headings + `GameStageTile`-like buttons | Missing grouped asset library primitive with `source`, group headings, empty-group omission, scroll density, and source ordering. |
| Asset cards | `GameStageTile` partially; `GameAssetIcon` if icon names map | `GameStageTile` can supply selected button/card with icon, kicker/title/summary/badge | `GameStageTile` is too large and semantically stage-oriented. Missing compact selectable asset card with thumb slot, meta, source tone, selected state, and dense grid variant. |
| Placement toolbar facts | `GameHud` partially; `GameBadge` partially | `GamePanel` + `GameHud`/`GameBadge` can show object count, selected object, status | Same fact-list gap; status tone mapping is not official for placement states. |
| Placement toolbar actions | `GameButton`, `GameIconButton`, `GameHudActions` partially | Compose action grid from `GameButton`/`GameIconButton` inside `GameHudActions` or `GamePanel` | Missing dense object-editing toolbar primitive and icon/action convention for place/move/rotate/delete/save/reload/reset. `GameHudActions` is a nav wrapper, not an action grid. |
| Loading state | `GameLoadingState` | Wrap `GameLoadingState label="Loading island…"` in scene-panel container | Direct component exists, but full-scene/fill variant is missing. Current `GameLoadingState` is inline-flex, not full panel. |
| Error/blocked status | `GameLoadingState tone="error"`, `GameToast tone="danger"`, `GameBadge tone="danger"` | Use based on location: inline status, toast, badge | OwnMySpace does not yet have a dedicated error surface, but generated/blocked status will likely need source/job-aware statuses. |
| Mobile orientation and responsive proof | `GameOrientationGate` for portrait phone-like warning | Use `GAME_UI_TARGETS` and tokens as references | Existing orientation gate is landscape-only, more TuringPact/first-session oriented. OwnMySpace currently supports portrait/small width responsive stacking, not a hard landscape gate. |
| Form controls | Not used currently | `GameInput`, `GameTextArea`, `GameField`, `GameCheckbox` available for future prompts or naming flows | Not a blocker for current replacement. |
| Empty/no assets state | `GameEmptyState` | Use when asset list is empty | Asset library currently omits empty groups but has no all-empty UI. `GameEmptyState` is usable if needed. |

## Directly usable official components

These are stable enough to use immediately in a replacement plan:

- `GameButton`: primary/secondary/ghost/danger/success actions, disabled state through native button props, optional sound.
- `GameIconButton`: individual icon-like actions with accessible label.
- `GamePanel`: basic panel wrapper for HUD sections, movement panel, asset library, placement toolbar.
- `GameBadge`: neutral/success/warning/danger/ai status chips.
- `GameLoadingState`: loading/error inline state.
- `GameToast`: transient status if OwnMySpace later adds toast feedback.
- `GameHud`: partial fit for top-level HUD chips when a chip cluster layout is acceptable.
- `GameAssetIcon`: usable only when OwnMySpace assets can map to `ClayIconName`; current OwnMySpace asset IDs are not guaranteed to map one-to-one.
- `GameEmptyState`: usable for empty asset library or unavailable generated assets.
- Tokens and CSS variables: useful for aligning colors, spacing, radii, shadows, typography, and safe-area targets.

## Composable but not sufficient alone

These can support the replacement, but using only these would leave OwnMySpace-specific behavior scattered in the app:

- **HUD facts:** `GamePanel` + `GameHud` + `GameBadge` can approximate facts, but OwnMySpace needs a compact fact list/stat row primitive.
- **Movement controls:** four `GameIconButton`s can approximate arrows, but pointer hold/nudge behavior and D-pad layout would remain OwnMySpace-local.
- **Asset library:** `GamePanel` + `GameBadge` + `GameStageTile` can approximate the library, but card density, source grouping, selected state, and thumb fallback need a first-class kit component.
- **Placement toolbar:** `GamePanel` + `GameButton` + `GameIconButton` + `GameHudActions` can render controls, but no official object editing toolbar contract exists.
- **Mobile responsive shell:** CSS tokens and proof targets help, but no exported layout primitive captures the current scene/HUD stacking rules.

## Gaps

### Missing components

1. `GameShell` / `GameSceneHudLayout`
   - Needs scene region, HUD sidecar, desktop two-column layout, mobile stack, scroll policy, safe-area support, and optional fill-scene loading slot.

2. `GameFactList` / `GameStatList`
   - Needs compact label/value/meta rows, live value support, numeric alignment, optional tone/status, and dense mode.

3. `GameMovementPad`
   - Needs directional layout, accessible labels, hold-to-move callbacks (`onDirectionStart`, `onDirectionEnd`, `onDirectionNudge`), active direction state, optional keyboard hint, and mobile-friendly hit targets.

4. `GameAssetLibrary`
   - Needs source summary rail, grouped sections, source order, selectable cards, selected state, empty state, scroll policy, and dense/mobile variants.

5. `GameAssetCard`
   - Needs compact thumbnail/icon slot, title/meta, source tone, selected state via `aria-pressed`, optional badge, and grid-friendly sizing.

6. `GamePlacementToolbar` / `GameObjectToolbar`
   - Needs object count/budget, selected object summary, placement status, action model, dense action grid, disabled states, and standardized object-edit icons.

7. `GameActionGrid`
   - A lower-level primitive could support placement toolbar and future HUD action groups: responsive columns, icon+label pattern, disabled state, danger/primary emphasis.

### Missing props/state in existing components

- `GamePanel` lacks `eyebrow`, `description`, `actions`, `as`, density, and scroll/body slots.
- `GameHud` lacks orientation/density props and is optimized for horizontal chip clusters rather than side-panel rows.
- `GameBadge` lacks domain-specific tones for `starter`, `generated`, `imported`, `selected`, `budget`, and `boundary`.
- `GameStageTile` lacks compact/card density and is semantically named for stage selection, not asset selection.
- `GameIconButton` lacks built-in tone/variant matching `GameButton` and no icon size/density convention beyond children.
- `GameLoadingState` lacks `block`/`fill`/`panel` variant for scene fallback use.
- `GameHudActions` lacks layout props such as `columns`, `density`, `wrap`, `placement`, and action item modeling.

### Missing dense/mobile variants

- Asset cards need desktop dense list/grid, tablet two-column, phone one-column.
- Placement toolbar needs 4-column desktop, 2-column tablet, 1-column phone, with exact disabled-state styling.
- HUD facts need compact side-panel density and larger touch targets on mobile.
- Movement controls need touch-sized buttons while remaining visually compact inside the HUD.
- Existing SwimmerUIKit CSS includes mobile-landscape and first-session rules, but not a generic `compact`, `dense`, or `mobileStack` API on components.

### Missing game HUD layout primitive

OwnMySpace needs a reusable official layout layer for:

- canvas/scene panel;
- HUD sidecar;
- scrollable right panel on desktop;
- stacked mobile layout;
- safe area support;
- optional bottom/overlay controls in later phases.

Current SwimmerUIKit has `GameHud`, `GameHudActions`, demo stage CSS, and `FirstSessionHud`, but none is a general-purpose exported layout primitive for OwnMySpace full UI replacement.

### Missing icon/action pattern

OwnMySpace actions currently use text and glyph arrows:

- walk arrows: `↑`, `←`, `↓`, `→`;
- move west/east: `←`, `→`;
- rotate: `↻`;
- named actions: Place, Delete, Save, Reload, Reset.

A full official replacement needs an action pattern that defines:

- icon slot and label slot;
- accessible label rules;
- directional action naming;
- action tone (`primary`, `secondary`, `danger`, `ghost`, possibly `utility`);
- disabled reason/title handling;
- dense/mobile sizing.

## Recommendation

### Can full replacement proceed now?

**No.**

A partial replacement can proceed using primitives, but that would leave too much OwnMySpace-local UI composition and behavior. Because the stated target is full official UI replacement, the official kit should first add the missing OwnMySpace-grade game UI surfaces.

### Exact SwimmerUIKit upgrades needed before full replacement

1. Add a general scene/HUD layout primitive:
   - proposed export: `GameSceneHudLayout` or `GameShell`;
   - props for `scene`, `hud`, optional `loading`, responsive mode, and safe-area policy.

2. Add compact fact/stat rows:
   - proposed export: `GameFactList` with `items: { id, label, value, meta?, tone?, live? }[]`;
   - support side-panel density and aria-live value slots.

3. Add movement pad:
   - proposed export: `GameMovementPad`;
   - callbacks for nudge and hold lifecycle;
   - accessible directional labels;
   - active state and disabled state.

4. Add asset library primitives:
   - proposed exports: `GameAssetLibrary`, `GameAssetSourceRail`, `GameAssetCard`;
   - support source summaries, grouped assets, selected asset, thumb/icon slot, source tones, empty state, and dense/mobile variants.

5. Add placement/object toolbar primitives:
   - proposed exports: `GamePlacementToolbar` or `GameObjectToolbar`, plus lower-level `GameActionGrid` if useful;
   - support object count/budget, selected object label, status, and standard actions for place/move/rotate/delete/save/reload/reset.

6. Extend existing components rather than forcing host-specific class names:
   - `GamePanel`: `eyebrow`, `description`, `actions`, `density`, `scroll`.
   - `GameIconButton`: `variant`/`tone`, `size`, `pressed`, `disabledReason`.
   - `GameBadge`: domain source/status tones or a safe extension mechanism.
   - `GameLoadingState`: `variant="inline|panel|fill"`.

7. Define official icon/action names for OwnMySpace object editing:
   - movement directions;
   - place;
   - rotate;
   - delete;
   - save;
   - reload;
   - reset;
   - starter/generated/imported asset source indicators.

### Exact component map after those upgrades

If the upgrades above exist, the intended replacement map should be:

| OwnMySpace current surface | Future official component |
| --- | --- |
| `.app-shell` | `GameSceneHudLayout` / `GameShell` |
| `.scene-panel` loading fallback | `GameSceneHudLayout` scene slot + `GameLoadingState variant="fill"` |
| `.hud-panel` | `GameSceneHudLayout` hud slot |
| `.hud-heading` | `GamePanel` header props or `GameSectionHeader` if added |
| movement state `.island-facts` | `GameFactList` |
| `.movement-pad` | `GameMovementPad` |
| `AssetLibraryPanel` | `GameAssetLibrary` composed from `GameAssetSourceRail` + `GameAssetCard` |
| `PlacementToolbar` facts | `GameFactList` inside `GamePlacementToolbar` |
| `PlacementToolbar` action grid | `GamePlacementToolbar` or `GameActionGrid` |
| source/status chips | `GameBadge` with official source/status tones |
| generic buttons | `GameButton` / `GameIconButton` |

## Stop-list results

- No SwimmerUIKit `src/**` modification was required or performed.
- No OwnMySpace modification was required or performed.
- Official UI gaps were recorded as SwimmerUIKit upgrade recommendations only.
- No OwnMySpace-local replacement components were recommended as the solution for missing official surfaces.

## Verification

Initial verification in the managed worktree failed before dependency install because `node_modules` was absent: `npm run typecheck` could not resolve React/Storybook/Vitest types, `npm test` could not find `vitest`, and `npm run build` could not find `vite`. The worktree contained `package-lock.json`, so `npm ci` was run to install the locked dependencies without editing `package.json` or the lockfile.

Final verification after `npm ci`:

```bash
npm run typecheck
# passed: tsc -p tsconfig.build.json --noEmit

npm test
# passed: 15 test files, 35 tests
# note: Storybook printed "No story files found" for src/**/*.mdx and anonymous telemetry info, but Vitest exited successfully.

npm run build
# passed: vite build and tsc -p tsconfig.build.json
# emitted dist/styles.css, dist/index.js, dist/index.cjs

git diff --check HEAD
# passed: no whitespace errors

git status --short --branch
# ## codex/ownmyspace-ui-readiness-audit
# ?? docs/
```

## Feedback-loop contract

- **Goal:** judge whether current stable `@pieaistudio/swimmer-ui-kit` can support OwnMySpace full official UI replacement.
- **Success criteria:** report includes OwnMySpace surface inventory, mapping to official components, gaps, recommendation, and verification output; only the allowed report path is edited.
- **Evidence inspected:** source files and command outputs listed above. Visual evidence was not applicable because this task is a source/API readiness audit, not a rendered UI regression check.
- **Files created under `.devspace-visual/`:** none.
- **Original project output:** `docs/plans/reports/PLAN-0002/ownmyspace-ui-readiness-audit.md`.
- **Observed facts:** SwimmerUIKit exposes generic clay game primitives and first-session/demo surfaces; OwnMySpace currently has specialized movement, asset library, placement toolbar, HUD fact rows, and responsive scene/HUD layout requirements.
- **Inferences/issues:** full replacement would currently require host-local composition for missing surfaces, which violates the goal of full official UI replacement.
- **Unknowns/limitations:** no rendered Playwright capture was taken because the task explicitly requested audit/report and did not ask to validate runtime visuals. The package publication state was judged from local package metadata and README only.
- **Decision:** final.
- **Next minimal action:** none for this audit; SwimmerUIKit upgrade work should be separately authorized before any official UI replacement implementation.
- **Scope guard:** report-only edit in SwimmerUIKit docs path; no OwnMySpace edits; no SwimmerUIKit `src/**`, `package.json`, lockfile, cloud, deploy, secret, billing, schema, or RPC edits. `npm ci` created ignored dependency files only so verification could run against the lockfile.
