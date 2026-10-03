---
id: REF-DESIGN-TOKENS
title: Design Tokens
type: reference
status: active
canonical: true
owner: project
created: 2026-10-02
last_reviewed: 2026-10-02
domain: ui-components
tags:
  - uikit
  - reference
pinned: false
related:
  - REF-DESIGN-SYSTEM-GUIDE
---

# 设计 token

token 是按用途命名的视觉变量。产品选择“文字、普通底色、危险文字”，不复制一份按钮 CSS。

## 唯一来源

| 来源 | 负责什么 |
| --- | --- |
| [theme.css](../../src/tokens/theme.css) | 原始颜色、尺寸、字体、明暗基础值 |
| [control-styles.css](../../src/tokens/control-styles.css) | 六风格 × 明暗的十二个语义配方块 |
| [styles.ts](../../src/tokens/styles.ts) | 风格/明暗类型和默认风格 |
| [tokens/index.ts](../../src/tokens/index.ts) | GAME_UI_TOKENS、GAME_UI_TARGETS、GAME_UI_THEME_CONTRACT 的常用类型引用 |
| [material/weight.ts](../../src/liquid/material/weight.ts) | 统一液体重量与潮汐 fill 配方 |

组件样式随组件归档；[src/styles.css](../../src/styles.css) 按 tokens → 绘制原件 → 组件组装，产物仍是包的 styles.css。组件使用语义引用或基于它们的 color-mix，不写裸颜色；颜色原值只在 token 块里。

## 常用变量

| 用途 | 变量族 |
| --- | --- |
| 页面和文字 | --game-ui-bg、--game-ui-panel、--game-ui-text、--game-ui-text-muted |
| 普通/选中/含义/禁用控件 | --game-ui-control-fill/edge/text，control-on-*、control-meaning-*、control-disabled-* |
| 危险操作 | --game-ui-danger-ink、--game-ui-control-danger-edge；不会改变普通底色 |
| 配色 | --game-ui-tint-*、--game-ui-mist-*；hue 映射为控件局部变量 |
| CTA | --game-ui-cta-from、--game-ui-cta-to、--game-ui-cta-text |
| 轮廓和间距 | --game-ui-droplet-wobble、--game-ui-control-row-radius、--game-ui-control-padding-* |
| 字体和正文 | --game-ui-font-body/display/mono、--game-ui-font-reading、--game-ui-line-reading、--game-ui-measure-reading |
| 触控、安全区与滚动 | --game-ui-safe-*、--game-ui-scrollbar-*、--game-ui-focus-ring |

完整定义以源码为准；不要把某一个控件的私有 --game-ui-paint-* 通道当成新的产品主题系统。长条行的缓波不能突破几何层 1.4px 上限。文字色和背景色成对使用；名字都叫 token 并不表示组合一定可读。

## 产品如何使用

应用入口引一次 styles.css；给页面容器设置 data-game-ui-theme="light|dark" 和 data-game-ui-style。设计过的自有布局可引用公共变量：

```css
.reading {
  color: var(--game-ui-text);
  background: var(--game-ui-panel);
  font-size: var(--game-ui-font-reading);
  line-height: var(--game-ui-line-reading);
  max-width: var(--game-ui-measure-reading);
}
```

库的组件规则在 swimmer-ui 层。消费方确需覆写时优先改语义 token，不复制组件或使用 !important。风格配方在绘制元素上解析：hue 改动必须在该元素形成实际语义值，不能先在祖先把 color-mix 算死。自定义颜色要重新跑真实文字/背景对比检查，不能继承官方配色的通过结论。

普通主色与文字主色不同：accent-ink 是强调色文字，accent-contrast 才是用于 accent 背景的文字。检测工具会报告不可读的裸 token 配对、未定义变量和旧主题取值；透明叠色与任意用户图像仍需在实际场景验证。

```sh
pnpm exec swimmer-ui-check src
```

## 字体、Tailwind 与资源

fonts.css 可选，加载包内 Baloo 2 / Geist Variable 的 Latin 子集；没有中文字体。产品选择中文字体并负责加载，未加载时退回系统字体，不把回退误称为字体已生效。两份字体的 OFL 许可证随包保留。

只在产品已有 Tailwind 构建且需要主题桥时额外引 tailwind.css；主样式是标准 CSS，不需要 Tailwind。桥文件包含 @theme inline，不能直接交给不支持它的普通 CSS 管线。

GameIcon 使用本包的内联 SVG 线条，继承 currentColor。动态图标名由 GAME_ICON_NAMES 提供；单个具名路径数据可从 icon-paths 子入口导入并裁剪。没有资源复制命令、图片路径配置或运行时 Lucide 依赖。字体与图标路径各按其第三方许可证分发，见 LICENSE / NOTICE。

## 自动约束

十二个块齐全且不重复，危险边色也必须定义；编译后每个风格、明暗、色相、状态都计算真实文字/背景对比，至少 4.5:1。嵌套顺序、默认 pastel、CTA 渐变采样同时验证。减少动态与强制配色不以失去交互状态为代价。
