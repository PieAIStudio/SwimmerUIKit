---
id: REF-LEARNING-WORKFLOW-ISSUES-SHARED-CARDS-MUST-RESERVE-LAYOUT-SPACE-FOR-CORNER-ICONS
title: "Shared cards must reserve layout space for corner icons"
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

# Shared cards must reserve layout space for corner icons

## Guidance

When a reusable card places an optional corner icon, do not absolutely position it over the copy without reserving space. The verified GlassCard overlap was caused by an absolute icon sharing the title/body column; a sibling grid column kept the icon clear at desktop and narrow widths while preserving the kept-row layout. Apply this to shared card components and add a browser painted-box intersection regression.

## Applies When

- The work is complete and verified.
- The lesson is non-obvious, reusable, and not already documented.
