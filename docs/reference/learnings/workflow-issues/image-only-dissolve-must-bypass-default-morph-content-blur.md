---
id: REF-LEARNING-WORKFLOW-ISSUES-IMAGE-ONLY-DISSOLVE-MUST-BYPASS-DEFAULT-MORPH-CONTENT-BLUR
title: "Image-only dissolve must bypass default Morph content blur"
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

# Image-only dissolve must bypass default Morph content blur

## Guidance

If a LiquidGroup item uses image-only dissolve without an explicit Morph effect, do not let the default Morph content filter blur the whole item host: the DOM labels disappear or soften during release while the image layer is dissolving. The verified fix is to omit the default Morph config for dissolve-only items and keep the crisp content layer above the image SVG; add a Storybook release-frame check so image pixels can warp while DOM text stays sharp.

## Applies When

- The work is complete and verified.
- The lesson is non-obvious, reusable, and not already documented.
