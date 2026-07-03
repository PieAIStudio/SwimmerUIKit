---
title: "multi-repo push with pnpm hook shim drift"
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

# multi-repo push with pnpm hook shim drift

## Context

This record was captured with the PGS fallback capture path because the full
Compound Engineering `ce-compound` workflow was unavailable in the current
host. Prefer `ce-compound` when the plugin is installed; use this fallback
only to avoid losing reusable learning.

## Guidance

When finishing a multi-repo rollout, keep remaining dirty files in separate topical commits before pushing, especially docs, generated evidence, and legacy pointer deletions. If lefthook/doc-gov commit hooks intermittently report an older pnpm version than the repo engine requires, first confirm the active shell pnpm/corepack version, then retry the commit so the hook resolves the correct pnpm shim; do not bypass hooks unless the hook itself is broken. For branches without upstream, push with git push -u origin <branch>, then verify every repo with git status --short --branch showing no ahead/behind.

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
