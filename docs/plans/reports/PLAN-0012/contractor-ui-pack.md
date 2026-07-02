---
id: PLAN-DOCS-PLANS-REPORTS-PLAN-0012-CONTRACTOR-UI-PACK
title: "PLAN-0012 Contractor UI Pack Report"
type: plan
status: completed
canonical: false
owner: project
created: 2026-07-02
last_reviewed: 2026-07-02
domain: project-docs
tags:
  - project-docs
pinned: false
related: []
---
# PLAN-0012 Contractor UI Pack Report

## Summary

完成 SwimmerUIKit 官方 AI contractor / construction robot UI pack。改动只发生在 SwimmerUIKit worktree 内，没有修改 OwnMySpace，没有 publish，没有 commit/push。

包版本准备为 `0.8.0`，因为本 Block 新增了公开组件和类型表面；tag 与 registry 发布由 lead integration 完成。

- workspace root: `/Users/yuanfei/PieAI/SwimmerUIKit`
- worktree: `/Users/yuanfei/PieAI/SwimmerUIKit/.worktrees/plan-0012-contractor-ui-pack`
- branch: `codex/plan-0012-contractor-ui-pack`
- base: `origin/main @ b66c09509f1665b888b71015d5d8c266a23b8cc7`

## Skill ledger

- `loop-library`: Adapt mode. Reused existing SwimmerUIKit game surface primitives and added a bounded contractor-specific composition layer.
- `threejs-game-ui-designer`: Applied game HUD/UI rules: compact state display, readable validation, non-dashboard action hierarchy, mobile drawer, touch-sized controls.
- `ui-ux-pro-max`: Ran design-system search for `AI construction game contractor UI clay responsive`; preserved SwimmerUIKit clay system while using industrial/safety-status clarity for construction states.
- `screenwalk`: Framed this as a mixed game surface. Captured desktop/tablet/mobile/small-mobile Storybook evidence after implementation.

## Added public UI

New official components:

- `GameContractorPanel`
- `GameConstructionJobCard`
- `GameConstructionProgress`
- `GameConstructionApprovalBar`
- `GameRobotCrewStatus`
- `GameBeforeAfterToggle`
- `GameCompactJobDrawer`

New status/type coverage:

- jobs: `draft`, `preview`, `queued`, `working`, `blocked`, `readyForReview`, `accepted`, `cancelled`
- actions: default approve/cancel/revise/revert flows, with per-job override support
- provider boundary badges: `local-only`, `mock`, `paid-disabled`
- validation warnings: success/warning/danger/neutral/ai tones
- crew states: `idle`, `queued`, `working`, `blocked`, `done`
- responsive variants: `desktop`, `tablet`, `mobile`, `small-mobile`

## Files changed

- `src/GameContractorTools.tsx`: component pack and prop contracts.
- `src/GameContractorTools.test.tsx`: SSR tests for states, actions, drawer, progress, crew, before/after.
- `src/stories/GameContractorTools.stories.tsx`: Storybook stories and responsive matrix.
- `src/index.ts`: public exports.
- `src/styles.css`: contractor panel/card/progress/approval/crew/before-after/drawer styles.
- `src/GameUiPreview.tsx`: preview page section for contractor UI.
- `README.md`: export list and usage example.
- `docs/reference/design/contractor-ui-pack.md`: design doc and integration contract.
- `docs/plans/reports/PLAN-0012/screenshots/*.png`: responsive screenshot artifacts.

## Runtime boundary

The UI kit remains data-only. It does not import OwnMySpace stores, scene/runtime code, persistence, generated asset manifests, SwimmerAIKit provider clients, secrets, or paid provider transport. Host apps pass data and receive callbacks.

## Responsive screenshot evidence

Captured from static Storybook using Playwright:

- `docs/plans/reports/PLAN-0012/screenshots/contractor-desktop.png` — 1440×900 story viewport.
- `docs/plans/reports/PLAN-0012/screenshots/contractor-tablet.png` — 768×900 story viewport.
- `docs/plans/reports/PLAN-0012/screenshots/contractor-mobile.png` — 390×844 story viewport.
- `docs/plans/reports/PLAN-0012/screenshots/contractor-small-mobile.png` — 360×740 story viewport.

Lead review 发现首批截图误连到 stale OwnMySpace server，并非 contractor stories；该组证据已作废。四张图片已从隔离端口 `6022` 的准确 Storybook story id 重拍。fresh DOM 检查在四个视口均为 0 console/page errors、0 horizontal overflow、0 clipped buttons/progress values；同时修复了 compact validation card 标题与说明文字粘连的问题。

## Verification

| Command | Result |
|---|---|
| `corepack pnpm install --frozen-lockfile` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | Pass: 18 files, 57 tests |
| `npm run build` | Pass |
| `npm run build-storybook` | Pass |
| Playwright responsive screenshots | Pass: 4 PNGs captured |

Notes:

- Storybook emitted the existing `No story files found for the specified pattern: src/**/*.mdx` notice.
- Vite emitted Storybook chunk-size warnings. Build completed successfully.

## ScreenWalk frame

- surface_type: mixed / game UI surface.
- user: host/player reviewing local contractor or construction robot work.
- goal: read queue status, inspect progress and warnings, compare before/after, approve/revise/revert/cancel, and keep mobile HUD usable.
- evidence level: generated Storybook screenshot artifacts.
- no direction conflict found; implementation stayed within official SwimmerUIKit component ownership.

## Follow-up integration guidance

OwnMySpace should consume these exported components from SwimmerUIKit rather than creating local contractor UI. OwnMySpace should still own construction job state, generated asset placement, validation rules, persistence, and provider boundaries.
