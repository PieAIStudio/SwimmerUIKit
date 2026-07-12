---
id: REF-LEARNING-NPMJS-SCOPE-MIGRATION-LOCKFILE-PROVENANCE
title: npmjs scope migration lockfile provenance
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-07-03
last_reviewed: 2026-07-12
domain: learning
tags:
  - npm
  - package-scope
  - lockfile
  - supply-chain
pinned: false
related: []
date: 2026-07-03
category: workflow-issues
module: npm registry migration
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "Migrating a package between npm scopes or registries"
  - "A lockfile retains tarball URLs or integrity values from the old registry"
---

# npmjs scope migration lockfile provenance

## Context

A package-scope replacement can look complete in `package.json` while pnpm's
lockfile still points at the old registry tarball and integrity record.

## Guidance

When migrating SwimmerUIKit consumers from GitHub Packages @pieaistudio scope to npmjs @pieai scope, package/import replacements are not enough: pnpm lockfiles can retain GitHub Packages tarball URLs and old integrity values, and supply-chain policy verification may fail before pnpm can re-resolve. Confirm npmjs dist.integrity/dist.tarball with npm view, replace or remove stale package lock entries, run pnpm install --lockfile-only/frozen with the npmjs registry, and verify no old scope or GitHub tarball remains outside node_modules. CI publish workflows also need explicit Playwright browser and lefthook installs when tests/docs gates require them.

## Why This Matters

The lockfile is part of dependency provenance. Leaving the old registry in it
can block supply-chain policy checks before pnpm gets a chance to re-resolve the
new package.

## When to Apply

- A package moves between scopes or registries.
- Policy checks fail before dependency resolution.
- `package.json` is updated but old tarball URLs remain in the lockfile.

## Examples

```bash
npm view <package> dist.integrity dist.tarball --registry=https://registry.npmjs.org/
rg 'npm.pkg.github.com|<old-scope>' pnpm-lock.yaml package.json
pnpm install --lockfile-only
```
