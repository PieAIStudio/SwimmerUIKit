---
title: "SwimmerUIKit 0.9 consumer CSS warning"
date: 2026-07-03
category: workflow-issues
module: "PGS fallback capture"
problem_type: workflow_issue
component: development_workflow
severity: medium
capture_mode: pgs-fallback
applies_when:
  - "The Compound Engineering plugin or ce-compound skill is unavailable in the current host"
  - "Completed work produced reusable learning that should be recallable later"
tags: [compound-gate, fallback-capture, learning-recall]
---

# SwimmerUIKit 0.9 consumer CSS warning

> **Resolved in 1.0.0 (2026-07-03).** The raw Tailwind `@theme` block was
> moved out of the shipped CSS into the optional `./tailwind.css` export,
> and the CSS build now fails on any lightningcss warning. Full learning:
> `docs/solutions/tooling-decisions/esm-only-bundled-types-css-build-gate.md`.

## Context

This record was captured with the PGS fallback capture path because the full
Compound Engineering `ce-compound` workflow was unavailable in the current
host. Prefer `ce-compound` when the plugin is installed; use this fallback
only to avoid losing reusable learning.

## Guidance

When SwimmerUIKit 0.9 is installed into Vite 8 consumers, the package works but Vite/lightningcss can warn on raw Tailwind @theme emitted in dist/styles.css. Treat this as a center-repo packaging follow-up: downstream apps should not patch around the warning unless they need local layout behavior; the UI package should ship warning-free consumer CSS or document the required processor path.

## Why This Matters

A Compound Gate that cannot write a learning record turns reusable experience
into a final-report sentence that future agents cannot reliably find. The
fallback keeps the learning searchable by `pro-gov learn recall` without
copying or replacing the Compound Engineering workflow.

## When to Apply

- The work is complete and verified.
- The lesson is reusable across future sessions or projects.
- `compound-engineering:ce-compound` is not available in the current host.
- The learning is not already covered by an existing `docs/solutions/**` record.

## Examples

```text
Compound Gate: ran fallback capture -> docs/solutions/<category>/<file>.md
```
