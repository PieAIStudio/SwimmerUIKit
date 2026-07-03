---
id: SPEC-0001
title: Design System Hardening and Panel System
type: spec
status: active
canonical: true
owner: h
created: 2026-07-03
last_reviewed: 2026-07-03
domain: product
tags:
  - design
  - tokens
  - theming
  - panel-system
  - accessibility
pinned: false
related: []
---

# SPEC-0001: Design System Hardening and Panel System

## Problem

SwimmerUIKit 0.8.0 的架构方向正确（CSS 变量 token、零运行时依赖、下游
按变量覆写主题），但 2026-07-02 审计发现四个断层：

1. **token 化不完整**：`styles.css` 有 166 处裸色值绕过 token。下游改
   `--game-ui-accent` 时，按钮渐变、tint 背景、边框等硬编码色不跟随，
   主题覆写只有半张脸生效。TuringPact 被迫维护 651 行覆写文件对抗它。
2. **暗色主题缺席**：TuringPact 已在下游手搓暗色酒馆风，证明需求真实，
   但库没有官方暗色基线可继承。
3. **面板行为缺失**：消费产品的面板都是"直接出现/消失"，没有伸缩、
   最小化、最大化等游戏式窗口行为；`GameDialog` 只是内联卡片，不是
   真正的模态（无焦点陷阱、无 Esc、无顶层渲染）。
4. **a11y 断点**：Tabs 无键盘方向导航，focus 环不统一，tooltip 无
   焦点/触屏支持。

## Requirements

### R1 Token 完整化（单一真相）

- `theme.css` 是唯一 raw 颜色来源；新增派生 token 用 `color-mix()`
  （2026 Baseline）从语义 token 计算 tint/wash/渐变端点，使下游覆写
  一个语义变量即可全局级联。
- `styles.css` 组件规则不得包含裸 hex/rgba；由守卫测试强制。
- TS token（`clay/tokens.ts`）继续镜像 CSS 变量名；主色 hex 与
  `theme.css` 的一致性由测试校验，防两套真相漂移。
- 不引入 DTCG/style-dictionary 构建管线：当前无多设计工具协作场景；
  DTCG（2025-10 首个稳定版）记录为未来与设计工具互通时的出口。

### R2 官方 night 主题

- `[data-game-ui-theme='night']` 作用域覆写语义 token，提供暗色基线
  （取材 TuringPact 酒馆风），作为"下游主题化"的官方示范。
- 默认主题不变；night 为 opt-in。

### R3 游戏面板系统（新增组件，只增不改）

- `GameCollapsiblePanel`：可伸缩面板。grid-template-rows 0fr/1fr 动画
  （全浏览器兼容），受控/非受控两用，reduced-motion 降级。
- `GameWindowPanel`：游戏窗口。normal/minimized/maximized 三态，标题栏
  动作按钮，clay 弹性缓动（沿用 motion token），最小化态为可还原
  chip；状态受控 + onStateChange。
- `GameModal`：基于原生 `<dialog>` + `showModal()`——浏览器原生提供
  焦点陷阱、Esc 关闭、top-layer、backdrop 与焦点归还；clay 皮肤 +
  reduced-motion。`closedby` 属性仅作渐进增强。
- 既有组件 API 不改；`GamePanel`/`GameDialog` 保持原语义（文档注明
  GameDialog 是内联卡片，模态请用 GameModal）。

### R4 运行时依赖决策

- 保持零运行时依赖。理由：消费方是有包体预算门的游戏产品（Show 有
  总 JS 预算上限），且 2026 浏览器基线（dialog/popover/color-mix/
  cascade layers）已覆盖本批需求。
- Base UI 1.0（2025-12，MUI 维护）记录为未来需要复杂 headless 组件
  （combobox/multiselect 等）时的第一候选，不预装。

### R5 a11y 硬化与审美微调

- GameTabs：方向键 roving tabindex + aria-controls。
- 统一 `:focus-visible` 环（focus-ring token），移除不一致的 outline。
- GameTooltip 支持键盘焦点显示。
- `color-scheme`、`::selection` 与面板滚动条的 clay 化。
- 视觉只做微调，保持既有 clay 气质（创始人明确喜欢当前基调）。

### R6 CSS 分层

- 组件规则包进 `@layer swimmer-ui`（cascade layers 为 Baseline），
  使下游未分层的覆写天然获胜，摆脱 import 顺序和选择器权重竞赛。
- 在升级说明中标注该行为变化（下游覆写会更容易生效）。

## Acceptance

- [ ] `grep -E '#[0-9a-fA-F]{3,8}|rgba?\(' src/styles.css` 除注释外为 0 命中（守卫测试固化）。
- [ ] TS/CSS token 一致性测试通过。
- [ ] night 主题在 Storybook/preview 可切换查看。
- [ ] 三个新组件各有 story 与浏览器测试（含 reduced-motion 与键盘路径）。
- [ ] `pnpm typecheck`、`pnpm test`、`pnpm build`、`pnpm build-storybook` 全绿。
- [ ] 既有导出 API 无删除、无签名破坏（0.9.0 为纯增量升级）。
- [ ] 使用/主题/升级文档落在 `docs/reference/`，current-work 填充。
