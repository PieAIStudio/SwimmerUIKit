---
id: REF-LEARNING-TOOLING-DECISIONS-VITEST-NODE-PROJECT-GLOBS-MUST-EXCLUDE-BROWSER-TESTS
title: "Vitest node project globs must exclude browser tests"
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-08-27
last_reviewed: 2026-08-27
domain: learning
tags:
  - learning-recall
  - tooling-decisions
pinned: false
related: []
category: tooling-decisions
module: "PGS learning capture"
capture_mode: pgs-native
---

# Vitest node project globs must exclude browser tests

## Guidance

In a multi-project Vitest config, a node project's broad include ['src/**/*.test.{ts,tsx}'] also matches *.browser.test.tsx files. The browser tests then run in node and fail with document is not defined; if the browser project is selected separately, the same files can be duplicated. Keep the broad unit-test extension support, but add an explicit exclude for src/**/*.browser.test.{ts,tsx} and run the browser project in Chromium as its own verification. Apply this whenever a repository mixes node and browser Vitest projects.

## Applies When

- The work is complete and verified.
- The lesson is non-obvious, reusable, and not already documented.
