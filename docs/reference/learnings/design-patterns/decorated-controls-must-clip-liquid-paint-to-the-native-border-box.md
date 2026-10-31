---
id: REF-LEARNING-DESIGN-PATTERNS-DECORATED-CONTROLS-MUST-CLIP-LIQUID-PAINT-TO-THE-NATIVE-BORDER-BOX
title: "Decorated controls must clip liquid paint to the native border-box"
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-10-31
last_reviewed: 2026-10-31
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

# Decorated controls must clip liquid paint to the native border-box

## Guidance

Verified SwimmerUIKit symptom: primary liquid CTA showed a faint grey/glow ghost outside its rounded button. Root cause was a grid/flex auto-stretched liquid frame plus an unclipped compositor drop-shadow on the decoration layer. Fix the frame to the native control width (preserve an explicit full-width override) and clip the decoration with overflow:hidden and the native rounded radius. Prevent recurrence with a real Chromium painted-bounds scan against the element rect across light/dark, white/tinted cards, desktop/phone, and every primary form.

## Applies When

- The work is complete and verified.
- The lesson is non-obvious, reusable, and not already documented.
