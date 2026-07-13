---
id: REF-DESIGN-SYSTEM-GUIDE
title: Design System Guide
type: reference
status: active
canonical: true
owner: h
created: 2026-07-03
last_reviewed: 2026-07-13
domain: product
tags:
  - design
  - tokens
  - theming
  - accessibility
pinned: true
related:
  - SPEC-0001
  - SPEC-0002
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
4. **`styles.css`/`theme.css` 必须是 100% 标准 CSS**：禁 `@theme`、
   `@apply` 等任何 Tailwind at-rule（1.0 起 CSS 构建用 lightningcss，
   出现任何 warning 直接构建失败）。

## 字体（可选，但强烈建议加载）

`theme.css` 声明的字体栈是 `--game-ui-font-display: 'Baloo 2', 'Geist
Variable', 'Noto Sans SC', ...` 与
`--game-ui-font-body: 'Geist Variable', 'Noto Sans SC', ...`。kit 本身**不
自动加载**这两个自有字体——不引入 `fonts.css` 时，浏览器会静默回退到系统
字体，且 `--game-ui-weight-body: 620`、`weight-strong: 800`、
`weight-title: 930` 这类非标准字重在回退字体下会被就近吸附成 400/700，
视觉层级明显变塌。

加载官方 Latin 子集（Baloo 2 + Geist Variable，可变字体，共约 100KB，
SIL Open Font License，随包发布于 `dist/fonts/`）：

```ts
import '@pieai/swimmer-ui-kit/styles.css';
import '@pieai/swimmer-ui-kit/fonts.css'; // 可选，见下方取舍
```

`fonts.css` 只覆盖 Latin 字符（拉丁字母/数字/常见符号），**不含中文**——
Noto Sans SC 单独一份体积就有数 MB，不适合默认随包发布。产品有中文文案
时自行接入，例如：

```ts
import '@fontsource-variable/noto-sans-sc';
```

不接入 `fonts.css` 也能正常工作（组件不依赖它），只是视觉上退化为系统
字体；这是有意的渐进增强设计，不是打包遗漏。

## GameUiPreview 需要额外的 preview.css（1.1 起）

`GameUiPreview`（kit 自带的组件展厅/token 总账页面）的舞台专用样式——
`.game-ui-preview-*`、`.game-ui-swatch`/`.game-ui-token-*`、
`.game-ui-stage-world`、`.game-ui-proof-frame`、first-session 假摇杆演示等
——不再随 `styles.css` 一起发布。它们只服务于这一个组件，绝大多数消费方
从不渲染它，之前却要为它付出打包体积。渲染 `<GameUiPreview />` 时额外引
一次：

```ts
import '@pieai/swimmer-ui-kit/styles.css';
import '@pieai/swimmer-ui-kit/preview.css'; // 仅渲染 GameUiPreview 时需要
```

不渲染 `GameUiPreview` 的消费方**不用改任何代码**——`.game-ui-*` 组件类
名与 `--game-ui-*` token 名都没变，只是这部分 CSS 挪了文件，本身不违反
1.x "组件与 props 只增不删"的兼容合同，但对遗漏了这次 import 的
`GameUiPreview` 使用方是真实的视觉破坏，所以 1.1.0 CHANGELOG 把它标为
Breaking（打包层面）。`--game-ui-scenery-*`/`--game-ui-preview-*` 这些
token 本身**没有**跟着挪进 `preview.css`——`.game-ui-shell`
（OwnMySpace game surface pack）等真实导出组件也在用 scenery 系 token，
挪走会连带破坏它们；token 定义留在 `theme.css`，只挪组件规则本身。
`src/tokens.test.ts` 有一条回归测试锁定"哪些类名只能出现在 preview.css、
不能再出现在 styles.css"，防止未来有人把舞台专用规则加回主包。

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
`[data-game-ui-theme='abyss'] { ... }`。"一个主题该覆盖哪些变量"的官方
清单以 `GAME_UI_THEME_CONTRACT`（从包根导出）为准——下游可以直接复用它
校验自己的主题块是否漏 token，不用对着文档肉眼核对：

```ts
import { GAME_UI_THEME_CONTRACT } from '@pieai/swimmer-ui-kit';

// 举例：用正则从自己的 abyss.css 里提出 [data-game-ui-theme='abyss'] 块
// 声明的变量名集合 abyssVars，然后：
const missing = GAME_UI_THEME_CONTRACT.filter((name) => !abyssVars.has(name));
if (missing.length > 0) throw new Error(`abyss theme missing: ${missing.join(', ')}`);
```

kit 自己的 `src/tokens.test.ts` 就是这么校验官方 night 主题的——同一份
清单，两处复用。

TuringPact 的 `clay-overrides.css`（1525 行）历史上是对抗裸色值的产物；
0.9.0 起裸色值已清零，现存文件里直接触碰 `.game-ui-*` 选择器的规则约 57
处，其余是 TuringPact 自有的 `.tp-*`/`.world-*` 产品页面样式（由 kit 组件
组合而成，不是对 kit 基础规则的覆写）。新覆写应继续保持"仅 token 覆写"，
不要粘贴 kit 的 `.game-ui-*` 基础规则。

## Cascade Layer

组件样式全部包在 `@layer swimmer-ui` 里。**未分层的消费方 CSS 永远
赢过 kit**——覆写不再需要 import 顺序或权重竞赛。Tailwind 消费方若想
让工具类也赢过 kit，在入口 CSS 声明一次层顺序：

```css
@layer swimmer-ui, theme, base, components, utilities;
```

## Tailwind 桥（可选，1.0 起独立文件）

kit 本体不用也不要求 Tailwind。若消费方自己用 Tailwind v4，且想让
`bg-primary` / `text-foreground` / `rounded-md` 等主题名解析到 kit
token，可额外引：

```ts
import '@pieai/swimmer-ui-kit/tailwind.css'; // 仅 Tailwind 宿主
```

这份文件只有一个 `@theme inline` 映射块，必须经过消费方自己的
Tailwind 构建；非 Tailwind 管线引它会得到 unknown at-rule 警告——
所以它永远不进 `styles.css`（守卫测试强制）。

## 套壳就绪（Capacitor/Tauri WebView 是一级公民）

按输入能力适配，不做平台嗅探（由守卫测试固定）：

- 全部交互控件：`touch-action: manipulation`（消双击缩放延迟）+
  `-webkit-tap-highlight-color: transparent`（消 iOS 灰色闪块）。
- 游戏控制面（movement pad/工具条/HUD）：`user-select: none` +
  `-webkit-touch-callout: none`（长按不弹文本选择/存图菜单）。
- hover 位移效果一律包 `@media (hover: hover)`——触屏设备不会出现
  "粘滞 hover"（点一下按钮浮起来不回去）。
- 安全区只走 `--game-ui-safe-*` token（默认
  `max(14px, env(safe-area-inset-*))`）。宿主可整体覆写来源——例如
  Capacitor Android edge-to-edge 下 `env()` 可能读到 0，宿主用插件值
  重定义这四个 token 即可，组件规则不用动。

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
- Tabs：roving tabindex + 方向键/Home/End（ARIA tabs 模式）。`GameTabs`
  可选 `id`（本实例的 base id）与每个 tab 的 `panelId`——传了之后自动给
  tab 按钮补 `aria-controls`；消费方自己渲染的 `<div role="tabpanel"
  id={item.panelId} aria-labelledby={`${baseId}-${item.id}`}>` 就能补上
  反向关联（`baseId` 用你传的 `id`，不传则是内部生成值，两端要用同一个）。
- Tooltip：`GameTooltip` 自动给唯一的直接子元素（须是单个可聚焦元素，如
  `GameIconButton`）加 `aria-describedby` 关联气泡文字；触屏设备摸不到
  tooltip，重要信息不要只放在这里。
- 触控目标 ≥44px（`CLAY_TARGET_TOKENS`）。
- `forced-colors`（Windows 高对比度）：交互控件的边框/焦点环/选中态改用
  系统色（`ButtonText`/`Highlight`），因为裸色 wash 在强制配色下会被
  抹平。
- Storybook 的 `a11y` 参数是 `test: 'error'`（`.storybook/preview.tsx`）：
  每个 story 跑一遍 axe，真违规直接让 `pnpm test` 失败，不是摆设。"多个
  同款组件并排对比"这类 gallery story（如 `ResponsiveMatrix`）天然会产生
  重复 landmark，属于演示页面自身的产物，用该 story 的
  `parameters.a11y.config.rules` 关掉 `landmark-unique` 单条规则并写明
  理由——不要整story或整项目地关掉 a11y 测试。

## 面板系统选型

| 需求 | 用 |
| --- | --- |
| 分组内容可收起 | `GameCollapsiblePanel` |
| 游戏内浮动窗口（最小化成 chip/最大化） | `GameWindowPanel`（最大化填充最近的定位祖先） |
| 阻断式确认/表单 | `GameModal`（`position="center"`，默认） |
| 移动端操作面板/action sheet | `GameModal position="bottom"`——同一个原生
  `<dialog>`，焦点陷阱/Esc/backdrop 不变，只换位置/圆角/入场动画。**不要**
  自己手搓 backdrop+滑出面板（无 focus trap/Esc 处理的手搓版本是已知的
  下游 a11y 缺口来源） |
| 内联卡片容器 | `GamePanel` / `GameDialog` |

## 未来出口（记录，不预装）

- **DTCG token 管线**（W3C 规范 2025-10 稳定）：当出现 Figma/多工具
  协作需求时，把 theme.css 升级为 DTCG JSON + Style Dictionary 生成。
- **Base UI 1.0**（MUI 维护）：当需要 combobox/multiselect 等复杂
  headless 组件时的第一候选，届时按组件单独引入。

## Related Commands / Files

- `src/theme.css` — 全部 raw 颜色与主题定义
- `src/styles.css` — 组件规则（token-only，@layer swimmer-ui）
- `src/fonts.css` — 可选品牌字体（Baloo 2 + Geist Variable，发布为
  ./fonts.css，字体文件在 `src/fonts/`）
- `src/tailwind-bridge.css` — 可选 Tailwind v4 映射（发布为 ./tailwind.css）
- `scripts/build-css.mjs` — CSS 构建（lightningcss，warning 即失败）
- `src/tokens.test.ts` — 守卫测试（token/主题/打包/套壳合同）
- `bin/swimmer-ui-check.mjs` — 随包发布的消费方 token 漂移检查（`npx
  swimmer-ui-check`），用法见 usage-and-upgrade-playbook.md
- `pnpm storybook` — 组件与 night 主题演示
