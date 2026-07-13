# Changelog

All notable changes to `@pieai/swimmer-ui-kit`.
Format: [Keep a Changelog](https://keepachangelog.com); versioning: semver.

## 1.1.0 — 2026-07-13

A design-system quality pass: fixes real bugs in the existing surface
(radial menu, contrast, fonts) and starts paying down the "central kitchen"
governance/packaging debt (token adoption checker, theme contract export,
demo CSS split). No exported component or prop was removed or renamed.

### Added

- `GAME_UI_THEME_CONTRACT`, an exported `readonly string[]` of every
  semantic token a complete theme (like the official `night` theme) must
  override. Downstream custom themes (e.g. an `abyss` theme) can assert
  their own CSS covers the same list instead of eyeballing the docs.
- Optional `./fonts.css` subpath: `@font-face` rules + bundled Latin-subset
  woff2 for Baloo 2 and Geist Variable (SIL OFL), the two families
  `theme.css`'s font stack already names. Not loading it still works
  (progressive enhancement, system-font fallback) but non-standard font
  weights (620/860/930) collapse to 400/700 without it.
- `swimmer-ui-check`, a zero-dependency bin (`npx swimmer-ui-check <dir>`)
  that scans a consumer's own CSS/TSX for raw color literals outside
  `:root`/`[data-*theme*]` blocks — the same "no bare colors in component
  rules" rule `src/tokens.test.ts` enforces inside this repo, made runnable
  against downstream code.
- `GameModal` gained `position="bottom"`, a mobile action-sheet variant of
  the same native `<dialog>` (unchanged focus trap/Esc/backdrop, only the
  frame's placement/shape/entrance differ). Replaces the hand-rolled
  backdrop+slide-up-panel pattern some consumers were building themselves
  (a known source of missing focus-trap/Esc handling).
- `GameRadialMenu` gained an `onSelect?: (id: string) => void` callback
  (previously clicking an item did nothing).
- Demo site and Storybook both gained a light/night theme toggle (demo site:
  navbar control using the kit's own `GameToggle`-style button; Storybook:
  a global toolbar entry that sets `data-game-ui-theme` for every story).

### Changed

- **`GameRadialMenu` is now actually styled.** It rendered as unstyled
  browser-default buttons before (`.game-ui-radial-item` had no CSS rule at
  all); it's now a real circular wheel using clock-position placement.
  `role="menu"`/`role="menuitem"` (which had no working keyboard model)
  changed to `role="group"` + plain buttons.
- **Button/tab/badge text contrast, both themes.** WCAG-measured failures
  as low as 2.52:1 on the primary button in the night theme (need 4.5:1).
  Fixed at the token layer only (`theme.css`): `--game-ui-accent-contrast`
  is now a dark-ink color shared by primary/danger/success buttons, the
  active tab/segmented pill, avatar initials, and the checkbox check —
  component rules did not change. Two further raw-brand-color-as-text
  spots (`--game-ui-danger` on `.game-ui-field-error`/`-required`,
  `--game-ui-accent` on the first-session step numbers) got their own new
  `--game-ui-danger-ink`/`--game-ui-accent-ink` tokens. HUD-chip and
  fact-chip secondary text (`.game-ui-hud-chip small/em`,
  `.game-ui-fact-copy small/em`) stopped fading `--game-ui-text-on-dark` to
  72% opacity, which dropped under 4.5:1 against realistic glass-chip
  backdrops. All of the above are locked in by an expanded WCAG contrast
  guard test (`src/tokens.test.ts`), not just fixed once.
- `GameSlider`'s range input now has a token-styled clay thumb/track
  (`::-webkit-slider-thumb`/`::-moz-range-thumb`) instead of bare
  `accent-color`.
- `GameTooltip` auto-generates `aria-describedby` linking the trigger to
  the tooltip text (was visual-only). `GameTabs` accepts an optional `id` +
  per-tab `panelId` to auto-populate `aria-controls`.
- Interactive controls get a `@media (forced-colors: active)` fallback
  (Windows High Contrast) — pressed/selected states get a real border
  instead of relying on a `color-mix()` wash forced-colors mode ignores.
- Storybook's `@storybook/addon-a11y` gate went from cosmetic
  (`test: 'todo'`) to enforced (`test: 'error'`) — a real axe violation now
  fails `pnpm test`, not just shows up in the Storybook UI.

### Fixed

- Three accessibility bugs the newly-enforced Storybook a11y gate caught:
  `GameCardFan` used an invalid `role="listitem"` on an `<article>`
  (changed to a plain `<li>`); two scrollable job-list containers in
  `GameContractorTools` had no keyboard focus path; `GameContractorPanel`'s
  mobile drawer rendered the selected job twice (drawer + standalone card)
  when open, producing duplicate ARIA landmarks.
- `vitest.config.ts`'s unit-test include glob was `src/**/*.test.ts` —
  it silently excluded every `*.test.tsx` file. Five files and ~30 tests
  had never actually run via `pnpm test` despite the command exiting 0.
  Fixed the glob, which then surfaced (and fixed) two further dormant test
  bugs it had been hiding.
- The demo site's token ledger truncated every value to `var(--…` and
  broke token names mid-word (`TOUCHMINIM UMPX`); values now wrap instead
  of ellipsis-truncating, and cards no longer stretch to their tallest
  sibling in the grid.

### Breaking (packaging only — no component/prop/class/token removed)

- **`GameUiPreview`'s demo-only CSS moved to a new optional `./preview.css`
  subpath.** It was ~13KB of stage/showcase-only rules
  (`.game-ui-preview-*`, `.game-ui-swatch`/`.game-ui-token-*`,
  `.game-ui-stage-world`, `.game-ui-proof-frame`, the first-session demo
  world) that every consumer paid for in `styles.css` even though
  `GameUiPreview` is a kit-internal showcase component almost nobody
  renders in production. If you render `<GameUiPreview />` (as TuringPact's
  `/ui-preview` route does), add
  `import '@pieai/swimmer-ui-kit/preview.css'` alongside `./styles.css` or
  it renders unstyled. Everyone else needs no code change —
  `.game-ui-*`/`--game-ui-*` names are unchanged, only which file the CSS
  ships in. `dist/styles.css` dropped from 89.2KB to 77.8KB minified.

## 1.0.1 — 2026-07-11

### Added

- `GameCallout`, a token-driven notice surface for wallet pitches, onboarding
  hints, warnings, success messages, and other compact product notices.

### Changed

- `GameButton` keeps a 44px minimum hit target on coarse pointers while allowing
  denser 40px controls for precise pointers.

## 1.0.0 — 2026-07-03

1.0 is a stability contract, not a feature drop: exported components and
props, `.game-ui-*` class names, and `--game-ui-*` token names are now
public API — additive-only within the 1.x major. Spec: SPEC-0002.

Distribution is public through npmjs and the source repository is publicly
readable under the PieAI Limited Use License. This is source-available, not an
open-source license; bundled visual assets remain restricted.

The npmjs package uses PieAI's existing user scope: `@pieai/swimmer-ui-kit`.
Earlier GitHub Packages releases used `@pieaistudio/swimmer-ui-kit`; consumers
moving to npmjs must update the dependency name and import specifiers once.

### Breaking (package identity and packaging)

- **npm scope changed once.** Public npmjs distribution is
  `@pieai/swimmer-ui-kit`; the earlier `@pieaistudio/swimmer-ui-kit` identity
  remains only in GitHub Packages history. Consumers must update dependency
  keys and import specifiers from `@pieaistudio` to `@pieai`.

- **ESM-only.** `dist/index.cjs` and the `require` export condition are
  removed. Every known consumer is a Vite ESM app; CJS consumers on
  Node ≥22 can `require(esm)` or use dynamic `import()`.
- **`./theme.css` subpath removed.** It was a confusing legacy alias of
  `./styles.css` (verified unused by all consumers). Use `./styles.css`.
- **Tailwind fully decoupled.** `tailwindcss` and `@tailwindcss/vite`
  peerDependencies are gone. `dist/styles.css` is now 100% standard CSS —
  the Tailwind v4 `@theme inline` bridge moved to a new **optional**
  `./tailwind.css` export (verified unused by all consumers, so no one
  needs to add it; it exists for future Tailwind hosts that want
  `bg-primary` etc. to map to kit tokens).

### Fixed

- Vite 8 / lightningcss consumers no longer get "unknown at-rule @theme"
  warnings: the shipped CSS contains no Tailwind at-rules, and the CSS
  build itself fails on any lightningcss warning (scripts/build-css.mjs).
- Type resolution is clean under every strategy (`arethetypeswrong`:
  node10/node16-ESM/bundler all green; `publint`: zero findings). Types
  are bundled into one flat `dist/index.d.ts`; the entry no longer leaks
  `import './styles.css'` into declarations.
- The published package no longer contains test declarations
  (`*.test.d.ts`), story files, or `.DS_Store`.

### Added

- Wrapped-app (Capacitor/Tauri WebView) hardening: interactive controls
  ship `touch-action: manipulation` + transparent tap highlight; game
  control surfaces (movement pad, toolbars, HUD) are
  `user-select: none` + `-webkit-touch-callout: none`; hover-lift effects
  moved behind `@media (hover: hover)` so touch devices never get sticky
  hover; all safe-area reads flow through `--game-ui-safe-*` tokens
  (hosts can override the env() source, e.g. Capacitor Android
  edge-to-edge). All guard-tested in `src/tokens.test.ts`.
- `./package.json` export; `CHANGELOG.md` (this file).

## 0.9.0 — 2026-07-03

- Full tokenization: zero raw color literals in `styles.css`; alpha tints
  derived from semantic tokens via `color-mix()`; guard tests enforce it.
- Official `night` theme (`[data-game-ui-theme='night']`).
- Panel system: `GameCollapsiblePanel`, `GameWindowPanel`, `GameModal`
  (native `<dialog>`: free focus trap, Esc, top layer).
- All component CSS wrapped in `@layer swimmer-ui` — unlayered consumer
  CSS always wins overrides.
- A11y: tabs keyboard navigation (roving tabindex), unified focus ring,
  tooltip focus/`:focus-within` support, themed scrollbars/selection.
- Docs: `design-system-guide.md`, `usage-and-upgrade-playbook.md`.

## 0.8.0 and earlier

Extraction from TuringPact into a standalone package; OwnMySpace surface
pack; terrain/build tooling; AI contractor queue; first-session shell;
GitHub Packages publish workflow. See git history.
