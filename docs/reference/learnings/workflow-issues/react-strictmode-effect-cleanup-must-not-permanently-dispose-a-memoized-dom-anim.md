---
id: REF-LEARNING-WORKFLOW-ISSUES-REACT-STRICTMODE-EFFECT-CLEANUP-MUST-NOT-PERMANENTLY-DISPOSE-A-MEMOIZED-DOM-ANIM
title: "React StrictMode effect cleanup must not permanently dispose a memoized DOM animation engine"
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-08-29
last_reviewed: 2026-08-29
domain: learning
tags:
  - learning-recall
  - workflow-issues
pinned: false
related: []
category: workflow-issues
module: "PGS learning capture"
capture_mode: pgs-native
---

# React StrictMode effect cleanup must not permanently dispose a memoized DOM animation engine

## Guidance

When a React component owns a memoized imperative DOM or SVG animation engine, React StrictMode's development mount, effect cleanup, and effect setup can reuse the same engine instance. If cleanup sets a permanent disposed flag, the second setup can register DOM nodes but wake and paint return early; a later update may still acquire a process-wide budget slot and leak it, leaving SVG path d empty with no error. Verified fix: allow registration to revive the disposed engine and reset disconnected observers/listeners, add a browser regression that wraps the component in StrictMode and asserts every liquid blob path d is non-empty, and warn once in development only when a real budget acquisition fails. Apply this pattern to imperative DOM or SVG engines with shared budgets.

## Applies When

- The work is complete and verified.
- The lesson is non-obvious, reusable, and not already documented.
