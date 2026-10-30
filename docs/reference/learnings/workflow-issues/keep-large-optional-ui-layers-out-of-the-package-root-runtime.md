---
id: REF-LEARNING-WORKFLOW-ISSUES-KEEP-LARGE-OPTIONAL-UI-LAYERS-OUT-OF-THE-PACKAGE-ROOT-RUNTIME
title: "Keep large optional UI layers out of the package root runtime"
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-10-30
last_reviewed: 2026-10-30
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

# Keep large optional UI layers out of the package root runtime

## Guidance

When a new shared UI layer makes the packed root runtime exceed the enforced budget, do not weaken the budget or remove the parts. Put the optional layer behind a named public package leaf, add that leaf to the package export map, Vite client entries, packed/type fixtures, attw entrypoints and a real Next consumer import. In the verified Colour Worlds alpha.12 candidate this reduced rootRuntimeBytes from 171372 (check:packed failure) to 157401 against the 159626 budget; the leaf had its own runtime/types and the published candidate passed packed, attw and Next checks.

## Applies When

- The work is complete and verified.
- The lesson is non-obvious, reusable, and not already documented.
