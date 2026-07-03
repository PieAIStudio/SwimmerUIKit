---
title: "npmjs scope migration lockfile provenance"
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

# npmjs scope migration lockfile provenance

## Context

This record was captured with the PGS fallback capture path because the full
Compound Engineering `ce-compound` workflow was unavailable in the current
host. Prefer `ce-compound` when the plugin is installed; use this fallback
only to avoid losing reusable learning.

## Guidance

When migrating SwimmerUIKit consumers from GitHub Packages @pieaistudio scope to npmjs @pieai scope, package/import replacements are not enough: pnpm lockfiles can retain GitHub Packages tarball URLs and old integrity values, and supply-chain policy verification may fail before pnpm can re-resolve. Confirm npmjs dist.integrity/dist.tarball with npm view, replace or remove stale package lock entries, run pnpm install --lockfile-only/frozen with the npmjs registry, and verify no old scope or GitHub tarball remains outside node_modules. CI publish workflows also need explicit Playwright browser and lefthook installs when tests/docs gates require them.

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
