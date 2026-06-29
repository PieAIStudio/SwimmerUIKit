# @pieaistudio/swimmer-ui-kit

Self-contained clay game UI kit extracted from TuringPact into a standalone React 19 + TypeScript strict + Tailwind v4 package.

The approved distribution strategy is the package registry path declared by this repository: `@pieaistudio/swimmer-ui-kit` published to GitHub Packages through `.github/workflows/publish.yml` and `publishConfig.registry`. Consuming apps should depend on the registry package version and should not keep committed `.tgz` package artifacts long term.

## Install shape

The package expects React and Tailwind to be provided by the host app:

```json
{
  "peerDependencies": {
    "@tailwindcss/vite": ">=4.0.0",
    "react": ">=19.0.0",
    "react-dom": ">=19.0.0",
    "tailwindcss": ">=4.0.0"
  }
}
```

Import the package CSS once in the host app shell:

```ts
import '@pieaistudio/swimmer-ui-kit/styles.css';
```

The same CSS file includes the Tailwind v4 `@theme inline` bridge and the `:root` CSS variables.

## Exports

### Components

- `GameButton`
- `GameDialog`
- `GameHistoryPanel`
- `GameHudActions`
- `GameIconButton`
- `GamePanel`
- `GamePrompt`
- `GameRadialMenu`
- `GameSegmentedControl`
- `GameSlider`
- `GameTabs`
- `GameToast`
- `GameToggle`
- `GameTooltip`
- `GameAssetIcon`
- `GameBadge`
- `GameCardFan`
- `GameHud`
- `GameLanguageMenu`
- `GameLoadingState`
- `GameOrientationGate`
- `GameStageTile`
- `FirstSessionHud`
- `FirstSessionOnboarding`
- `GameUiPreview`
- `GameShell`
- `GameSceneHudLayout`
- `GameFactList`
- `GameStatList`
- `GameMovementPad`
- `GameAssetLibrary`
- `GameAssetCard`
- `GamePlacementToolbar`
- `GameObjectToolbar`
- `GameActionGrid`
- `GameTerrainBuildToolbox`
- `GameTerrainModeControl`
- `GameTerrainToolStrip`
- `GameBrushControls`
- `GameMaterialSwatches`
- `GameUndoRedoActions`
- `GameBuildLibrary`
- `GameCompactGameDrawer`

### Tokens and assets

- `CLAY_COLOR_TOKENS`
- `CLAY_SEMANTIC_TOKENS`
- `CLAY_TYPE_TOKENS`
- `CLAY_SPACE_TOKENS`
- `CLAY_RADIUS_TOKENS`
- `CLAY_ELEVATION_TOKENS`
- `CLAY_MOTION_TOKENS`
- `CLAY_LAYER_TOKENS`
- `CLAY_TARGET_TOKENS`
- `CLAY_ASSET_SIZE_TOKENS` including terrain/build sizing entries for swatches, tool hit targets, brush numeric width, and build rail cards
- `CLAY_UI_TOKENS`
- `GAME_UI_TOKENS`
- `GAME_UI_TARGETS`
- `CLAY_ASSETS`
- `CLAY_ASSET_BASE_PATH`
- `getClayIconPath`
- `getClaySourceAssetPath`
- `getClayCatalogPaths`

### Audio helper

- `playGameInteractionSound`
- `playGameInteractionSoundForContext`

`GameButton` no longer reads any TuringPact store. Use the `sound` prop to opt into button SFX:

```tsx
<GameButton sound={{ enabled: true, masterVolume: 0.8, sfxVolume: 0.6 }}>
  Open my own table
</GameButton>
```

## Official package distribution

SwimmerUIKit is scoped as `@pieaistudio/swimmer-ui-kit` and is configured for GitHub Packages. The release workflow builds and publishes the package on `v*` tags or manual dispatch.

Consuming apps should use a registry dependency:

```json
{
  "dependencies": {
    "@pieaistudio/swimmer-ui-kit": "0.6.0"
  }
}
```

For GitHub Packages, add only the scope registry to the consuming app or CI environment:

```ini
@pieaistudio:registry=https://npm.pkg.github.com
```

Authentication should come from the host environment, such as `NODE_AUTH_TOKEN` or the platform's package-read secret. Do not commit tokens. Do not keep `vendor/packages/*.tgz` or `file:vendor/packages/...tgz` as the normal integration path; a tarball may be used only as a short emergency bridge before a registry package is available.

## CSS variable tokens

Tokens are available in TypeScript and as CSS variables. The CSS variables are the cross-stack contract and can be consumed outside React:

```css
.my-game-panel {
  background: var(--game-ui-panel);
  color: var(--game-ui-text);
  border-radius: var(--game-ui-radius-panel);
  box-shadow: var(--game-ui-shadow-panel);
}
```

The TypeScript token exports intentionally point to CSS variables for semantic, typography, spacing, radius, elevation, motion, layer, and asset-size values:

```ts
import { CLAY_UI_TOKENS, GAME_UI_TARGETS } from '@pieaistudio/swimmer-ui-kit';

console.log(CLAY_UI_TOKENS.semantic.surface); // var(--game-ui-surface)
console.log(GAME_UI_TARGETS.mobileLandscapeProofWidthPx); // 844
```

## OwnMySpace game surface pack example

The game surface pack gives host apps official UI primitives for visible game DOM while keeping runtime scene/canvas code inside the host app:

```tsx
import {
  GameAssetLibrary,
  GameFactList,
  GameMovementPad,
  GamePlacementToolbar,
  GameShell,
} from '@pieaistudio/swimmer-ui-kit';
import '@pieaistudio/swimmer-ui-kit/styles.css';

export function IslandSurface() {
  return (
    <GameShell
      title="Island editor"
      hud={<GameFactList label="Island facts" facts={[{ id: 'objects', label: 'Objects', value: '3/12' }]} />}
      movementPad={<GameMovementPad label="Move avatar" />}
      assetLibrary={(
        <GameAssetLibrary
          label="Placeable assets"
          title="Assets"
          selectedAssetId="manual-chair"
          groups={[
            { id: 'starter', label: 'Starter', source: 'starter', assets: [{ assetId: 'starter-table', source: 'starter', title: 'Starter table' }] },
            { id: 'generated', label: 'Generated', source: 'generated', assets: [{ assetId: 'gen-lamp', source: 'generated', title: 'Generated lamp', status: 'ready' }] },
            { id: 'imported', label: 'Imported', source: 'imported', assets: [{ assetId: 'manual-chair', source: 'imported', title: 'Manual chair', status: 'selected' }] },
          ]}
        />
      )}
      bottomBar={(
        <GamePlacementToolbar
          title="Placement"
          selectedTitle="Manual chair"
          placedObjects={3}
          maxObjects={12}
          statusValue="Ready"
          actions={[{ id: 'place', label: 'Place', icon: 'check', tone: 'primary' }]}
          objectActions={[{ id: 'rotate', label: 'Rotate', icon: 'compass', shortcut: 'R' }]}
        />
      )}
    >
      <canvas aria-label="3D island scene" />
    </GameShell>
  );
}
```

The package intentionally accepts data and callbacks through props. It does not import OwnMySpace runtime stores, R3F scene code, asset manifests, providers, or persistence APIs.

## Terrain/build tooling example

`GameTerrainBuildToolbox` gives games official terrain and construction controls without owning terrain truth, schema, commands, or persistence. Host apps pass mode/tool/material/build state and receive callbacks:

```tsx
import { GameTerrainBuildToolbox } from '@pieaistudio/swimmer-ui-kit';

<GameTerrainBuildToolbox
  activeBuildCategoryId="foundation"
  activeMaterialId="grass"
  activeModeId="terrain"
  activeToolId="raise"
  brush={{ radius: 2.75, strength: 0.45 }}
  buildCategories={[{ id: 'foundation', label: 'Foundation', items: [{ id: 'floor-2x2', label: '2x2 floor' }] }]}
  label="Terrain and build tools"
  materials={[{ id: 'grass', label: 'Grass', color: '#4f9d6b' }]}
  modes={[{ id: 'terrain', label: 'Terrain' }, { id: 'build', label: 'Build' }]}
  onBrushRadiusChange={(radius) => terrainEditor.setRadius(radius)}
  onModeChange={(mode) => terrainEditor.setMode(mode)}
  onToolChange={(tool) => terrainEditor.setTool(tool)}
  title="Island tools"
  tools={[{ id: 'raise', label: 'Raise' }, { id: 'flatten', label: 'Flatten' }]}
  undoRedo={{ canUndo: true, canRedo: false }}
/>
```

Use `variant="mobile"` or `variant="small-mobile"` to render the official compact drawer/tool strip. The consuming game still owns where that drawer is placed relative to canvas, movement controls, and other HUD slots.

## Local preview

Run the preview page:

```bash
npm install
npm run dev
```

The preview renders:

- token color swatches and token ledgers
- typography scale
- buttons, badges, tabs, segmented control, slider, toggle, radial menu, tooltip
- HUD, stage tiles, table proof frame, prompt/dialog, toast/loading/error
- card fan and asset path references
- history panel
- first-session HUD/onboarding shell
- OwnMySpace surface pack and terrain/build tooling previews
- orientation gate
- responsive proof targets for desktop and mobile landscape

## Integration into TuringPact TODO

This extraction pass does not modify TuringPact. A future TuringPact integration should do the following in TuringPact only after package adoption is reviewed:

1. Add `@pieaistudio/swimmer-ui-kit` as a workspace/package dependency.
2. Import `@pieaistudio/swimmer-ui-kit/styles.css` once in the TuringPact app shell or style entry.
3. Replace imports from `src/features/game-ui` with imports from `@pieaistudio/swimmer-ui-kit`.
4. Replace `GameButton` settings-store coupling with `sound` props derived from TuringPact settings state.
5. Pass localized copy into `FirstSessionHud`, `FirstSessionOnboarding`, and any preview/demo surfaces through props instead of relying on the package to call TuringPact i18n.
6. Decide whether TuringPact continues serving `/assets/game/ui/clay/...` source assets or relies on the package inline icon fallback. If source assets are required, keep or copy `public/assets/game/ui` according to the host app asset strategy.
7. Remove TuringPact `src/features/game-ui` only after all imports are replaced and local regression passes.
8. Remove or stop importing TuringPact `src/styles/game-ui-clay.css` only after `@pieaistudio/swimmer-ui-kit/styles.css` covers the adopted surfaces.
9. Keep `src/styles/theme.css` host app theme decisions separate from the kit unless the host app intentionally delegates those tokens to the kit.
10. Re-run TuringPact H1 core flow, first-session, desktop, and mobile-landscape visual evidence after the integration.

## Local validation from this extraction pass

- `npm run typecheck`: passed
- `npm run build`: passed and emitted `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, and `dist/styles.css`
- `npm test`: passed with 2 token tests
- Preview evidence was captured under `.devspace-visual/`
