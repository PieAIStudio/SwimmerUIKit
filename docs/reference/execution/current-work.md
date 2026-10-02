---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-10-02
domain: meta
tags:
  - current-work
  - navigation
pinned: true
related:
  - SPEC-0001
  - SPEC-0002
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
---

# Current Work

This file is the current project work index. It is not the agents-routing algorithm.

## Current Focus

- **3.0 大手术（进行中，Codex 执行）**：按 [PLAN-UIKIT-3-RESTRUCTURE](../../plans/active/PLAN-UIKIT-3-RESTRUCTURE.md)
  分阶段做：目录与拆分、样式拆分、删除与收窄、主题、文档与治理、发布候选。
  Owner 2026-10-01 批准，干净断代不留兼容层；D1 移出 OwnMySpace 专用工具、D2 删零使用件、D3 融化弯曲另设子入口。
  主题（Owner 2026-10-01 定稿）：普通控件是二维水滴（平、没有厚度、水滴边「一点点」、按下像水一样摊开，用路径画）；CTA 是唯一的液体，颜色潮汐。
  六套风格（彩色、淡彩、雾色、灰阶、包边、黑白包边）全部保留，存成一个原件加 `data-game-ui-style` 的六个 token 块；默认 pastel。University 孩子用淡彩、大人用灰阶。
  执行期间 Claude 不改本仓库代码，只做阶段评审。
  Owner 补充批准（2026-10-01）：S3 将深色主题取值统一为 `dark`，旧值只由迁移检查器报错、不再兼容；S1–S3 各阶段验收后直接提交推送，S4 做完并生成对比页后、提交前停下交 Claude 评审。
  - **S0 完成（2026-10-01）**：基线 `9d6f2d3`；源码 66 文件 / 20,069 行，公开 295 名字（132 值、163 类型），482 测试全过，dist 4,315,930 bytes。`verify`、`docs:check`、`build-storybook` 通过；144 个故事的浅色 / night、DPR 1 共 288 张截图及原始构建保存在 `.scratch/baseline/`（不提交），图集入口 `.scratch/baseline/index.html`。未改变组件外观；检查只去掉重复编译工作，未放宽断言或超时。
  - **S1 完成（2026-10-01）**：14 个大模块按职责拆分、文件用 `git mv` 归位，补齐 73 份组件短说明；355 处声明核对一致，295 个公开名字及种类不变。`verify`（77 文件 / 492 测试）、`docs:check`、`build-storybook` 全过；S0 原构建与 S1 构建在同一 Firefox、DPR 1、固定动画时刻重拍的 288 张图逐字节一致，原始 Chromium 基线未覆盖。验收在 `.scratch/s1/consistent-v9/`，对照在 `.scratch/baseline/consistent-v9/`，数字在 `.scratch/s1/final/metrics.json`；未改主题取值或组件外观。提交 `1e720ba`，已推送。
  - **S2 完成（2026-10-02）**：样式按组件归位，公开 CSS 引入路径不变；993 条编译后原子规则等价，288 张故事截图与 S0 对照逐字节相同。`verify`（78 文件 / 496 测试）、`docs:check`、`build-storybook` 通过，日志与规则对照在 `.scratch/s2/`。未改名字、主题取值或外观。提交 `38ca91c`，已推送。
  - **S3 完成（2026-10-02）**：删除建造、施工、资产库和金属按钮；融化/弯曲与展厅分别进入可选子入口，默认包和涟均不包含其实现，四入口共用一个预算所有者。根入口 132 名字；迁移表 172 条（166 名字、6 参数/主题/样式），包含 Owner 指定的 dark 断代和五个已知产品，CLI 对旧主题取值报错。University 已用的 GameMaterialSwatches 抽为通用控件保留。`verify`（73 文件 / 460 测试）、`docs:check`、`build-storybook` 通过；删去的 25 个故事有清单，其余 238 张图与 S0 对照逐字节一致。证据 `.scratch/s3/visuals-final/`，迁移入口 [migration-3.0](../migration-3.0.md)。未进入 S4 主题改样。

- **2.14.0 液体光感，已发布**：所有带光泽的液体上边缘去锯齿（高光收进边缘一个像素）；
  新增 `LiquidFill`（上浅下深的彩色液体光）和 `LiquidSurface` 的 `gloss`、`outline`；
  「涟」的水滴和 material 面板改成上浅下深加贴着轮廓的淡影子，面板去掉凸起的边。
  Owner 2026-10-01 批准发布，并要求仓库只留一条主线：旧分支 `feat/liquid-reveal-review`
  已存为标签 `archive/liquid-reveal-review` 后删除。
  Trusted Publishing `36782825247` 成功，源 `287cb0d`；`npm view` 回读 `latest` 为 2.14.0。

- **WO-UI-1，2.13.0 已发布**：铜牌皮肤、验证码输入、竖排页签和独立动作列表行。
  Trusted Publishing `36571436773` 成功，源 `ad3fd30`；官方 tarball 的完整性和新 API 已回读。
  482 测试、三浏览器、八张验收图及发布证据见
  [收口记录](../../plans/completed/wo-ui-1-account-controls.md)。其他产品依赖保持原样。

- **Published 2.12.0 for University V7 task 05 (2026-09-29):** optional,
  explicitly enabled device tilt for the existing collectible card, plus
  reduced-motion/drag cleanup. The approved task calls for publishing the
  shared capability before product adoption. Trusted Publishing run
  `36557905337` succeeded for source
  `78d86dd19101b5dbf9c8a1eca7ab2209a933e0bd`; the official registry tarball was
  read back, its SHA-512 matched, and the new public declarations were checked.
  Exact receipt: `.devspace-reports/card-orientation/registry-receipt.json`.
  No website deployment occurred. The API and sensor boundary live in the
  design guide, not a product-specific copy.

  Local acceptance: `pnpm verify` 74 files / 464 tests; documentation, built
  Storybook/site, publint and ESM-only package types passed. Built ordinary
  catalogue checks passed Chromium (31 scenarios), Firefox (31) and WebKit
  (29, with its existing capability exclusions). The new built card passed
  pointer tilt, keyboard flip and reduced motion at 1280 and 390px; screenshots
  and the exact source-gate log are under
  `.devspace-reports/card-orientation/`. Sensor/permission results are explicitly
  synthetic browser contracts, not physical-device acceptance.

- **2.11.0 release (Owner approved 2026-09-28):** `GameSplash`,
  `GameCollectibleCard` / `GameCollectibleCardSlot`, `playGameCardRevealSound`,
  and the Nerve 0.6 paired liquid fix from `7b52319` (styles in `swimmer-ui`,
  labels avoid open panels). Published from main through `npm-publish`; the
  official registry read on 2026-09-29 includes 2.11.0.

- Nerve 0.6 paired **fix, included in 2.11.0**: optional liquid CSS is in `swimmer-ui`,
  matching ordinary controls. LiquidAnchor reports its occupied rectangle to
  the same family's destination labels; labels avoid panels instead of requiring
  host z-index workarounds. One bounded layout registry, no task/model state.
  A Kit GameButton with `data-game-ui-control="liquid-presence"` delegates paint
  to its contained liquid body, retaining native interaction. This is the
  historical paired change, not another pending release.

**Published 2.10.0:** the optional liquid leaf now supplies interactive guide
content, expanded selection comparison, companion motion, `LiquidAnchor` and
`LiquidReveal`. Ordinary controls and omitted-option defaults stay unchanged.
NerveKit 0.3.0 consumers must use this released renderer for these options:
2.9.0 can silently ignore extra props supplied through a JSX spread.

Release source `4a448c34ec9abf75c33f094fa69de8c74014f4bc`, Trusted Publishing
run `36092614508`, completed successfully. Independent official-registry
readback verified the actual tarball, SHA-512 and declarations. Local verify
passed 421 tests, Storybook build, documentation, publint and ESM-only type
checks. Exact receipt: `.devspace-reports/liquid-interaction-release-20260924/registry-receipt.json`.
No product deployment, model request or media/microphone activation is implied.

The existing liquid source and authoring evidence were preserved, not rewritten
for publication. Contracts remain in the design guide; finite guidance,
personalization and approved selection edits belong to Nerve and its host.
Directing is validating the paired published packages in its own repository.

## Earlier checkpoints (not pending releases)

- Completed and published as **2.9.0**: **Liquid Presence** adds the optional `./liquid-presence`
  renderer and CSS leaf for an existing assistant's grounded split/fly/dock/return
  gesture. It reuses the liquid geometry, material and budget, not another agent
  or media connection. Usage lives in the design guide; the single cross-project
  plan and preview evidence belong to SwimmerNerveKit's
  `docs/plans/completed/liquid-presence.md`. The package source and registry
  tarball keep ordinary controls on their existing defaults.

- **2.9.0 release receipt:** source commit `371149c965fc46c4ed9bdc7f02183d3c30ee48f9`,
  Trusted Publishing workflow `35622503148` completed successfully, and the
  official npm registry returned integrity
  `sha512-2V/a4LwHAKlBJ58PO5TaN4vykFiy3tvt4G01wFr9AQvgLhZbbyrZAadHaVdGNyRgv64RvSSZR0VSYyjCoFAHmw==`.
  The registry tarball was read back and contains `dist/liquid-presence.js`,
  `dist/liquid-presence.d.ts` and `dist/liquid-presence.css`.

- Active: **2.7.0 optional contextual help**, requested by Directing's creator
  feedback across backup, navigation and writing panels. `GameHelpTip` composes
  maintained Floating UI interaction/positioning with brand tokens and a native
  non-submit control. Existing tooltip and dialog APIs remain compatible.
  Local verification passes 365 tests, docs, production CSS/JS, Storybook and
  publint/type packaging. A real 390px touch browser opened help within a native
  modal, then Escape dismissed only help; its screenshot was inspected.
  Evidence: `.devspace-reports/creator-help/`. The old zero-runtime-dependency
  test failed first, then was explicitly changed to an exact one-dependency
  allowlist for this reviewed feature, not removed. Publication/consumer
  acceptance remain separate from these local results.

- Completed: **2.6 liquid controls and beginner catalog, delivered as 2.6.1**,
  authorized after the 2.5.0 research delivery. Scope, current gates, real npm
  tarball/type checks and live-site evidence are in
  [PLAN-0004](../../plans/completed/PLAN-0004-liquid-controls-and-catalog.md).
  Use 2.6.1: it fixes the compiled-CSS press regression found while accepting
  2.6.0. Both registry and live interaction checks passed; no University migration
  was performed. No unfinished implementation or release task remains in this unit.

- Completed: **2.5.0 discoverability and maintainability release**.
  npm publication, live showcase checks and remaining boundaries are recorded in
  [the completed closeout](../../plans/completed/PLAN-0003-component-discovery-2.5.0.md).
  Version truth is `package.json`; release changes are in `CHANGELOG.md`.
  No export/subpath restructure, liquid-engine rewrite or consumer migration.
  There is no ongoing implementation task from this release.
- Primary entry: [component selection](../component-selection-guide.md).
  The generated [API inventory](../public-api-inventory.md) is the exhaustive
  index, not the beginner's first reading assignment.
- Current consumer proof target: University can pin all three packages from
  2.5.0 to 2.6.1 without changing existing imports; optional custom-CTA adoption follows
  the [upgrade playbook](../usage-and-upgrade-playbook.md). University owns its
  routing transition and product regression; this repository does not perform it.
- [Earlier research](../liquid-next-stage-research.md) retains decisions and
  deferred donor experiments. Actual API/material truth belongs in the design
  guide; unadopted image optimizations remain research.
- SPEC-0001/0002 are provenance for earlier packaging and design-system work;
  their old version targets are not this release's checklist.
- Runtime-dependency boundary: existing dialogs and ordinary controls remain
  native. 2.7.0 adds the reviewed Floating UI React dependency only for contextual
  help: current CSS-only tooltip cannot provide touch dismissal, collision
  avoidance and modal-aware portals. It does not replace native dialogs or the
  liquid renderer. Native popover was considered but does not alone provide the
  required hover/focus/click composition and viewport positioning across hosts.
- Distribution direction: public npmjs package plus a publicly readable GitHub
  repository under the PieAI Limited Use License. Releases use the manual
  `npm-publish.yml` Trusted Publishing workflow; no long-lived npm write token.

## Reading Order

1. `docs/reference/component-selection-guide.md` — choose by task.
2. `docs/reference/design-system-guide.md` — tokens, theming, motion, a11y,
   tailwind bridge, wrapped-app rules.
3. `docs/reference/usage-and-upgrade-playbook.md` — consumers + release SOP.
4. `CHANGELOG.md` — release history and migration notes.

## Verification

`pnpm verify` (includes generated API drift check and current tests) ·
`pnpm docs:check` · `pnpm build-storybook` · `pnpm build:site` · `npx publint` ·
`npx @arethetypeswrong/cli --pack . --entrypoints . ./package.json --profile esm-only`.
Use current command output for test counts; do not add historical totals together.

## Completed Proof History

Completed plans and specs live in:

- `docs/plans/completed/`
- `docs/specs/completed/`

Do not move completed work back into active. Create a new plan and link the completed record as provenance.
