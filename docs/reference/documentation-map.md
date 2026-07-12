---
id: REF-DOCUMENTATION-MAP
title: Documentation Map
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-07-12
domain: meta
tags:
  - navigation
pinned: false
related: []
---

# Documentation Map

This is a human and AI map of the governed document shelves. It is not the AI startup entrypoint; `AGENTS.md` is.

## AI Startup Source

Use `AGENTS.md` for startup reading. It should point agents to:

- `docs/policy/*.md`
- `docs/governance/boundary.md`
- `docs/governance/ssot-v1.0.md`
- `docs/governance/doc-agent-rules.md`
- `docs/governance/doc-types.md`
- `docs/governance/agents-routing/<selected-profile>-v1.0.md`
- `docs/reference/execution/current-work.md`

## Areas

| Area | Purpose |
| --- | --- |
| `docs/policy/` | Project policy and AI development rules |
| `docs/adr/` | The single durable decision surface; Matt-compatible and outside the Doc Gov lifecycle |
| `docs/specs/active/` | Active requirements |
| `docs/specs/completed/` | Completed specs |
| `docs/plans/active/` | Active implementation plans |
| `docs/plans/completed/` | Completed execution records |
| `docs/reference/learnings/` | Governed, reusable PGS learning records recalled only when relevant |
| `docs/canon/` | Durable project truth |
| `docs/reference/` | Guides and references |
| `docs/archive/` | Retired history |
| `docs/governance/` | Governance core rules, SSOT, agents routing, doc types, templates, and manifest |

## Key Current Documents

- Design system truth (tokens, theming, motion, a11y):
  `docs/reference/design-system-guide.md`
- Consumer usage and upgrade SOP:
  `docs/reference/usage-and-upgrade-playbook.md`
- Active spec: `docs/specs/active/SPEC-0002-v1-release-readiness.md`
  (SPEC-0001 is stable/shipped)
- Release history: `CHANGELOG.md` (root, ungoverned)
- Current state index: `docs/reference/execution/current-work.md`

Markdown outside `docs/**` is not governed by default. Product prompts, assets,
project-package canon, generated media notes, and source-package files stay in
their product/workbench structure unless this project explicitly opts them into
doc-gov.

Optional task-specific tools may keep temporary artifacts outside Doc Gov.
Reusable project learning belongs only in governed
`docs/reference/learnings/**` records.
