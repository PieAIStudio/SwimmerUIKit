---
title: "Preflight GitHub Packages publish scopes before consumer upgrades"
date: 2026-07-03
category: workflow-issues
module: GitHub Packages publishing
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "A consumer repo is blocked on a freshly bumped private package version"
  - "A release package is built and committed but not yet visible in GitHub Packages"
  - "A local token can read packages but may not be able to publish them"
tags:
  - github-packages
  - publish
  - npm-token
  - release-workflow
---

# Preflight GitHub Packages publish scopes before consumer upgrades

## Context

SwimmerUIKit had a clean `0.9.0` release commit, passing package build outputs,
and a package version bump, but TuringPact could not upgrade because GitHub
Packages still only exposed versions through `0.8.0`. The local registry
identity check was not enough: `pnpm whoami --registry=https://npm.pkg.github.com`
returned the expected account, yet `pnpm publish` failed with a `403 Forbidden`
scope error because the token lacked `write:packages`.

## Guidance

Treat publishability as a separate release gate from installability and
identity. Before telling a consumer repo to upgrade to a new private package
version, run a small publisher preflight in the package repo:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm build-storybook
pnpm docs:check
pnpm whoami --registry=https://npm.pkg.github.com
pnpm pack --dry-run
pnpm view @pieaistudio/swimmer-ui-kit versions --json --registry=https://npm.pkg.github.com
pnpm publish
```

If publish fails with `Permission permission_denied: The token provided does
not match expected scopes`, the package and build may still be valid; the
blocking issue is credential scope. Refresh or replace the publishing token
with one that has GitHub Packages write permission, then retry publish and
re-check the registry version list before returning to the consumer repo.

## Why This Matters

Consumer upgrade work depends on the registry state, not on the package repo's
version field or release commit. A readable token can make local checks look
healthy while still being unable to publish. Separating "can read package
metadata" from "can write a new package version" prevents time spent debugging
consumer lockfiles, package manager caches, or dependency declarations when the
real blocker is a publish token scope.

## When to Apply

- Publishing `@pieaistudio/*` packages to GitHub Packages.
- Any downstream upgrade that starts with "the package version has already
  been released".
- Any release workflow that uses one credential for package reads and another
  for package writes.

## Examples

Registry says the package is not published:

```bash
pnpm view @pieaistudio/swimmer-ui-kit versions --json --registry=https://npm.pkg.github.com
# ["0.1.0", "...", "0.8.0"]
```

Identity is necessary but not sufficient:

```bash
pnpm whoami --registry=https://npm.pkg.github.com
# PieAIStudio
```

The decisive failure is publish scope:

```text
403 Forbidden - PUT https://npm.pkg.github.com/@pieaistudio%2fswimmer-ui-kit
Permission permission_denied: The token provided does not match expected scopes.
```

## Related

- `docs/reference/usage-and-upgrade-playbook.md`
- `docs/solutions/design-patterns/token-derivation-color-mix-guard-tests.md`
