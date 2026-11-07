# SwimmerUIKit AI Router

## PGS Router Block

<!-- PGS-ROUTER:BEGIN v1.1 -->

## Boundary

- PGS governs this `AGENTS.md` entry and governed Markdown under `docs/**`.
- `AGENTS.md` is the canonical project router. Do not create a root CLAUDE.md alias.
- `.agents/skills/` is the canonical project skill root; `.claude/skills`
  must be the exact relative symlink `../.agents/skills`.
- Product artifacts outside `docs/**` are not governed docs unless this project explicitly opts them in.
- Read `README.md` when it provides relevant setup, verification, positioning,
  or product context; do not create a duplicate AI-only README.
- `docs/reference/execution/current-work.md` is the active-work index; read it
  when the task depends on current priorities or in-flight work.
- This project's adopted profile is `engineering-runtime`.
- Its selected agents routing file is `docs/governance/agents-routing/engineering-runtime-v1.1.md` under
  `docs/governance/agents-routing/`.

## Policy Discovery

All Markdown under `docs/policy/**/*.md`, including subdirectories and any
symlinked shared-rule files, belongs to the discoverable policy index. This is
not a command to load every policy at startup. Read the project-local baseline
and only the shared rules whose task surface actually matches.

## Credentials And Local Environment

Before creating or changing local credentials or environment files, discover the
workspace's shared credential location and read its instructions. When a portfolio
provides a central `<portfolio-root>/.secrets/README.md`, start there and follow the project's existing
adapter. Apply the cloud-access policy if installed; do not infer project-local
secret storage from a missing `.env` file. Read only task-required configuration.

## Skill Availability

An asset manifest or lock records desired state; it does not prove that an
optional skill is installed, host-discoverable, loaded, or invoked. Use a skill
only when its SKILL.md actually exists and can be read. Centrally managed
project links may need the portfolio control plane to materialize them after a
fresh clone; their absence must not hide or replace the portable policy rules.

## Documentation Tasks

For ordinary documentation content edits, read the short
`docs/governance/doc-agent-rules.md` and guidance for the changed subject.
Expand detailed rules only for the contract being changed:

- Scope, ownership, directory contracts or host aliases: relevant sections of
  `docs/governance/boundary.md` and `docs/governance/ssot-v1.1.md`.
- Classification, metadata or lifecycle: `docs/governance/doc-types.md`.
- Routing or profile behavior: the selected agents routing file.

Keep project AI development policy in `docs/policy/`. Ordinary small tasks do not
require new Spec, Plan, ADR or proof documents. Use existing document roles for
cross-session work, substantial changes and durable decisions.

When creating docs, changing documented truth, or closing a phase, apply the
document-convergence policy if installed by the asset selection. Limit the pass
to affected facts and references; preserve decision rationale and original evidence.

## Verification

Use relevant project checks and the gates required for delivery. Do not reinstall
dependencies or run every expensive test for an ordinary edit. Expand or repeat
checks for related code, input or environment changes, failures or unresolved
questions. Report actual evidence; once acceptance and required gates are met,
stop expanding the task.

<!-- PGS-ROUTER:END -->

## Three-Stage Delivery

<!-- PGS-DELIVERY:THREE-STAGE -->

Follow the [PGS Three-Stage Delivery policy](https://github.com/PieAIStudio/ProjectGovernanceSystem/blob/main/docs/policy/design-principles.md#7-three-delivery-stages) for local edits, automatically selected related checks, release authority and evidence.
Keep normal hooks; never use `--no-verify`. An ordinary push must not start hosted Actions or deployments.
Fixes on `main` have standing release authorization after the normal gates; new features still require approval.

### Fast Release Gate

<!-- PGS-DELIVERY:FAST-RELEASE -->

Follow the single [PGS Fast Release Gate](https://github.com/PieAIStudio/ProjectGovernanceSystem/blob/main/AGENTS.md#fast-release-gate); do not copy it here.


## Individual Donor Discovery

`donors-individual.md` is this repository's canonical project-local index for
external individual donor sources. Before any visual or UI implementation,
donor or provenance review, or upstream maintenance, read it and follow the exact
checkout and commit recorded there. The combined workspace checkout for this
repository uses the `for_SwimmerUIKit` owner scope under
`<portfolio-root>/_Donors-Individual/for_SwimmerUIKit/`; it is a
review/provenance source, not a runtime dependency. `donors-individual-lock.json` is the
machine-readable pin.

## Portfolio Laws

- For shared UI capability changes in this brand kit, follow `docs/policy/shared-rules/brand-kit-first.md`; add missing capability here, publish it, then consume it.

## Project Scope

SwimmerUIKit is a standalone React and TypeScript game UI package for Pie game surfaces.

- It owns reusable UI components, visual tokens, CSS variables, asset helpers, Storybook surfaces, and package distribution for `@pieai/swimmer-ui-kit`.
- It does not own host app runtime scene code, R3F state, persistence APIs, product-specific asset manifests, or consuming app stores.
- Use tool-selected related checks under Three-Stage Delivery. Command reference,
  not an every-push checklist: `pnpm typecheck`, `pnpm test`, `pnpm build`; retain
  applicable UI/package release checks for Storybook and publishing.

## Document Convergence

When creating docs, changing documented truth, or completing a feature/phase,
read `docs/policy/shared-rules/document-convergence.md` and reconcile the affected
facts and references. Preserve decision rationale and original evidence; do not
turn routine development into a whole-repository cleanup.

## Website Release Entry

Only after an explicit website release request and the relevant local gates:

1. Use a clean, committed candidate. Run required manual Actions acceptance for
   that exact commit, if the project requires it; failure blocks publication.
2. Confirm Vercel binding to `swimmer-ui-kit` (`pie-0f420159`); use
   `vercel link --project swimmer-ui-kit --scope pie-0f420159` if unbound.
3. Create a production-configured candidate with
   `vercel deploy --prod --skip-domain --yes --scope pie-0f420159`.
   This is paid release work; it must not run during ordinary edit/push.
4. Verify the returned deployment URL with the project's smoke checks, then
   `vercel promote <verified-deployment-url> --scope pie-0f420159`.
   Promote that artifact; do not rebuild, guess a URL, or promote after failure.

Existing package publishing or backend migration gates remain separate.

## 3.0 Source And Task Routing

- Components own folders under src/controls, feedback, containers, game and icons; implementation, CSS, tests, optional story and short README stay together.
- Tokens live only in src/tokens; flat path drawing is controls/DropletSurface. Liquid geometry/budget is src/liquid, optional melt/Bend is src/liquid-effects, presence/anchor/reveal is src/presence, preview is separate.
- src/index.ts and the named package leaves are the public membership authority. Do not add compatibility barrels, product stores or a second theme engine.
- For component choice read docs/reference/component-selection-guide.md. For visual/interaction work read docs/reference/theme-and-liquid.md; token changes also read docs/reference/design-tokens.md. Breaking changes update the generator-backed docs/reference/migration-3.0.md, not a second hand-written table.
- S0–S14 are completed and the plans live under docs/plans/completed. Version 3.0.0-rc.1 was published to next via run 37173677049; latest stayed 2.14.0. Those publication approvals are consumed, not standing authority for another npm-publish run or product rollout. Formal 3.0.0 and downstream acceptance require their own authorization; University acceptance belongs to Claude in that repository.
