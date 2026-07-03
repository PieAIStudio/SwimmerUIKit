# @pieaistudio/swimmer-ui-kit

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
    "@pieaistudio/swimmer-ui-kit": "1.0.0"
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
import '@pieaistudio/swimmer-ui-kit/styles.css';
```

**Optional** — only if the host app uses Tailwind v4 and wants Tailwind
theme names (`bg-primary`, `text-foreground`, `rounded-md`…) to resolve to
kit tokens, additionally import the bridge (requires the host's Tailwind
build; never import it without Tailwind):

```ts
import '@pieaistudio/swimmer-ui-kit/tailwind.css';
```

## What's inside

- **~60 components** across: core controls (`GameButton`, `GameTabs`,
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

- **Official themes**: light (default) and `night`
  (`<html data-game-ui-theme="night">`). Downstream theming = overriding
  semantic tokens; see the design system guide.
- **Clay assets**: inline SVG mode by default (no asset hosting needed);
  `setClayAssetMode('source')` switches to the sculpted PNG set, which
  ships in `dist/assets/` for hosts to copy under
  `/assets/game/ui/clay/…`.
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
