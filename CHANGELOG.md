# Changelog

All notable changes to `@pieaistudio/swimmer-ui-kit`.
Format: [Keep a Changelog](https://keepachangelog.com); versioning: semver.

## 1.0.0 — 2026-07-03

1.0 is a stability contract, not a feature drop: exported components and
props, `.game-ui-*` class names, and `--game-ui-*` token names are now
public API — additive-only within the 1.x major. Spec: SPEC-0002.

### Breaking (packaging only — zero code changes needed in any known consumer)

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
