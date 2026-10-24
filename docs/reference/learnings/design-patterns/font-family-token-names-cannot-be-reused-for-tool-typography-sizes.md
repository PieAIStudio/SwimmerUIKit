---
id: REF-LEARNING-DESIGN-PATTERNS-FONT-FAMILY-TOKEN-NAMES-CANNOT-BE-REUSED-FOR-TOOL-TYPOGRAPHY-SIZES
title: "Font-family token names cannot be reused for tool typography sizes"
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-10-24
last_reviewed: 2026-10-24
domain: learning
tags:
  - learning-recall
  - design-patterns
pinned: false
related: []
category: design-patterns
module: "PGS learning capture"
capture_mode: pgs-native
---

# Font-family token names cannot be reused for tool typography sizes

## Guidance

SwimmerUIKit's fontContract treats any --swimmer-font-display/body/mono declarations as font-family lists. A B3 tool shell that used --swimmer-font-display and --swimmer-font-body for rem/clamp sizes caused the cloud pnpm verify failure  in tests/fontContract.test.ts. Keep tool typography sizes under --swimmer-tool-font-* while --swimmer-font-* remains the shipped family vocabulary; run the font contract as part of release verification.

## Applies When

- The work is complete and verified.
- The lesson is non-obvious, reusable, and not already documented.
