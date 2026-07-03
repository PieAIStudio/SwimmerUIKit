---
id: SPEC-0002
title: 1.0 Release Readiness
type: spec
status: active
canonical: true
owner: h
created: 2026-07-03
last_reviewed: 2026-07-03
domain: product
tags:
  - release
  - packaging
  - mobile
  - tailwind
  - semver
related:
  - SPEC-0001
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
---

# SPEC-0002: 1.0 Release Readiness

## What "1.0" Means Here

1.0 不是功能数量的奖杯，是一份稳定性合同：

1. **API 冻结为合同**：导出的组件与 props、`.game-ui-*` 类名、
   `--game-ui-*` token 名，从 1.0 起只增不删；破坏性变更必须走 major。
2. **打包正确性由机器判定**：`publint` 与 `arethetypeswrong` 全绿，
   消费方零构建工具假设（不要求 Tailwind，不要求任何 CSS 处理器）。
3. **运行目标扩展为合同**：浏览器 + 套壳移动端（Capacitor 类 WebView）
   + 套壳桌面端（Tauri 类）都是一级公民，触控/安全区/hover 语义按
   输入能力（pointer/hover media queries）适配，不按平台嗅探。

## Problem（0.9.0 审计结论，2026-07-03）

1. **Tailwind 硬耦合是假的但代价是真的**：`theme.css` 顶部的
   `@theme inline` 桥被原样发进 `dist/styles.css`；组件零 Tailwind
   工具类，六个消费方也零人使用桥接类名（`bg-primary` 等，已 grep
   证实），但 peerDependencies 强制所有消费方装 `tailwindcss` +
   `@tailwindcss/vite`，且无 Tailwind 管线的消费方（Vite 8 /
   lightningcss）报 unknown at-rule 警告。桥是死重。
2. **类型分发是坏的**：`src/index.ts` 的 `import './styles.css'` 被
   tsc 发射进 `index.d.ts`（attw: Internal resolution error）；CJS
   条件复用 ESM 的 `.d.ts`（attw: Masquerading as ESM；publint 同报）。
   而 dist JS 里根本没有 CSS import（Vite lib mode 已剥离）。
3. **包内容不干净**：`*.test.d.ts`、`stories/*.d.ts`、`.DS_Store`
   全部被发布。
4. **套壳就绪缺口**：全库零 `touch-action` / `-webkit-tap-highlight-color`；
   hover 位移效果未加 `(hover: hover)` 守卫（触屏上产生粘滞 hover）；
   一处直接用 `env(safe-area-inset-*)` 绕过 `--game-ui-safe-*` token
   （Capacitor Android edge-to-edge 下 env() 可能为 0，需要 token
   作为宿主可覆写的注入点）。

## Decisions

- **D1 ESM-only**：删除 CJS 产物与 require 条件。依据：全部消费方为
  Vite ESM（已 grep 证实零 require），Node ≥22 原生 `require(esm)`。
  这结构性消灭 publint/attw 的全部类型分发问题。
- **D2 纯 CSS 主样式**：`@theme inline` 桥从 `theme.css` 移出为独立
  `src/tailwind-bridge.css` → 发布为 `./tailwind.css` 可选导出；
  `dist/styles.css` 100% 标准 CSS、warning-free。Tailwind 相关
  peerDependencies 全部删除；kit 自身构建（vite/storybook）也移除
  Tailwind 插件。守卫测试：主 CSS 禁 `@theme|@tailwind|@plugin|@apply`。
- **D3 入口不再副作用引 CSS**：删 `index.ts` 的 `import './styles.css'`
  （dist 行为不变，d.ts 变干净）；样式仍由消费方显式
  `import '@pieai/swimmer-ui-kit/styles.css'`（现状即如此）。
- **D4 套壳硬化**：交互控件加 `touch-action: manipulation` +
  `-webkit-tap-highlight-color: transparent`；游戏控制面（movement
  pad / 工具条）加 `user-select: none`；hover 位移效果包
  `@media (hover: hover)`；所有安全区一律走 `--game-ui-safe-*` token
  （宿主可在 Capacitor Android 注入覆写）；`(forced-colors: active)`
  最小基线（控件/面板保边框）。
- **D5 API 冻结，零改名，零新组件**：改名对 3 个活跃消费方是纯破坏
  零收益；基础件（Slider/Toggle/Progress/Tabs/Modal/窗口/伸缩）已齐，
  新组件继续走"两个产品需要才上游"规则。
- **D6 包卫生**：tsconfig.build 排除 tests/stories；清 `.DS_Store`；
  exports 增加 `"./package.json"`；删除易混淆的 `./theme.css` 别名
  （映射到 styles.css 的历史遗留，零消费方使用）。
- **D7 合同工件**：新增 `CHANGELOG.md`；README 重写（删除"expects
  Tailwind"）；playbook 增补 ESM-only 与 tailwind 桥迁移说明。

## Non-Goals

- 不做 RTL/逻辑属性改写（英文市场，成本>收益，记为未来项）。
- 不引入运行时依赖、不引入 DTCG 管线、不引入 Base UI（沿用
  SPEC-0001 记录的未来出口条件）。
- 不改任何组件视觉。

## Acceptance

- `publint` 0 警告；`attw --pack` 主入口全绿（CSS 子路径除外，工具
  不解析 CSS）。
- `dist/styles.css` 经 lightningcss 处理 0 警告。
- `pnpm typecheck/test/build/build-storybook/docs:check` 全绿；
  守卫测试覆盖 D2/D4 的机器可判定部分。
- 双主题截图与 0.9.0 视觉一致。
- 版本 `1.0.0`，CHANGELOG 记录 0.8→1.0 与迁移说明。
