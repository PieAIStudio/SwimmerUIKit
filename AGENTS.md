# SwimmerUIKit AI Router

## PGS Router Block

<!-- PGS-ROUTER:BEGIN v0.9 -->

## Startup Reading

`README.md` is the human-facing project introduction. Do not use it as the default AI startup path unless the task is about project positioning, public explanation, or the README itself.

1. All Markdown files under `docs/policy/**/*.md`, including files in
   subdirectories and symlinked shared-rule files.
2. `docs/governance/boundary.md`
3. `docs/governance/ssot-v0.9.md`
4. `docs/governance/doc-agent-rules.md`
5. `docs/governance/doc-types.md`
6. `docs/governance/agents-routing/engineering-runtime-v0.9.md`
7. `docs/reference/execution/current-work.md`

## Governance

- Adopted profile: `engineering-runtime`.
- Use doc-gov for governed Markdown.
- Governed Markdown lives under `docs/**` by default.
- Product artifacts outside `docs/**` are not governed docs unless this project explicitly opts them in.
- Before creating docs: `pnpm doc-gov find <topic>`.
- `docs/solutions/` stores compact reusable learning records; relevant when implementing, debugging, or making release workflow decisions in documented areas.
- `CONCEPTS.md` (repo root, ungoverned) holds shared domain vocabulary (clay, token layers, guard tests, central kitchen model); relevant when orienting to the design system or discussing its concepts.

## Routing

- Codex and this router own normal execution. Optional skills run only when a narrow task-specific trigger matches.
- Matt skills may remain available unchanged; there is no bootstrap skill or mandatory workflow owner.
- Recall relevant learnings before non-trivial work. After verified work, use `capture-learning` only when a non-obvious reusable lesson exists.

<!-- PGS-ROUTER:END -->

## Project Scope

SwimmerUIKit is a standalone React and TypeScript game UI package for Pie game surfaces.

- It owns reusable UI components, visual tokens, CSS variables, asset helpers, Storybook surfaces, and package distribution for `@pieai/swimmer-ui-kit`.
- It does not own host app runtime scene code, R3F state, persistence APIs, product-specific asset manifests, or consuming app stores.
- Verification commands: `pnpm typecheck`, `pnpm test`, `pnpm build`, and UI/package-specific checks when release work touches Storybook or publishing.
