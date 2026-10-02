---
id: REF-LEARNING-TOKEN-DERIVATION-COLOR-MIX-GUARD-TESTS
title: Full tokenization via color-mix derivation, enforced by guard tests
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-07-03
last_reviewed: 2026-10-02
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

# Semantic token derivation must be tested after inheritance and compilation

## Context

The original hardening audit found raw component colours that ignored host
theme overrides. Tokenization fixed that class of drift, but a variable name
alone does not prove the right value reaches the rendered surface.

## Guidance

Keep primitive colours in src/tokens/theme.css, full style recipes in
src/tokens/control-styles.css and components on semantic variables. TypeScript
exports reference the CSS vocabulary; do not create another literal palette.

CSS resolves custom-property expressions before inheritance. A colour-mix that
uses a child-specific hue must be bound on the painted element, not precomputed
on its ancestor. Test both nesting orders of style and illumination, nested
light resets and the omitted-style default against real browser computed paint.

For SVG-decorated controls, the button background may correctly be transparent.
Read the actual path fill/stroke and the real text colour, then calculate
contrast. Do not mistake transparent hit-box CSS for the painted background.

A selector containing :has(input:checked) carries the type specificity of input.
That can unexpectedly beat a later semantic danger rule. Zero only that type
specificity with :where(input), retain the state predicate, and test selected,
ordinary and disabled states together. Do not fix it with blanket !important.

Check source token definitions before stale dist. A quoted variable name in a
test is not a CSS definition. The checker needs negative fixtures for undefined
names and unreadable colour pairs, plus compiled paint tests that fail below
4.5:1 without rounding a bad pair up to a pass.

## Applies When

Adding a style, changing hue inheritance, colour contracts, selector ordering,
SVG paint or the shipped token checker. The current theme and token references
own the colour values; this record owns the failure mechanisms.
