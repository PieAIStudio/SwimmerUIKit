---
id: REF-LEARNING-MULTI-REPO-PUSH-PNPM-HOOK-SHIM-DRIFT
title: Multi-repo push with pnpm hook shim drift
type: reference
status: stable
canonical: true
owner: ai-assisted
created: 2026-07-03
last_reviewed: 2026-07-12
domain: learning
tags:
  - multi-repo
  - pnpm
  - lefthook
  - git
pinned: false
related: []
date: 2026-07-03
category: workflow-issues
module: Repository rollout
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "Finishing a rollout that changed multiple repositories"
  - "A Git hook resolves a different pnpm shim than the active shell"
---

# Multi-repo push with pnpm hook shim drift

## Context

Multi-repository rollouts can leave unrelated files mixed together or fail at
the final commit because a Git hook resolves an older pnpm shim than the active
shell.

## Guidance

When finishing a multi-repo rollout, keep remaining dirty files in separate topical commits before pushing, especially docs, generated evidence, and legacy pointer deletions. If lefthook/doc-gov commit hooks intermittently report an older pnpm version than the repo engine requires, first confirm the active shell pnpm/corepack version, then retry the commit so the hook resolves the correct pnpm shim; do not bypass hooks unless the hook itself is broken. For branches without upstream, push with git push -u origin <branch>, then verify every repo with git status --short --branch showing no ahead/behind.

## Why This Matters

Separate topical commits preserve reviewability, while verifying the active
pnpm/Corepack resolution avoids bypassing a healthy hook for an environment
problem.

## When to Apply

- Several repositories must be committed and pushed as one coordinated rollout.
- A hook reports a pnpm or Node version different from the active shell.

## Examples

```bash
corepack pnpm --version
git status --short --branch
git push -u origin <branch>
```
