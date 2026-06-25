# @pieaistudio/swimmer-ui-kit

Self-contained clay game UI kit extracted from TuringPact into a standalone React 19 + TypeScript strict + Tailwind v4 package.

This package is currently validated for local build and local preview evidence only. It is not published from this repository in this extraction pass.

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
- `CLAY_ASSET_SIZE_TOKENS`
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
8. Remove or stop importing TuringPact `src/styles/game-ui-clay.css` only after `@pieai/swimmer-ui-kit/styles.css` covers the adopted surfaces.
9. Keep `src/styles/theme.css` host app theme decisions separate from the kit unless the host app intentionally delegates those tokens to the kit.
10. Re-run TuringPact H1 core flow, first-session, desktop, and mobile-landscape visual evidence after the integration.

## Local validation from this extraction pass

- `npm run typecheck`: passed
- `npm run build`: passed and emitted `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, and `dist/styles.css`
- `npm test`: passed with 2 token tests
- Preview evidence was captured under `.devspace-visual/`
