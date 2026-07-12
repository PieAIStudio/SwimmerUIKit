---
id: REF-LEARNING-ESM-ONLY-BUNDLED-TYPES-CSS-BUILD-GATE
title: ESM-only bundled-types distribution with a CSS build gate (1.0 packaging contract)
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-07-03
last_reviewed: 2026-07-12
domain: learning
tags:
  - esm
  - vite-plugin-dts
  - bundle-types
  - arethetypeswrong
  - publint
  - lightningcss
  - tailwind-v4
  - type-resolution
  - capacitor
  - tauri
  - stability-contract
pinned: false
related:
  - SPEC-0002
date: 2026-07-03
category: tooling-decisions
module: swimmer-ui-kit
problem_type: tooling_decision
component: tooling
severity: high
applies_when:
  - "Publishing a React/TS component package and needing it to pass arethetypeswrong and publint cleanly"
  - "Using vite-plugin-dts v5+ and expecting rollupTypes to bundle .d.ts files (renamed to bundleTypes; the old key is silently ignored)"
  - "Shipping per-file .d.ts with extensionless relative imports that fail node16 type resolution"
  - "Deciding whether a Tailwind bridge belongs in a kit's core styles or an optional export"
  - "Wanting zero-warning shipped CSS to be enforced by the build rather than logged"
  - "Hardening UI components for Capacitor/Tauri WebView hosts (touch, tap-highlight, hover, safe-area)"
  - "An entry module side-effect-imports CSS and the import leaks into dist/index.d.ts"
---

# ESM-only bundled-types distribution with a CSS build gate (1.0 packaging contract)

## Context

SwimmerUIKit is a React 19 clay-styled game UI kit with zero runtime dependencies, published to a private GitHub npm registry and consumed by six Vite ESM apps that each pin an exact version. Commit `1f87863` shipped `0.9.0 → 1.0.0` (SPEC-0002). The work was not new features — every one of the six consumers needed zero code changes — it was a packaging-correctness pass: proving, by machine, that the published artifact is safe to depend on for the long haul. That distinction is the whole point of this doc: 1.0 is a promise about the *contract*, not the *component surface*.

The commit touched `package.json` (exports/peers), `vite.config.ts` (dts plugin config), a new `scripts/build-css.mjs`, a new optional `src/tailwind-bridge.css`, `src/index.ts` (dropped a side-effect import), `src/styles.css` (wrapped-app hardening block), and extended `src/tokens.test.ts` with a `1.0 packaging contract (SPEC-0002)` guard-test suite.

## Guidance

**1. Define "1.0" as a semver contract, not a feature milestone.** For a library, 1.0 means: exported components/props, `.game-ui-*` class names, and `--game-ui-*` token names are now public API (additive-only going forward); packaging correctness is proven by machine, not by eyeballing `package.json`; and the artifact makes zero assumptions about the consumer's build tooling. Gate the release on `publint` (zero findings) and `arethetypeswrong` / attw (node10, node16-ESM, and bundler resolution modes all green) — these tools catch exactly the class of bug that "it works in my dev server" hides.

**2. Go ESM-only when every consumer already is, and let the types follow.** All six consumers are Vite ESM apps, and Node ≥22 supports `require(esm)`, so a CJS build (`dist/index.cjs` + a `require` export condition) was pure weight with no one depending on it. Before:

```jsonc
// package.json (0.9.0)
"main": "./dist/index.cjs",
"module": "./dist/index.js",
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js",
    "require": "./dist/index.cjs"
  }, ...
}
```

After:

```jsonc
// package.json (1.0.0)
"types": "./dist/index.d.ts",
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "default": "./dist/index.js"
  },
  "./styles.css": "./dist/styles.css",
  "./tailwind.css": "./dist/tailwind.css",
  "./package.json": "./package.json"
}
```

Dropping CJS also forced a fix to type generation. Per-file `.d.ts` output had two fatal flaws under attw: (a) the entry's side-effect `import './styles.css'` leaked straight into `dist/index.d.ts`, which attw reports as an "internal resolution error"; (b) extensionless relative imports like `from './GameButton'` fail Node16 module resolution for types. The fix was two changes together — remove the CSS import from `src/index.ts`, and roll every type file into one flat `dist/index.d.ts` with vite-plugin-dts:

```ts
// vite.config.ts
plugins: [react(), dts({ bundleTypes: true, tsconfigPath: './tsconfig.build.json' })],
```

Watch the version: vite-plugin-dts v4 called this option `rollupTypes`; v5 renamed it to `bundleTypes` and **silently ignores the old name** (no error, no warning — it just emits per-file d.ts again). We lost a full build cycle diagnosing why bundling "wasn't happening" before spotting the rename. `bundleTypes: true` requires `@microsoft/api-extractor` as a devDependency (vite-plugin-dts shells out to it).

**3. When the JS entry stops importing CSS, promote CSS to its own build with a hard warning gate.** Once `src/index.ts` no longer pulls in `styles.css`, Vite's library build stopped emitting `dist/styles.css` at all — a regression `publint` caught immediately ("file does not exist" for the `./styles.css` export). The fix is a dedicated script, not a Vite plugin tweak, because it needed to encode a promise: *consumers see zero CSS warnings*.

```js
// scripts/build-css.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { bundle } from 'lightningcss';

const { code, warnings } = bundle({ filename: 'src/styles.css', minify: true });

if (warnings.length > 0) {
  console.error('[build-css] lightningcss warnings (contract: must be zero):');
  for (const warning of warnings) {
    const loc = warning.loc ? `${warning.loc.filename}:${warning.loc.line}` : 'unknown';
    console.error(` - ${warning.message} (${loc})`);
  }
  process.exit(1);
}

mkdirSync('dist', { recursive: true });
writeFileSync('dist/styles.css', code);
```

Two choices here are worth calling out. First, `lightningcss` the **library**, not the `lightningcss-cli` package — the CLI requires pnpm build-script approval and its postinstall placeholder binary broke outright ("This: command not found") in this environment; the library has no postinstall step. Second, `lightningcss` is the exact CSS engine Vite 8 runs internally, so a clean local `bundle()` call is not just "probably fine downstream" — it's the same parser, so passing locally *is* passing in every consumer, by construction, not by hope.

**4. Split optional integrations into their own export instead of bundling them for everyone.** `styles.css` used to embed a Tailwind v4 `@theme inline` block mapping Tailwind theme names (`--color-primary`, etc.) onto `--game-ui-*` tokens. That forced `tailwindcss` and `@tailwindcss/vite` onto every consumer's peerDependencies, and non-Tailwind CSS pipelines (plain Vite + lightningcss) emitted "unknown at-rule @theme" warnings on a file they never asked to opt into. A grep across all six consumers confirmed zero usage of the bridge's Tailwind class names. The fix: extract the block to its own file, publish it as a separate optional export, and delete the Tailwind peers.

```css
/* src/tailwind-bridge.css — optional, published as ./tailwind.css */
/*
 * OPTIONAL Tailwind v4 bridge — NOT part of styles.css.
 * Only import if the consumer uses Tailwind v4:
 *   import '@pieai/swimmer-ui-kit/styles.css';
 *   import '@pieai/swimmer-ui-kit/tailwind.css'; // Tailwind users only
 * Non-Tailwind consumers must NOT import it — plain CSS pipelines treat
 * @theme as an unknown at-rule.
 */
@theme inline {
  --color-primary: var(--game-ui-accent);
  --color-primary-foreground: var(--game-ui-accent-contrast);
  /* ...remaining Tailwind-name -> --game-ui-* token mappings... */
}
```

```json
"exports": {
  "./tailwind.css": "./dist/tailwind.css"
}
```

The kit's own internal builds (its own Vite dev server, Storybook, the marketing site) also dropped the Tailwind plugin entirely — dogfooding the same "plain CSS only" pipeline the strictest consumer would use. A guard test forbids `@theme`, `@tailwind`, `@apply`, `@plugin`, `@config`, or `@utility` anywhere in `styles.css` / `theme.css`, so the split can't silently regress.

**5. Treat WebView-wrapped hosts (Capacitor, Tauri) as a first-class target, gated by media-feature capability, not platform sniffing.** A checklist, applied once across all interactive and game-control selectors in `styles.css`:

```css
/* Kill double-tap-zoom delay + grey iOS tap flash on every interactive control */
.game-ui-button, .game-ui-icon-button, .game-ui-tab, /* ...full control list... */
  { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }

/* Game control surfaces must never turn into text selections mid-gesture */
.game-ui-movement-pad, .game-ui-placement-toolbar, .game-ui-hud, /* ... */
  { user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
```

- Hover-lift transforms stay wrapped in `@media (hover: hover)` so touch devices never get stuck in a "hover" state after a tap (this predates 1.0 but is now guard-tested alongside the new rules).
- Every safe-area read goes through a `--game-ui-safe-*` token (`theme.css`), never a raw `env()` call in component CSS:

```css
/* theme.css — the one place env() is allowed */
--game-ui-safe-top: max(14px, env(safe-area-inset-top));
```

The reason for the indirection: Capacitor on Android in edge-to-edge mode can report `env(safe-area-inset-*)` as `0` even when a real inset exists, so the host needs a way to override the *value*, not just consume it. Routing everything through `--game-ui-safe-*` gives hosts exactly one override point.

**6. Guard-test the contract, and strip comments before asserting on source text.** The new `1.0 packaging contract (SPEC-0002)` describe block in `src/tokens.test.ts` encodes every rule above as a test, so a future PR can't silently reintroduce CJS, a stray `@theme`, or a raw `env()` call:

```ts
it('styles.css and theme.css are 100% standard CSS (no Tailwind at-rules)', () => {
  for (const css of [stylesCss, themeCss]) {
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const tailwindAtRules = withoutComments.match(/@(theme|tailwind|apply|plugin|config|utility)\b/g) ?? [];
    expect(tailwindAtRules).toEqual([]);
  }
});

it('entry module never imports CSS (keeps dist/index.d.ts resolvable)', () => {
  const codeOnly = indexTs.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  expect(codeOnly).not.toMatch(/import\s+'[^']*\.css'/);
});

it('wrapped-app hardening stays in place (touch + safe-area discipline)', () => {
  expect(stylesCss).toContain('touch-action: manipulation');
  const rulesOnly = stylesCss.replace(/\/\*[\s\S]*?\*\//g, '');
  expect(rulesOnly.includes('env(safe-area-inset')).toBe(false);
  expect(themeCss.includes('env(safe-area-inset-top')).toBe(true);
});
```

Two of these tests initially failed for the wrong reason: their regexes matched *explanatory comments* — a code comment that happened to mention `import './styles.css'`, and a doc comment that mentioned `env(safe-area-inset-*)` — not actual violations. The fix in both cases is `.replace(/\/\*[\s\S]*?\*\//g, '')` (and, for `//` comments, a second strip) before running the assertion regex. **Any guard test that asserts "pattern X is absent from source" must strip comments first**, or it will false-positive on the very documentation explaining why the rule exists.

## Why This Matters

A UI kit consumed by six apps that each pin an exact version has an unusually strict bar: a broken publish blocks every consumer's next `pnpm update` simultaneously, and there's no CI in the consumers that would catch a packaging mistake before it ships — they trust semver and move on. Machine-checked packaging (publint, attw) catches classes of bugs that manual review reliably misses, because "it imports fine in my editor" says nothing about Node16 module resolution or bundler-mode type resolution. The CSS warning-as-error gate converts a soft promise ("should be warning-free") into something that can't regress silently. The optional-export pattern for Tailwind avoids forcing a dependency and a build-plugin choice onto every consumer for a feature only the kit's own preview site used. And the wrapped-app hardening treats mobile WebView hosts as real, current targets rather than an afterthought bolted on after a bug report — the tokens exist specifically so a host can correct a known platform inaccuracy (Capacitor's `env()` reporting zero) without patching the kit.

## When to Apply

- Cutting a 1.0 (or any major) release of an internal or private-registry package with multiple pinned consumers — treat it as a packaging-correctness audit, not a feature-completeness checklist.
- Any library considering dropping CJS: check whether every consumer is already ESM and whether the runtime (Node version, bundler) supports `require(esm)` before committing.
- Any library using `vite-plugin-dts` to bundle types: verify the option name for the installed major version (`rollupTypes` vs `bundleTypes`) against its changelog — silent option-name drift produces "it just doesn't bundle" with no diagnostic.
- Any package with optional framework integrations (Tailwind, a specific state library, etc.): consider a separate export + peer-dependency split instead of bundling the integration into the default artifact, especially when usage data shows some consumers don't need it.
- Any UI kit or component library that may run inside Capacitor, Tauri, Electron, or another WebView wrapper: audit for `touch-action`, tap-highlight, `user-select`/`touch-callout` on control and gesture surfaces, hover-lift behind `@media (hover: hover)`, and safe-area reads behind overridable tokens rather than raw `env()`.
- Writing any guard test that asserts a pattern is *absent* from a source file: strip comments (and, if relevant, string literals) before matching, or documentation about the rule will trip the rule.

## Examples

- `package.json` — before/after `exports` and peerDependencies (CJS removed, Tailwind peers removed, `./tailwind.css` and `./package.json` exports added).
- `vite.config.ts` — `dts({ bundleTypes: true, tsconfigPath: './tsconfig.build.json' })` plus the comment documenting why per-file d.ts and CJS were dropped.
- `scripts/build-css.mjs` — `lightningcss`'s `bundle()` library call with `process.exit(1)` on any warning.
- `src/tailwind-bridge.css` — the extracted `@theme inline` block, now published only via the optional `./tailwind.css` export.
- `src/index.ts` — removal of `import './styles.css'` with the comment explaining the attw resolution-error link.
- `src/styles.css` lines ~559–566 — the wrapped-app hardening selectors and comment block.
- `src/tokens.test.ts` — the `1.0 packaging contract (SPEC-0002)` describe block (lines ~148–195), including the comment-stripping pattern used in three of its five assertions.

## Related

- `docs/reference/learnings/design-patterns/token-derivation-color-mix-guard-tests.md` —
  the 0.9.0 tokenization/guard-test discipline this packaging contract extends.
- `docs/specs/active/SPEC-0002-v1-release-readiness.md` — the governing spec.
