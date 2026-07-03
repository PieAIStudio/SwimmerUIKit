---
id: REF-DESIGN-SYSTEM-GUIDE
title: Design System Guide
type: reference
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
  - accessibility
pinned: true
related:
  - SPEC-0001
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
---

# REF-DESIGN-SYSTEM-GUIDE: Design System Guide

## Purpose

SwimmerUIKit 设计系统的唯一说明书：token 架构、主题化配方、动效与
无障碍规则。改视觉先读本文，别直接往组件里写色值。

## Token 架构（三层）

初学者比喻：token 系统像颜料店。**语义层**是"客厅墙漆"这种按用途命名
的成品漆；**派生基准**是调色用的原浆；**布景层**是舞台背景幕布专用漆。
组件永远买成品漆，不自己兑颜料。

| 层 | 例子 | 谁可以改 |
| --- | --- | --- |
| 1. 语义 token | `--game-ui-panel`、`--game-ui-accent`、`--game-ui-text` | 下游主题第一目标 |
| 2. 派生基准 | `--game-ui-ink-deep`（深色水洗底）、`--game-ui-border-ink`（描边底）、`--game-ui-text-on-dark` | 下游做完整主题时一起改 |
| 3. 布景/预览 | `--game-ui-scenery-*`、`--game-ui-preview-*` | 一般不用动（demo 舞台专用） |

规则（由 `src/tokens.test.ts` 强制）：

1. **raw 颜色只能住在 `theme.css`**。`styles.css` 里的组件规则只能引用
   token，半透明色一律 `color-mix(in srgb, var(--token) N%, transparent)`
   派生——这样下游改一个语义变量，所有 tint/wash/渐变自动跟随。
2. TS 侧 `CLAY_COLOR_TOKENS` 与 `theme.css` 主色一致性由测试校验
   （内联 SVG 图标无法读 CSS 变量，才需要 TS 常量镜像）。
3. `night` 主题必须覆盖清单内的全部语义色，防止漏 token 漂移。

## 主题化配方（下游怎么改主题）

最小改法（只换品牌色）：

```css
/* 消费项目自己的 CSS，不需要 !important，不需要比选择器权重 */
:root {
  --game-ui-accent: #7c5cff;
  --game-ui-accent-bright: #9b82ff;
}
```

完整暗色主题：参考 `theme.css` 里官方 `[data-game-ui-theme='night']`
块——把语义层 + 派生基准一起覆盖，然后在任意父元素挂
`data-game-ui-theme="night"`（支持局部作用域，如只让酒馆场景变暗）。

自定义第三主题：复制 night 块，换成自己的属性值，如
`[data-game-ui-theme='abyss'] { ... }`。`tokens.test.ts` 的 night 完整性
清单就是"一个主题该覆盖哪些变量"的官方清单。

TuringPact 的 651 行 `clay-overrides.css` 是历史对抗裸色值的产物；
0.9.0 起裸色值已清零，此类覆写应逐步收缩为纯 token 覆写。

## Cascade Layer

组件样式全部包在 `@layer swimmer-ui` 里。**未分层的消费方 CSS 永远
赢过 kit**——覆写不再需要 import 顺序或权重竞赛。Tailwind 消费方若想
让工具类也赢过 kit，在入口 CSS 声明一次层顺序：

```css
@layer swimmer-ui, theme, base, components, utilities;
```

## 动效规则

- 只用 motion token：`--game-ui-motion-fast/base/slow` +
  `--game-ui-ease-pop`（弹性）/`--game-ui-ease-soft`（柔和）。
- 高度伸缩动画用 grid-template-rows 0fr/1fr（全浏览器），
  `interpolate-size: allow-keywords` 作为宽度动画的渐进增强。
- 所有动效必须有 `prefers-reduced-motion: reduce` 降级。

## 无障碍基线

- 焦点：统一 `:focus-visible` 环（`--game-ui-focus-ring`），所有可交互
  类共享一条规则。
- 模态：只用 `GameModal`（原生 `<dialog>`，浏览器提供焦点陷阱/Esc/
  top-layer/焦点归还）。`GameDialog` 是内联卡片，不是模态。
- Tabs：roving tabindex + 方向键/Home/End（ARIA tabs 模式）。
- 触控目标 ≥44px（`CLAY_TARGET_TOKENS`）。

## 面板系统选型

| 需求 | 用 |
| --- | --- |
| 分组内容可收起 | `GameCollapsiblePanel` |
| 游戏内浮动窗口（最小化成 chip/最大化） | `GameWindowPanel`（最大化填充最近的定位祖先） |
| 阻断式确认/表单 | `GameModal` |
| 内联卡片容器 | `GamePanel` / `GameDialog` |

## 未来出口（记录，不预装）

- **DTCG token 管线**（W3C 规范 2025-10 稳定）：当出现 Figma/多工具
  协作需求时，把 theme.css 升级为 DTCG JSON + Style Dictionary 生成。
- **Base UI 1.0**（MUI 维护）：当需要 combobox/multiselect 等复杂
  headless 组件时的第一候选，届时按组件单独引入。

## Related Commands / Files

- `src/theme.css` — 全部 raw 颜色与主题定义
- `src/styles.css` — 组件规则（token-only，@layer swimmer-ui）
- `src/tokens.test.ts` — 三重守卫测试
- `pnpm storybook` — 组件与 night 主题演示
