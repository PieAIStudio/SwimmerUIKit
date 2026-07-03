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
- `docs/solutions/` stores Compound Engineering learnings, organized by category with YAML frontmatter (`module`, `tags`, `problem_type`); relevant when implementing, debugging, or making release workflow decisions in documented areas.
- `CONCEPTS.md` (repo root, ungoverned) holds shared domain vocabulary (clay, token layers, guard tests, central kitchen model); relevant when orienting to the design system or discussing its concepts.

## Routing

- Superpowers is the default engineering workflow.
- Compound Engineering is used by default only as the post-work Compound Gate through `ce-compound`; full CE workflows require an explicit user request.
- PGS Stop hooks are wired for Codex, Claude Code, and Antigravity. Before final reporting after completed engineering work, report `Compound Gate: ran ce-compound -> <path>` or `Compound Gate: skipped -> <reason>`.
- External workflow systems run inside this router. They must not replace it.

<!-- PGS-ROUTER:END -->

## Project Scope

SwimmerUIKit is a standalone React and TypeScript game UI package for Pie game surfaces.

- It owns reusable UI components, visual tokens, CSS variables, asset helpers, Storybook surfaces, and package distribution for `@pieaistudio/swimmer-ui-kit`.
- It does not own host app runtime scene code, R3F state, persistence APIs, product-specific asset manifests, or consuming app stores.
- Verification commands: `pnpm typecheck`, `pnpm test`, `pnpm build`, and UI/package-specific checks when release work touches Storybook or publishing.
