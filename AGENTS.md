# SwimmerUIKit AI Router

## PGS Router Block

<!-- PGS-ROUTER:BEGIN v1.1 -->

## Boundary

- PGS governs this `AGENTS.md` entry and governed Markdown under `docs/**`.
- `AGENTS.md` is the canonical project router; `CLAUDE.md` must be the exact
  relative symlink `AGENTS.md`.
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

1. **Edit locally.** Run relevant local checks with isolated data and mocks; do
   not start paid external validation during ordinary development.
2. **Verify, then push — related checks only.** For the complete outgoing change
   range against the target base, tooling selects checks automatically from
   changed paths and dependency relationships, not a hand-picked test list:
   formatting, lint, type checks and unit tests for affected packages, plus the
   browser tests affected by the change. Documentation-only changes run their
   relevant document/governance checks, not unrelated engineering suites.
   Do not run repository-wide full verification, the entire browser suite or
   the entire timing suite before an ordinary push or merely to finish a task.
   Any failing related check blocks the push. Ordinary push/PR saves code; it
   must not start hosted Actions or Vercel preview/production deployments.
3. **Release explicitly — full suite for the release candidate.** Only before
   an authorized release, run all applicable unit tests, browser tests, timing
   tests and full verification once for that exact candidate. Any failure or
   missing required evidence blocks release. Keep existing release/security
   gates and production runtime monitoring. Check credentials, environment and
   budget before cloud acceptance/publication; publish only the tested source
   or artifact. Reuse results only while source, dependencies, relevant
   environment and retained artifacts remain valid.

Dependency-based browser selection (for example Playwright
`--only-changed=<ref>` where supported) sees changed tests and their imports;
it does not infer application-source-to-browser-test coverage when tests do not
import the application. Each project must therefore supply a maintained source
path-to-test mapping or a fixed smoke set, used by the selector, and document
its blind spots. Missing selection evidence is a gap to report, not proof that
zero tests cover the change and not a reason to silently run the full suite.

Never use `--no-verify`, bypass hooks, or rerun failures merely to obtain green.
Investigate failures with a smaller reproducer and retain the original result;
rerun only after a relevant fix or new evidence. Do not add nightly full runs:
full suites belong only to pre-release validation. Delivery reports name the
selected related checks, their selection basis, results and coverage limits.
An explicitly requested preview/staging acceptance belongs to stage 3. An edit
or push request stops at stage 2; do not relabel routine saves as releases.
These rules govern engineering validation, not separately authorized creative
production, and do not introduce engineering tests for unrelated prose.


### Fast Release Gate

<!-- PGS-DELIVERY:FAST-RELEASE -->

A full run is paid once per candidate: make it fail early and never pay twice
for the same mistake. Each project implements these with its own commands.

- **Preflight before queuing.** Before waiting for a heavy-work lock, run a
  light preflight (about a minute) that checks the candidate and worktree,
  required environment flags, budget files and credentials by name, and the
  cheap deterministic global checks. A failed preflight never enters the queue.
- **Cheapest first, stop at the first red.** Run fast deterministic checks and
  a small fixed smoke set (navigation, sign-in, the main phone screen) before
  long unit and browser stages.
- **After a red: narrow, fix, then one full run.** Keep the original result,
  reproduce the single failure, fix it, and verify the failing test plus what
  the fix affects. Narrow runs are diagnosis, never release evidence. Then run
  the full suite once on the fixed candidate, reusing passed results only where
  the project can prove their inputs are unchanged.
- **Close the gap that let it through.** When a release-only red could have
  been caught before push, the same fix adds the missing source-to-test mapping
  or moves the cheap check into the push gate.
- **Separate waiting from working.** Release receipts record queue/lock wait
  and each stage's execution time separately; speed claims name what they
  measured.
- **Reuse proven results; balance long suites.** A project whose full run takes
  more than about 30 minutes must keep a result-reuse record: each passed check
  is stored with the identity of its inputs (source, test code, dependencies,
  fixtures, content, tool versions, relevant config and built artifacts), and a
  later full run re-executes only checks whose identity changed. Timing tests,
  live paid-AI tests and production read-backs are always re-executed. It must
  also split long test files so parallel workers finish close together.


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

- This repository is a brand kit. Read `docs/policy/shared-rules/brand-kit-first.md`.
  Missing shared UI capability is added here, published, then consumed.

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
