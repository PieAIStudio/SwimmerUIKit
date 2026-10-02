---
id: REF-DESIGN-SYSTEM-GUIDE
title: Design System Guide
type: reference
status: active
canonical: true
owner: h
created: 2026-07-03
last_reviewed: 2026-09-23
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

> 3.0 main 是尚未发布的断代工作区。当前控件、主题和材质合同如下；升级必须同时读 [迁移表](migration-3.0.md) 和 [接口清单](public-api-inventory.md)。S4 评审后才允许提交本阶段，不发布 npm。

## Purpose

SwimmerUIKit 设计系统的唯一说明书：token 架构、主题化配方、动效与
无障碍规则。改视觉先读本文，别直接往组件里写色值。

选组件先读 [我该用哪个组件](component-selection-guide.md)，安装和钉版操作只在
[升级手册](usage-and-upgrade-playbook.md) 维护。完整公开成员由源码生成的
[API 索引](public-api-inventory.md) 提供。

## 品牌与术语

品牌性格是 **tactile、playful、dependable**：有触感、轻快、可靠。Clay 是
圆润、雕塑般的游戏 UI 基础语言；液体是有意图的局部反馈，不是整页都流动。
组件必须产品中立、可组合；不把产品路由、状态库或业务工作流带进共享包。
不要把通用企业模板、默认玻璃拟态、无治理的 token 分叉当作品牌升级。

**组件**承载操作/显示语义；**token**承载命名的视觉规格；**形态 form**承载
液体的动作和物性组合，不等于控件类别。**guard test** 把设计或打包合同变成
可执行检查。**wrapped app** 是同一 web UI 在 WebView 壳里运行，不是第二套 UI。
中央厨房模型与显式升级规则以升级手册为准。`PRODUCT.md`、`CONCEPTS.md` 是
工具适配入口，指向这里，不再各维护一份品牌定义。

## Token 架构（三层）

初学者比喻：token 系统像颜料店。**语义层**是"客厅墙漆"这种按用途命名
的成品漆；**派生基准**是调色用的原浆；**布景层**是舞台背景幕布专用漆。
组件永远买成品漆，不自己兑颜料。

| 层            | 例子                                                                                           | 谁可以改                    |
| ------------- | ---------------------------------------------------------------------------------------------- | --------------------------- |
| 1. 语义 token | `--game-ui-panel`、`--game-ui-accent`、`--game-ui-text`                                        | 下游主题第一目标            |
| 2. 派生基准   | `--game-ui-ink-deep`（深色水洗底）、`--game-ui-border-ink`（描边底）、`--game-ui-text-on-dark` | 下游做完整主题时一起改      |
| 3. 布景/预览  | `--game-ui-scenery-*`、`--game-ui-preview-*`                                                   | 一般不用动（demo 舞台专用） |

规则（由 `tests/tokens.test.ts` 强制）：

1. **raw 颜色只能住在 `theme.css`**。`styles.css` 里的组件规则只能引用
   token，半透明色一律 `color-mix(in srgb, var(--token) N%, transparent)`
   派生——这样下游改一个语义变量，所有 tint/wash/渐变自动跟随。
2. 颜色值只在 CSS token 中维护。旧黏土常量镜像已删除；内联 SVG 占位图保留其既有素材颜色，不再拥有另一份主题表。TS 常用语义引用使用 GAME_UI_TOKENS。
3. `dark` 主题必须覆盖清单内的全部语义色，防止漏 token 漂移。
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
import { GameUiPreview } from '@pieai/swimmer-ui-kit/preview';
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
`tests/tokens.test.ts` 有一条回归测试锁定"哪些类名只能出现在 preview.css、
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

完整暗色主题：参考 `theme.css` 里官方 `[data-game-ui-theme='dark']`
块——把语义层 + 派生基准一起覆盖，然后在任意父元素挂
`data-game-ui-theme="dark"`（支持局部作用域，如只让酒馆场景变暗）。

自定义第三主题：复制 dark 块，换成自己的属性值，如
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

kit 自己的 `tests/tokens.test.ts` 就是这么校验官方 dark 主题的——同一份
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

- 常规 CSS 动效使用 motion token：`--game-ui-motion-fast/base/slow` +
  `--game-ui-ease-pop`（弹性）/`--game-ui-ease-soft`（柔和）。
- 液体弹簧与形变取命名形态的共享配置，不在消费调用点复制物理参数。
- 高度伸缩动画用 grid-template-rows 0fr/1fr（全浏览器），
  `interpolate-size: allow-keywords` 作为宽度动画的渐进增强。
- 所有动效必须有 `prefers-reduced-motion: reduce` 降级。

## 滚动面与滚动条

Kit 自有的长列表、窗口正文和模态正文使用统一的 clay 滚动条。产品自己
拥有的 overflow 容器可以显式加上 `.game-ui-scroll-surface`，复用同一套
标准 `scrollbar-color` 与 Chromium/WebKit 滚动条样式：

```html
<div class="game-ui-scroll-surface" style="overflow: auto; max-height: 24rem">
  ...long-form content...
</div>
```

公开 token 是 `--game-ui-scrollbar-size`、`--game-ui-scrollbar-track`、
`--game-ui-scrollbar-thumb` 和 `--game-ui-scrollbar-thumb-hover`。默认 thumb
跟随 `--game-ui-border-strong`，hover 跟随 `--game-ui-accent`；主题只需要
改语义边框/主色就能保持一致，也可以在确有需要时直接覆写这四个 token。
这个 class 只作用于加 class 的实际滚动元素，不会把产品页面所有后代的
滚动条强行改掉。Windows forced-colors 会切换到系统色。

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
- 可选帮助：`<GameHelpTip label="备份说明">下载一份作品副本到你的设备，之后可以从文件恢复。</GameHelpTip>`。
  短文本解释支持 hover、键盘 focus、点击／触摸；Escape 与外部点击关闭，内容可悬停阅读。
  Floating UI 负责定位、边缘避让与交互；原生 dialog 内的帮助留在同一 top layer，避免被页面 inert。
  Trigger 不提交表单、可触达区域44px，正文不参与排版。不要在帮助内放按钮／链接；需要交互的内容
  使用正式面板。当前状态、错误后的下一步、费用和不可逆动作确认始终直接显示。
  参考：WAI 的 hover/focus 与 status-message 要求，以及 Floating UI 的 tooltip / useClick 文档。
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

## 金属按钮已删除

3.0 删除零使用的金属按钮、WebGL 预算及相关 token，不保留备用皮肤。主操作使用 GameButton；逐项见迁移表。

## 液体从使用者到实现者

### 液体协作身体（源码候选）

`./liquid-presence` 是可选浏览器入口，导出 `LiquidPresence` 及其类型。
源码候选还提供 `LiquidReveal`：用同一实色液体材质描出输入/内容边界，不替换身体。
`./liquid-presence.css` 单独导入，不改变普通控件的根入口或默认动效。
基础入口已在 2.9.0 发布；本轮待机与配置属性是尚未发布的增量，正式产品须在
包含这些增量的新包发布后钉版消费，不能把相邻仓库源码变成生产依赖。跨库计划和实际试玩证据由 SwimmerNerveKit 的
`docs/plans/completed/liquid-presence.md` 保留认可的基线，精修与交付记录在同库的
`docs/plans/completed/liquid-presence-refinement.md`；不在 UIKit 再开一份计划。

本体和飞出的液滴仍是一个助手的视觉手势。UIKit 负责材质和局部运动，
Nerve 的 `nervePresenceTarget` 可把已有目标登记转换为 `target`；
产品仍负责真实可见性、页面导航、作品权限、编辑和保存。

`LiquidReveal` 只承载原生 DOM：`source` 是真实启动按钮的 ref，`variant="input"`
是输入形状，默认 `content` 是阅览形状。`LiquidReveal` 固定使用同一份薄液体材质，没有 surface 开关或旧深色皮肤。`revealKey` 只在新的人类请求时更换，不能用 token 或
时间戳重播。出场等真实锚点完成定位，再经蓄力、拉长飞行、汇聚、分轴舒展和
定型，约720ms完成；
用现有同拓扑 blobPath 的浏览器原生关键帧，不引入任意路径插值器。内容稳定，
在展开过程中淡入，聚焦/点选立即结束装饰。缩放/滚动打断后不重飞。
减少动态、不可见页面、预算不足直接呈现；路径动画不支持时短淡入。超滤镜面积时不启用
体积滤镜或局部背景模糊。没有全屏滤镜、额外 Canvas 或媒体连接；默认没有常驻动效。
`--game-ui-liquid-reveal-*` 只保留布局和动效语义；材质默认使用潮汐 from/to 与深色文字，不是玻璃。
`LiquidReveal` 与 `LiquidPresence` 可接同一 `colorFrom/colorTo`、
`motionIntensity/motionSpeed`。Nerve 从原 Companion 设置投影这组属性，默认
潮汐渐变，但不覆盖已保存配色；Kit 默认也使用潮汐 token。
自选颜色须同时核对文字对比；品牌日夜色与 Companion 预置色已实测，不能
推断任意色都可读。
来源、正文、按钮与窗口焦点由宿主/Nerve 提供，关闭内容不等于停止任务。
可选 `idleMotion="breathe"` 使包边在约十秒周期内小幅流动。外缘直接复用主体的
闭合 C1 `blobPath`，本轮向外的舒展更明显；内缘固定，局部厚薄形成体积，不靠
附着小圆或整圈跑珠装饰。强度范围0.25–1.25，速度0.5–1.5，仍共用既有预算。
主体的缓慢姿态比前版明显，但速度不增加，普通静止默认不变。暂停/恢复保留当前
轮廓相位，不回跳首帧。两者共享一个
低频唤醒时钟及既有预算，不每个框开一条 60Hz 循环。`reducedMotion` 和系统偏好
优先；关闭/隐藏/离开屏幕清理订阅。Nerve 投影输入、选择、拖动与暂停偏好，
Kit 不推断学习或语音状态。内容和按钮矩形始终不参加这个形变。直接文字入口
已聚焦时跳过出场；已静态展示的面不因后来恢复动画而重新飞入或隐藏文字。

阅览面内的普通控件使用同一平面水滴与语义配色，不再设另一套带厚度的按钮/凹入输入皮肤。guideContent 直接放入同一个 LiquidReveal 原件，继承源位置的风格、明暗和实际品牌 token。

同一可选入口另导出 `LiquidAnchor`：接 `source` ref，用已有 Floating UI
安置临时内容，不给主体设屏幕位置。`placement` 默认 `top-end`，会避让视口，
也可由宿主选择；`onBoundsChange` 返回内容当前矩形或 null，供三维标签避让。
源在 native dialog 内时保留原层，外部模态/不可见源不会留下错误浮层。
原生外部模态直接卸载也会恢复临时内容；只在被遮挡期间观察该模态的存在。
跨 portal 继承主体实际调色及品牌 tokens，不观察逐帧路径，不改变宿主布局。
宿主可覆盖 `--game-ui-assistance-z` 调整自身图层规则。
交互合同在 Nerve README，本轮跨库记录在 NerveKit `docs/plans/completed/living-presence-and-spatial.md`；
完成源码验收不等于已发布新包。

```tsx
import { LiquidPresence, type LiquidPresenceTarget } from '@pieai/swimmer-ui-kit/liquid-presence';
import '@pieai/swimmer-ui-kit/styles.css';
import '@pieai/swimmer-ui-kit/liquid-presence.css';

export function AssistantEntry({ guide, busy, open, clearGuide }: {
  guide: LiquidPresenceTarget | null;
  busy: boolean;
  open(): void;
  clearGuide(): void;
}) {
  return (
    <button type="button" aria-label="打开 AI 协作" onClick={open}>
      <LiquidPresence
        size={76}
        activity={busy ? 'working' : 'idle'}
        target={guide}
        onDismiss={clearGuide}
      />
    </button>
  );
}
```

`target` 包含本次手势的 `key`、可读 `label`、读取真实当前位置的 `getRect()`，
以及可选的 `contextElement`。后者提供滚动和原生弹窗上下文，不是模拟点击
入口。重新指示相同目标也应换 `key`；位置改变仍由原读取函数返回，不能问
模型生成 CSS 或像素坐标。失去目标时返回 `null`，更换账号、作品或视图时
由宿主撤销旧目标并重建该作用域的身体。

默认待命静止，交流或实际工作状态才激活动态；`levelRef` 只接收已有媒体连接的
真实归一化音量，没有读数就留空。声音活动和任务进度是两类事实，不能用
动画推断已经录音、生成完成或保存成功。颜色默认取潮汐 token；
可用 `colorFrom` / `colorTo` 指定经产品选择的色板，错误与待核对仍采用
warning 色，并由宿主保留文字说明。消费 Nerve 时优先使用它的
`nervePresenceActivity` 投影真实状态，别在每个项目复制语音/任务优先级判断。
连接已打开不代表正在说话；缺少真实媒体观察时，不伪造音量或播放活动。

本体附近做分裂，途中移动小块液滴，到达后在目标边缘停靠；没有全屏融合
滤镜。沿用现有液体预算；预算不足或 `reducedMotion` / 系统减少动态开启时
直接保留静态目标说明，不提高全局预算。原生弹窗与外部本体不在同一层时
直接在正确层级指示，不假装穿过模态遮罩。装饰层不抢点击，按钮和文字
保持原来的真实 DOM。`onDismiss` 只清除指示，不能接取消任务、保存或付款。

#### 连续动作与资源边界

**源码新增：用户掌握节奏的现场解释。** `guideContent` 可在原落点放入宿主提供的
React 内容，复用同一液滴、同一定位订阅；不为讲解再造一个身体。未提供此槽时
原短标签和到时收回不变；提供时改为显式结束或目标失效才撤下，不能给阅读限时。
适合有限的上一处/下一处说明，不是嵌入大表单、播放器或任意产品窗口的浮层容器。
目标处的按钮只控制展示，不能把动画回调接到付款、编辑、保存或任务完成。

有界的文字候选比较可用 `guideSize="expanded"`，宽屏优先放在选段旁，窄屏
仍上下避让；已有 Floating UI 按可用空间限制高度，内容可滚动，不把长卡片
推到原选段上。编辑器旁的帮助可显式 `dismissOnTargetClick={false}`，点回
原编辑器不会丢失候选。省略这两个选项时仍是原来的紧凑指路行为。
互动内容自己处理 Escape、忙碌和中文输入法；外部 Escape 仍可撤掉普通指示。
真正采用候选必须由用户点击内容里的正常控件，经宿主原有保存通路完成，
不由液滴到达、关闭或动画完成触发。共享比较合同与唯一跨库计划在 NerveKit
的 `docs/plans/completed/selection-comparison.md`；UIKit 不拥有文字、权限或记忆。

内容在跨目标运动期间保留 DOM 与键盘焦点，首次定位前不在屏幕左上角闪现。
该区域单独接受指针事件，并隔断 portal 沿 React 树冒泡到本体启动按钮；原目标
依然正常点击。组件跨 portal 继承来源处的实际品牌 token 与风格/明暗；祖先属性改变时更新，不逐帧复制，不重建原生内容或更改整页主题。
减少动效保留相同内容；模态优先、实际目标遮挡、原对象失效仍按已有边界处理。
消费方负责安排可读尺寸、结束后的合理焦点和失效时的非阻挡备用位置；按真实
页面检查说明、本体和目标都清楚可见，不声称浮层自动避让所有业务控件。

待机与指路共用同一身体和预算，但拥有不同的唤醒原因。

#### 轻柔待机与用户微调（待发布扩展）

Owner 明确选择全局伙伴有极轻的在场感，宿主可显式设置 `idleMotion="breathe"`。
省略仍是 `still`；普通液体按钮完全不变。待机只让小幅轮廓缓慢流动，不喷液滴，
不跳动、不闪烁，也不表示麦克风已打开。Nerve 的伙伴配置默认采用轻柔待机。

`motionSpeed`（0.5–1.5）和 `motionIntensity`（0.25–1.25）只控制材质的速度与
起伏，不改变真实控件布局、业务任务或指路时长；`splashes={false}` 关闭说话时
的小液珠。现有 `size` 和渐变色属性继续使用，颜色、名称和持久化归宿主/Nerve。

轻柔待机最多约 12 次绘制/秒，用计时唤醒加单帧更新，不用 60 Hz 时钟空转。
每次绘制释放预算，真实控件/指路优先；借用被占用时低频等待释放，不抢资源。
系统或宿主减少动态、禁用、隐藏/不可见和模态遮挡时停下；关闭模态后恢复。
当前活动仍是 `idle`，诊断用 `data-liquid-motion="ambient"` 不冒充语音状态。

设置面板、昵称和用户拥有的 Markdown 记忆在 NerveKit，UIKit 不接触这些数据。
本轮交付在 NerveKit 的 `docs/plans/completed/companion-personalization.md`。

#### 指路的连续性

停靠后的回归先把液体托座收拢成滴，再沿原空间关系返回；分裂没结束就取消，
从当前液颈缩回，不先瞬移成已脱离的小球。重定向保留已经画出的形状和位置，
已用静态提示交付的同一 `key` 不因重新开启动效而补播一次飞行。
关闭动效或资源不足时仍保留可读目标，不让辅助动作变成操作的等待条件。

普通 DOM 目标在布局/滚动/样式改变时更新，静止停靠不逐帧查询位置；只有没有
DOM 的虚拟目标、投影或当前正在 CSS 运动的目标才开启位置帧时钟。页面隐藏
后暂停绘制与定位订阅。材质进度使用真实时间而非帧数，音量读数做轻量平滑。
高对比模式用系统颜色和边框保留信息。以上均不增加模型调用或修改业务生命周期。

实现地图按职责而不是场景分叉：`LiquidPresence.tsx` 组装可访问宿主里的视觉；
`liquidPresenceMotion.ts` 为纯动作采样；`liquidPresenceGeometry.ts` 处理轮廓和
可见区域；`liquidPresencePaint.ts` 只写 DOM；`liquidPresenceTracking.ts` 拥有
位置订阅；`useLiquidPresenceMotion.ts` 协调同一手势与资源释放。公开入口仍然
只有原 `./liquid-presence` 叶子，不要求消费者 deep-import 这些内部模块。

### 二维水滴与唯一主操作

普通按钮（secondary、ghost、success、danger）、图标、选项行、页签、分段、开关和列表共用一个平面水滴原件。
没有底边、投影、渐变、高光或滤镜。选中换语义颜色并显示对勾，不扩大；一列的两端保持对齐。
按下时只有 SVG 背景横向展开、纵向压扁和缓波回弹，原生文字、焦点、点击区域保持固定。
输入框只更换静态边和底色；不包会重建字段的条件树，不做按压形变。

**一屏最多一个 CTA。** 它就是 GameButton variant="primary"，用于推动主线的开始、确定、下一步、收下或付款。
固定使用潮汐渐变（cta-from / cta-to）与深色文字，不再传 surface 或 liquidFinish。
fullWidth 只负责占满一行；type="submit" 必须显式指定。禁用态、原生 fieldset 禁用和强制颜色模式不保留邀请点击的液体装饰。

### 风格与明暗是两条独立的轴

data-game-ui-style：candy（彩色）、pastel（淡彩，默认）、mist（雾色）、grey（灰阶）、outline（包边）、ink（黑白包边）。
data-game-ui-theme：light / dark。两条轴可以放在同一元素，也可以分别嵌套；换风格或明暗不重建正在编辑的原生控件。
六套风格不是六套组件，而是 src/tokens/control-styles.css 中的十二个完整配色块；颜色常量只在 theme.css。

支持 hue 的控件接受 coral / sun / leaf / sky / grape / pink；它只表达色相或含义，不决定风格。
控件把 hue 映射为局部变量，token 块给出平时、选中、有含义和禁用时的填色、边和文字。
灰阶、包边、黑白包边不依赖色相。文字/背景不是任意两种 token 的拼接；默认每种组合都必须通过 4.5:1。
University 如何按年龄选择风格由产品自己决定，本仓库不改变用户、课程或账号状态。

CSS 自定义属性在声明元素计算后才继承；因此依赖局部 hue 的公式在实际绘制元素上计算，不能提前在祖先算成默认色。
style scope 防止嵌套风格串色，light-dark 根据实际色彩方案解析当前明暗。
pnpm check:themes 从真实 CSS 中检查十二个块，并在真实浏览器中检查压缩后的配色，不维护另一份用于测试的配色真相。

### 平面轮廓与资源边界

src/controls/DropletSurface/geometry.ts 对圆角矩形沿法线加两组整数频率的缓波，再转为闭合三次贝塞尔路径；描边使用 non-scaling-stroke。
--game-ui-droplet-wobble 默认 1.4px，长行也不增大波幅；没有阈值液体滤镜，不让细边落入位移滤镜的整数像素台阶。
尺寸变化时用 ResizeObserver 测量，按压只更新缓存路径与姿态。欠阻尼弹簧有界积分，释放后回到精确静止值，静止不留帧循环。

同一个内部 native press observer 供水滴与 CTA 使用：不模拟点击，不截获指针，不阻止默认行为。
拒绝右键、重复键和被调用方 preventDefault 的事件；取消、丢失捕获、窗口失活、继承禁用会复位。
macOS WebKit 的按钮指针按下后焦点变化不等于释放指针。减少动态和 static 不变形；清理后不会残留观察器或帧回调。
列表在整行绘制，但只监听左侧选择按钮，右侧动作是独立兄弟节点，不能带动行选择或整行按压。

### 唯一液体重量与动作词汇

CTA、涟、LiquidReveal 与 LiquidFill 共用 src/liquid/material/weight.ts 的薄重量：blur 5、contrast 18、gloss 1.5、3.5px 三瓣轮廓、0 6px 14px 贴地软影，渐变 sheen 0.3。
高光收进轮廓一像素；outer shadow 使用 CSS compositor，SVG 仍只过滤装饰层，不过滤文字。
CSS drop-shadow 的模糊参数是 sigma，因此涟的 7px sigma 与 14px box-shadow blur 对齐，不再多出一层厚重阴影。

命名形态只描述姿态、回弹、过渡；set 可硬化，多物体 merge/split/bead/follow 为桥接间隙保留各自 blur。
内部配方表不是根入口；自定义单体用 LiquidSurface，多个物体用 LiquidGroup + liquidFormItem。
根入口不接受融化、弯曲或图像溶解；这些能力从 ./liquid-effects 的 LiquidEffectsGroup 显式导入，仍共享测量、时钟和预算。
高级原件的数值 gloss 仍可显式调整，但没有 matte/glossy/厚重量的命名开关。

### 展厅、代码和验收

站点首页按任务选组件，/?view=reference 为完整参考，/liquid.html 比较动作，不是另一套组件。
目录与 Storybook 共用 preview/catalog/recipes.tsx；复制代码对六套风格和正常/禁用/错误状态逐一编译。
风格切换不清空已输入内容或计数；切换组件类别才建立新示例。目录不再提供旧材质开关或双 CTA 对照。
Storybook 的每个故事结束时检查最多一个可见液体 CTA，不能把多重主操作当成正确范例。

验证依据：几何/弹簧单元测试；原生控件与焦点浏览器测试；真实压缩 CSS 的点击区域测试；十二块完整性与对比度；实际运行的 DPR 1 截图和放大边缘。
截图不是性能与可访问性测试的替代，也不替代 Owner/Claude 的 S4 审美评审。

### 实现地图

| 职责 | 源码家 | 边界 |
| --- | --- | --- |
| 颜色与语义配方 | src/tokens/ | 唯一 token 来源；风格分支不进入组件 |
| 平面轮廓与按压 | src/controls/DropletSurface/ | 无液体滤镜；没有业务状态 |
| 原生动作与输入 | src/controls/ | 焦点、值、ARIA 和原生事件 |
| 单体/多体液体 | src/liquid/ | 几何、测量、预算、滤镜和受控动作 |
| 可选图像与弯曲 | src/liquid-effects/ | 默认包不引入；不复制时钟和预算 |
| 涟、锚点与面板 | src/presence/ | 同一视觉身体；不运行模型/任务 |
| 展示与复制例子 | src/preview/、preview/ | 独立 ./preview 入口 |

donor 的采纳、拒绝和固定版本只在根目录 donors-individual.md 及 lock 维护。

## 账号界面原件

WO-UI-1 的行为能力保留：验证码、竖排页签和独立列表动作。3.0 改变外观，不改变账号验证职责；以下为当前合同。

### 铜牌相框（只给静态头像）

GameAvatar surface="plaque" 保留静态圆形铜牌相框。GameButton 与 GameIconButton 不再支持 plaque，使用统一水滴；不会为了头像相框保留旧按钮皮肤。
相框的 brass/surface/ink/border/highlight token 保持自身用途，不作为主操作的颜色或重量。

### 验证码输入

```tsx
<GameOtpInput
  aria-label="验证码"
  aria-describedby="code-hint"
  value={code}
  onChange={setCode}
  onComplete={verifyCode}
  invalid={invalid}
  getSlotLabel={(index, length) => `第 ${index + 1} 位，共 ${length} 位`}
/>
```

`length` 默认 6，允许 1–32 的整数；每格触控宽度至少 44px。`value/onChange`
为受控接口，只接受数字（全角数字规范化）。支持整串粘贴/自动填充、逐位输入、
方向键/Home/End、退格及删除。`getSlotDescription(index, length)` 提供可选逐格描述，
整体 aria-describedby 同时关联到每格。第一格使用 autocomplete one-time-code，
每格均为 inputmode numeric。

输入法组合期间不回调 onChange/onComplete，组合态 Enter 不冒泡提交；组合结束再处理。
初始值或宿主更新 value 不自动提交，相同完整值的重复粘贴也不重复回调。
宿主负责发送、真正验证、错误消息、倒计时、重试和限流；填满不等于验证成功。
含字母的恢复码使用普通文本输入，不使用本组件。

### 竖排页签与列表行

`GameTabs orientation="vertical"` 使用固定 200px 宽度
（`--game-ui-side-tabs-width`），Up/Down 循环切换、Home/End 跳首尾；
横排继续只处理 Left/Right。通过 aria-label 或 aria-labelledby 命名页签组。
宿主仍用 id 和 tab.panelId 连接对应 panel，手机切换顶部分段布局也归宿主负责。

`GameListRow` 接收 thumbnail/title/description/current/selected/onSelect/actions。
onSelect 对应左侧选择控件，右侧 actions 是其兄弟，不嵌套在按钮内。
没有 onSelect 时左侧为普通展示，current 仍有圆点和 aria-current。
左侧槽位只放展示内容，交互放 actions；危险操作的确认、当前作品和选中项由宿主控制。
整行使用 --game-ui-control-row-radius（默认 16px）和同一个水滴原件。背景对齐到整行，不随右侧动作数量缩短；原生选择按钮和文字不位移。

行为检查在 `tests/AccountControls.browser.test.tsx`，主题色对由 `tests/tokens.test.ts` 检查。
可操作例子在 Storybook `Clay / Account / AccountControls`。本轮证据与发布权限见
[WO-UI-1 收口](../plans/completed/wo-ui-1-account-controls.md)。

## 可收集卡片与可选方向输入（2.12）

`GameCollectibleCard` 负责翻面、指针倾斜、边框、高光和减少动态；产品只传
稀有度、标题、插画、说明及可访问名字。`GameCollectibleCardSlot` 表示未收集
的位置，不伪装成可点击卡片。`playGameCardRevealSound` 沿用已有手势解锁，
不加载音频文件、不在首次交互前播放。

需要跟随设备方向时，一本卡册只创建一个 `useGameCardOrientation()`，由
用户点按调用 `enable()`，把返回的 `tilt` 传给当前关注的那一张卡。关闭调用
`disable()`；换账号或离开该卡册时卸载宿主。`status` 区分 unavailable、off、
requesting、enabled、denied；enabled 不保证该设备已经发来有效样本，`tilt`
仍可能是 null，产品要保留手指/键盘操作。没有传 tilt 的既有消费方不变。

```tsx
const motion = useGameCardOrientation();
<GameButton onClick={() => void motion.enable()}>Enable device tilt</GameButton>
<GameCollectibleCard {...card} tilt={motion.tilt} />
```

方向输入需要安全上下文，平台要求权限时必须从直接交互里申请；依据是
[W3C Device Orientation and Motion](https://www.w3.org/TR/orientation-event/)
（2026-09-29 核对）。仅采用浏览器原生相对方向事件，不请求绝对罗盘、定位、
麦克风或网络服务；不增加第三方传感器引擎。现有 Kit 指针/翻面实现已经足够，
无需移植整套外部卡片库。设备/屏幕坐标做有界相对投影，不作为姿态测量工具。

页面隐藏暂停输入，返回重新校准；减少动态会清掉倾斜并取消在途权限结果。
每次 enable 有生命周期编号，关闭/卸载/隐藏请求期间的迟到结果不能重新启动。
浏览器测试证明这些状态与实际 DOM 效果；实体设备的系统权限面板仍由消费产品
另行验收，不能用模拟样本冒充。

## 面板系统选型

| 需求                                                                     | 用                                            |
| ------------------------------------------------------------------------ | --------------------------------------------- |
| 分组内容可收起                                                           | `GameCollapsiblePanel`                        |
| 游戏内浮动窗口（最小化成 chip/最大化）                                   | `GameWindowPanel`（最大化填充最近的定位祖先） |
| 阻断式确认/表单                                                          | `GameModal`（`position="center"`，默认）      |
| 移动端操作面板/action sheet                                              | `GameModal position="bottom"`——同一个原生     |
| `<dialog>`，焦点陷阱/Esc/backdrop 不变，只换位置/圆角/入场动画。**不要** |
| 自己手搓 backdrop+滑出面板（无 focus trap/Esc 处理的手搓版本是已知的     |
| 下游 a11y 缺口来源）                                                     |
| 内联卡片容器                                                             | `GamePanel` / `GameDialog`                    |

## 未来出口（记录，不预装）

- **DTCG token 管线**：有 Figma/多工具协作需求再评估，不为清理仓库预装生成链。
- **Base UI**：需要复杂 combobox/multiselect 等 headless 行为时优先评估成熟实现，
  但引入运行时依赖必须先变更现有零依赖边界；不能悄悄安装或复制其状态机。
  [下一阶段调查](liquid-next-stage-research.md) 区分已实现、提案和待验证事项。

## Related Commands / Files

- `src/theme.css` — 全部 raw 颜色与主题定义
- `src/styles.css` — 组件规则（token-only，@layer swimmer-ui）
- `src/fonts.css` — 可选品牌字体（Baloo 2 + Geist Variable，发布为
  ./fonts.css，字体文件在 `src/fonts/`）
- `src/tailwind-bridge.css` — 可选 Tailwind v4 映射（发布为 ./tailwind.css）
- `scripts/build-css.mjs` — CSS 构建（lightningcss，warning 即失败）
- `scripts/finalize-dist.mjs` — 跨平台复制 tailwind bridge，并清理构建产物
  中的 `.DS_Store`
- `tests/tokens.test.ts` — 守卫测试（token/主题/打包/套壳合同）
- `bin/swimmer-ui-check.mjs` — 随包发布的消费方 token 漂移检查（`npx
swimmer-ui-check`），用法见 usage-and-upgrade-playbook.md
- `pnpm storybook` — 组件与 dark 主题演示

### Nerve 0.6 配套修复（尚未发布）

可选 `liquid-presence.css` 与主样式一样归入 `@layer swimmer-ui`。产品的不分层
样式可以直接覆盖品牌控件，不再被可选液体样式的特殊选择器压住。
`GameButton data-game-ui-control="liquid-presence"` 由 Kit 去掉重复按钮底面，
让内部液体主体负责外观；原生按钮、可达名字和交互仍保留。

`LiquidAnchor` 的可见占用范围只交给本 Kit 的标签定位。Floating UI 先定位，
有限的碰撞候选再避开打开的面板与真实目标；没有空位时不留下不可见可点的标签。
面板变化或卸载触发更新，静止时没有新动画时钟。产品不需要把
`--game-ui-assistance-z` 降到 94。目标可见性、页面选择和业务权限仍归产品。
本节是已验证源码候选，不表示 registry 已发新版本；需 Owner 另行批准发布。
