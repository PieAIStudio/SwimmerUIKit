# @pieai/swimmer-ui-kit

Self-contained clay game UI kit for PieAI web, game, and wrapped
(mobile/desktop WebView) surfaces. React 19 + TypeScript strict.
**Zero runtime dependencies, 100% standard CSS** — consumers need no
Tailwind, no PostCSS, no CSS processor of any kind.

Source is publicly readable. Use is governed by the
[PieAI Limited Use License](./LICENSE), not an open-source license. The visual
assets may not be extracted, modified, or redistributed as a standalone pack.

- Design system truth (tokens, theming, motion, a11y):
  `docs/reference/design-system-guide.md`
- Consumer onboarding / upgrade SOP / release checklist:
  `docs/reference/usage-and-upgrade-playbook.md`
- Live catalog: `pnpm dev` (preview page) and `pnpm storybook`

## Install

```json
{
  "dependencies": {
    "@pieai/swimmer-ui-kit": "2.1.0"
  }
}
```

Peer dependencies: `react >=19` and `react-dom >=19` — nothing else.
Pin the exact version (no `^`) — upgrades are explicit, reviewed actions.
The package is ESM-only and published publicly on npmjs. It uses the default
npm registry, so consumers need no scope-specific `.npmrc` and no package-read
token.

Import the stylesheet once in the app shell:

```ts
import '@pieai/swimmer-ui-kit/styles.css';
```

**Optional** — only if the host app uses Tailwind v4 and wants Tailwind
theme names (`bg-primary`, `text-foreground`, `rounded-md`…) to resolve to
kit tokens, additionally import the bridge (requires the host's Tailwind
build; never import it without Tailwind):

```ts
import '@pieai/swimmer-ui-kit/tailwind.css';
```

## What's inside

- **~60 components** across: core controls (`GameButton`,
  `LiquidMetalButton`, `GameTabs`,
  `GameSlider`, `GameToggle`, `GameForms` inputs…), panels and windows
  (`GamePanel`, `GameCollapsiblePanel`, `GameWindowPanel`, `GameModal` on
  native `<dialog>`), HUD/shell surfaces (`GameShell`, `GameHud`,
  `GameSceneHudLayout`, `GameMovementPad`…), the OwnMySpace surface pack,
  terrain/build tooling (`GameTerrainBuildToolbox`…), and the AI
  contractor queue (`GameContractorPanel`…). `src/index.ts` is the
  authoritative export list; Storybook is the visual catalog.
- **Design tokens** as CSS variables (`--game-ui-*`) with TypeScript
  mirrors (`CLAY_*_TOKENS`, `GAME_UI_TOKENS`). The CSS variables are the
  cross-stack contract and work outside React:

  ```css
  .my-game-panel {
    background: var(--game-ui-panel);
    color: var(--game-ui-text);
    border-radius: var(--game-ui-radius-panel);
  }
  ```

  Product-owned overflow containers can opt into the kit's cross-browser clay
  scrollbar treatment with `class="game-ui-scroll-surface"`; tune its size,
  track, thumb, and hover colors through the `--game-ui-scrollbar-*` tokens.

- **Type**: a HUD scale (`--game-ui-font-xs` … `-xxl`) plus the three things a
  HUD scale does not cover — `--game-ui-font-mono` for code, and
  `--game-ui-font-reading` / `--game-ui-line-reading` /
  `--game-ui-measure-reading` for a screen someone reads for minutes rather
  than glances at. Reach for the reading trio whenever the text is prose, not
  a label.
- **Official themes**: light (default) and `night`
  (`<html data-game-ui-theme="night">`). Downstream theming = overriding
  semantic tokens; see the design system guide.
- **`swimmer-ui-check`**: lints your CSS for raw colour literals in component
  rules *and* for token pairs that cannot be read. Two tokens are not
  automatically safe together — `--game-ui-accent-ink` is accent-COLOURED ink
  for a surface, `--game-ui-accent-contrast` is the ink meant to sit **on**
  `--game-ui-accent`. Pairing the first with the accent measures 1.48:1.

  ```bash
  npx swimmer-ui-check src
  ```

- **Clay assets**: two lines of setup, and **skipping them is not a no-op**.
  Out of the box the kit draws *placeholders* — one rounded square per icon
  with a letter in it — not the icon set. They exist so a fresh install
  renders something instead of a broken image, and they are not shippable.
  The real sculpted PNGs travel inside the package and need serving:

  ```bash
  npx swimmer-ui-assets public      # copies dist/assets into your static root
  ```
  ```ts
  import { setClayAssetMode } from '@pieai/swimmer-ui-kit';
  setClayAssetMode('source');       // once, at your entry
  ```

  Serving them somewhere else — a CDN, a sub-path deploy — is
  `setClayAssetBasePath('/my/path')`, and `swimmer-ui-assets public --base=/my/path`
  mirrors the layout to match. If you *want* placeholders, say so with
  `acknowledgeClayPlaceholders()` and the console notice goes quiet.

  Note on sizing: the sculpted family is 96px art. Below roughly 24px it turns
  to mud, and being PNG it cannot take a `currentColor` tint, so it is the
  wrong family for a dense navigation rail or toolbar. Use the `line` style
  there, or your own glyphs.
- **Audio helper**: `playGameInteractionSound` (SSR-safe, opt-in via the
  `sound` prop on `GameButton`).

## Wrapped-app (Capacitor/Tauri) readiness

The kit treats WebView shells as first-class: interactive controls ship
`touch-action: manipulation` and transparent tap highlights, hover-only
affordances sit behind `@media (hover: hover)`, and every safe-area read
flows through the `--game-ui-safe-*` tokens so hosts (e.g. Capacitor
Android edge-to-edge, where raw `env(safe-area-inset-*)` can read 0) can
override the source values in one place.

## Compatibility contract (1.0)

- Exported components and props, `.game-ui-*` class names, and
  `--game-ui-*` token names are public API: additive-only within a major.
- `dist/styles.css` stays 100% standard CSS (guard-tested; the CSS build
  fails on any lightningcss warning).
- Packaging is machine-checked: `publint` and `arethetypeswrong` run clean
  (ESM-only by design — CJS consumers on Node ≥22 can `require(esm)` or
  dynamic-import).

See `CHANGELOG.md` for release history and migration notes.

## Development

```bash
pnpm install
pnpm dev              # preview page (token ledger + all surfaces)
pnpm storybook        # component catalog
pnpm typecheck && pnpm test && pnpm build && pnpm docs:check
```

Releases use GitHub Actions Trusted Publishing: bump `package.json`, commit and
push `main`, then run `gh workflow run npm-publish.yml --ref main`. The manual
workflow is the release safety switch; it publishes to npmjs with short-lived
OIDC credentials and provenance, without a local login or stored npm token.
