# OwnMySpace Game Surface Pack

This pack adds official SwimmerUIKit components for game/editor DOM surfaces that sit around a host app's canvas or 3D runtime. The package owns visible UI shape, tokens, accessible labels, dense/mobile hooks, and action patterns. The host app still owns runtime state, scene rendering, persistence, asset manifests, providers, routing, and business rules.

## Components

### `GameShell` / `GameSceneHudLayout`

Slot-based shell for a game surface. It accepts `children` for the scene/canvas plus optional `hud`, `assetLibrary`, `sidePanel`, `movementPad`, `bottomBar`, and `overlay` slots. Use `density="dense"` and `layout="mobile"` when the host app already knows it is rendering a compact/mobile surface.

### `GameFactList` / `GameStatList`

Compact HUD/stat chips for facts such as object count, selected object, player position, status, or capacity. Items support optional official clay icons and badge tones.

### `GameMovementPad`

Accessible movement controls with official button styling, `aria-label`s, rendered keyboard shortcuts, and focusable keyboard handling for arrows/WASD. The component emits `onMove(direction)` and never imports host movement logic.

### `GameAssetLibrary` and `GameAssetCard`

Official asset library primitives for starter, generated, and imported assets. Cards expose `data-asset-source` and visible source/status badges so generated/imported/starter are distinguishable without host-specific styles. Selection is controlled through `selectedAssetId` and `onSelectAsset`.

### `GamePlacementToolbar` / `GameObjectToolbar`

Placement/object control surface for selected object, status, capacity, primary actions, and icon-only object actions. It reuses `GameFactList`, `GameProgress`, and `GameActionGrid`.

### `GameActionGrid`

Shared official action pattern. Actions are data objects with label, optional icon, tone, disabled, selected, shortcut, badge, and `onAction(id)`. The grid can render as full buttons or icon controls while keeping accessible labels.

## Example

```tsx
<GameShell
  title="Island editor"
  hud={<GameFactList label="Island facts" facts={[{ id: 'objects', label: 'Objects', value: '3/12' }]} />}
  movementPad={<GameMovementPad label="Move avatar" onMove={(direction) => moveAvatar(direction)} />}
  assetLibrary={(
    <GameAssetLibrary
      label="Placeable assets"
      title="Assets"
      selectedAssetId={selectedAssetId}
      onSelectAsset={selectAsset}
      groups={[
        { id: 'starter', label: 'Starter', source: 'starter', assets: starterAssets },
        { id: 'generated', label: 'Generated', source: 'generated', assets: generatedAssets },
        { id: 'imported', label: 'Imported', source: 'imported', assets: importedAssets },
      ]}
    />
  )}
  bottomBar={(
    <GamePlacementToolbar
      title="Placement"
      selectedTitle={selectedObjectName}
      statusValue={placementStatus}
      placedObjects={placedObjects.length}
      maxObjects={12}
      actions={[{ id: 'place', label: 'Place', icon: 'check', tone: 'primary', onAction: placeSelected }]}
      objectActions={[{ id: 'rotate', label: 'Rotate', icon: 'compass', shortcut: 'R', onAction: rotateSelected }]}
    />
  )}
>
  <Canvas />
</GameShell>
```

## Official distribution strategy

The official consumption path is the public npmjs package `@pieai/swimmer-ui-kit`, published by `.github/workflows/npm-publish.yml` through npm Trusted Publishing. Consuming apps should pin an exact version; no package-read token or scope-specific registry configuration is required.

Do not use committed tarballs as the long-term bridge. A host app may temporarily use a `.tgz` bridge only before a registry version is available, and should remove `vendor/packages/*.tgz` once the matching package version is published.

## Host app responsibilities

- Import `@pieai/swimmer-ui-kit/styles.css` once.
- Pass localized copy and callbacks through props.
- Keep scene/canvas runtime, R3F/Three.js, asset loading, persistence, and provider state in the host app.
- Keep generated/imported/starter asset data normalized before passing it into the UI kit.
- Do not re-skin these surfaces locally unless SwimmerUIKit has a documented gap.
