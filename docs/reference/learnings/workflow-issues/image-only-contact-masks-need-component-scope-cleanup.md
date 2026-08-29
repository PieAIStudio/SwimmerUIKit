---
id: REF-LEARNING-WORKFLOW-ISSUES-IMAGE-ONLY-CONTACT-MASKS-NEED-COMPONENT-SCOPE-CLEANUP
title: "Image-only contact masks need component-scope cleanup"
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

# Image-only contact masks need component-scope cleanup

## Guidance

When a React item registers a dissolve or contact-image effect with a shared registry, cleanup in the parent animation runtime is not enough: unmounting the item can leave a detached image masked and retain its registry entry. Keep value updates incremental, but add a mount-scoped effect cleanup that unregisters the item and restores both mask-image properties; verify by unmounting a touching pair and asserting the image mask is empty.

## Applies When

- The work is complete and verified.
- The lesson is non-obvious, reusable, and not already documented.
