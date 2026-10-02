---
id: REF-LEARNING-ESM-ONLY-BUNDLED-TYPES-CSS-BUILD-GATE
title: ESM-only bundled-types distribution with a CSS build gate (1.0 packaging contract)
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-07-03
last_reviewed: 2026-10-02
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
  - "A CSS minifier combines independent transform properties and drops a cascade reset that worked in development"
---

# ESM-only types and the actual package are one contract

## Context

The original 1.0 packaging work fixed CSS side-effect imports in declarations,
extensionless declaration resolution and mismatched CJS/ESM conditions. The
historical implementation/receipt is retained by Git and SPEC-0002; this note
keeps the reusable failure mechanism rather than another installation guide.

## Guidance

1. Keep CSS out of the JavaScript barrels. A declaration containing an unresolved
   CSS side-effect import can be broken even when the browser build works.
2. Bundle declarations for every supported JavaScript leaf. Test the actual
   packed artifact with the package linter and ESM type checker; checking source
   types alone does not prove export-map resolution for consumers.
3. Main CSS must compile without warnings. Optional Tailwind/font/presence and
   preview assets have explicit leaves, so a host never needs an undeclared
   build pipeline merely to import ordinary controls.
4. A new optional feature belongs in an isolated entry, not an always-loaded
   dependency. Measure the root's transitive shared chunks, not only index.js.
   Four entries still share the single resource budget.
5. Use exact dependency and package-file evidence. The old zero-dependency
   wording is not current: Floating UI is the maintained headless dependency.
   A future change must pass the exact dependency/peer/export contract.
6. Build warnings that protect an API must survive the published package;
   library-build environment constants can otherwise erase consumer warnings.

## Applies When

Changing package exports, declaration generation, CSS bundling, optional leaves
or dependencies. Current commands and version state belong in the migration
guide and current-work, not in this learning record.
