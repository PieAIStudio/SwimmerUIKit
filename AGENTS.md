# SwimmerUIKit AI Router

## PGS Router Block

<!-- PGS-ROUTER:BEGIN v1.1 -->

## Startup Reading

`README.md` is the human-facing project introduction. Do not use it as the default AI startup path unless the task is about project positioning, public explanation, or the README itself.

1. All Markdown files under `docs/policy/**/*.md`, including files in
   subdirectories and symlinked shared-rule files.
2. `docs/policy/shared-rules/brand-kit-first.md`. This repository is the UI
   brand kit; missing shared 2D UI belongs here, not in a product fork.
3. `docs/governance/boundary.md`
4. `docs/governance/agents-routing/engineering-runtime-v1.1.md`
5. `docs/reference/execution/current-work.md`
6. Before non-trivial implementation, debugging, release, architecture, or
   migration work, run `pro-gov learn recall --query "<task summary>"` and read
   any relevant prior-learning hits before changing files.

When the task creates, edits, moves, deletes, or governs documentation, also
read `docs/governance/ssot-v1.1.md`,
`docs/governance/doc-agent-rules.md`, and `docs/governance/doc-types.md` before
changing governed files.

## Governance

- Adopted profile: `engineering-runtime`.
- Use doc-gov for governed Markdown.
- Governed Markdown lives under `docs/**` by default.
- Product artifacts outside `docs/**` are not governed docs unless this project explicitly opts them in.
- Before creating docs: `pnpm doc-gov find <topic>`.
- For component choice, start at `docs/reference/component-selection-guide.md`.
- `CONCEPTS.md` is the retained vocabulary-tool entry; it points to the theme, token, selection and migration references rather than defining their facts again.

## Routing

- Codex and this router own normal execution. Optional skills run only when a narrow task-specific trigger matches.
- Matt skills may remain available unchanged; there is no bootstrap skill or mandatory workflow owner.
- Recall relevant learnings before non-trivial work. After verified work, use `capture-learning` only when a non-obvious reusable lesson exists.

## Credentials And Local Environment

For credentials, login or local environment files, first read
`<portfolio-root>/.secrets/README.md`, then
`docs/policy/shared-rules/cloud-platform-access.md`. Use the project's existing
adapter and recorded central location; do not assume secrets belong in this repository.

<!-- PGS-ROUTER:END -->

## Three-Stage Delivery

<!-- PGS-DELIVERY:THREE-STAGE -->

1. **Edit locally.** Run relevant local checks with isolated data and mocks; do
   not start paid external validation during ordinary development.
2. **Verify, then push.** Pass the checks appropriate to the changed surface
   before pushing. Ordinary push/PR saves code; it must not start hosted Actions
   or Vercel preview/production deployments.
3. **Release explicitly.** A release request may continue through cloud acceptance
   and publication within the agreed budget. Check credentials, environment and
   candidate readiness first; failed or missing required evidence blocks release.
   Publish only the tested source/artifact. Reuse results only while source,
   dependencies, relevant environment and retained artifacts remain valid.

An explicitly requested preview/staging acceptance belongs to stage 3. An edit
or push request stops at stage 2. Do not relabel routine saves as release requests.
Repeated failures require a smaller reproducer, logs and a relevant fix or new
evidence before rerunning; do not loop whole suites or silently raise budgets.
Keep existing release/security gates and production runtime monitoring. These
rules govern engineering validation, not separately authorized creative production.


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
- Verification commands: `pnpm typecheck`, `pnpm test`, `pnpm build`, and UI/package-specific checks when release work touches Storybook or publishing.

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
