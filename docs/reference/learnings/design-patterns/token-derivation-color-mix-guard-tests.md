---
id: REF-LEARNING-TOKEN-DERIVATION-COLOR-MIX-GUARD-TESTS
title: Full tokenization via color-mix derivation, enforced by guard tests
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-07-03
last_reviewed: 2026-07-12
domain: learning
tags:
  - design-tokens
  - color-mix
  - theming
  - cascade-layers
  - native-dialog
  - zero-dependency
pinned: false
related: []
date: 2026-07-03
category: design-patterns
module: swimmer-ui-kit
problem_type: design_pattern
component: tooling
applies_when:
  - "A shared CSS library must support downstream theme overrides via CSS variables"
  - "Component CSS has accumulated raw hex/rgba literals that bypass tokens"
  - "Adding modal/collapse behaviors without adding runtime dependencies (2026 baseline)"
---

# Full tokenization via color-mix derivation, enforced by guard tests

## Context

SwimmerUIKit 0.8.0 had a token system (`--game-ui-*` CSS vars) but 166 raw
color literals in `styles.css` bypassed it. Downstream theme overrides
(e.g. TuringPact's dark tavern) only half-applied: overriding
`--game-ui-accent` left hardcoded gradient stops and alpha tints unchanged,
forcing a 651-line override file in the consumer.

## Guidance

1. **One raw-color home.** All raw values live in `theme.css`. Component
   rules reference tokens only.
2. **Derive alpha variants instead of hardcoding them.** Replace
   `rgba(29,154,139,.42)` with
   `color-mix(in srgb, var(--game-ui-secondary) 42%, transparent)` — the
   tint now follows any theme override automatically. (color-mix is
   Baseline since 2023.)
3. **Context matters for shared literals.** The same `#fff8ec` meant
   "light text on dark HUD glass" in some rules and "paper surface" in
   others. Split into `--game-ui-text-on-dark` (stays light in dark themes)
   vs `--game-ui-panel-strong` (follows theme) before blanket-replacing —
   a pure string replacement would break dark themes.
4. **Make the rule machine-enforced, or it will regress.** Vitest guards:
   regex assert zero raw colors in styles.css; parse theme.css and compare
   against the TS token mirror; assert the dark theme overrides a named
   list of semantic vars (missing-token drift); assert every referenced
   `var(--game-ui-*)` is defined.
5. **Wrap library CSS in `@layer`** (`@layer swimmer-ui`) so unlayered
   consumer CSS always wins overrides — no import-order or specificity
   fights.
6. **Prefer 2026 browser natives over dependencies** for behavior:
   `<dialog>`+`showModal()` gives focus trap/Esc/top-layer/backdrop free;
   grid-template-rows 0fr↔1fr animates collapse everywhere;
   `interpolate-size: allow-keywords` is progressive enhancement for
   width-to-fit-content.

## Why This Matters

Theming became a one-variable operation for consumers, the 651-line
downstream override file can shrink to pure token overrides, an official
night theme shipped as proof, and the guard tests convert a style-review
rule into CI enforcement. Zero runtime deps were added despite gaining a
modal, window, and collapsible system — which matters because consumers
are games with hard JS bundle budgets.

## When to Apply

- Any shared CSS/component library consumed by multiple theming products.
- Before writing a "dark mode": if literals bypass tokens, fix derivation
  first or the theme will be a whack-a-mole of patches.
- When tempted to add a headless-UI dependency for dialog/tooltip/collapse:
  check the 2026 baseline natives first.

## Examples

Before:

```css
.game-ui-button--primary { background: linear-gradient(180deg, #f28d50, #e8743b); }
.game-ui-badge[data-badge-tone='ai'] { background: rgba(29,154,139,.16); }
```

After:

```css
.game-ui-button--primary { background: linear-gradient(180deg, var(--game-ui-accent-bright), var(--game-ui-accent)); }
.game-ui-badge[data-badge-tone='ai'] { background: color-mix(in srgb, var(--game-ui-secondary) 16%, transparent); }
```

Guard test core:

```ts
const literals = stylesWithoutComments.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(/g) ?? [];
expect(literals).toEqual([]);
```
