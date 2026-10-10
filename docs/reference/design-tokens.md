---
id: REF-DESIGN-TOKENS
title: Design Tokens
type: reference
status: active
canonical: true
owner: project
created: 2026-10-02
last_reviewed: 2026-10-03
domain: ui-components
tags:
  - uikit
  - reference
pinned: false
related:
  - REF-DESIGN-SYSTEM-GUIDE
---

# 设计 token

适用版本：3.0.0（与3.0.0-rc.3源码相同）。表面、字体和展示组件按下方唯一来源取值；旧panel别名不保留，产品升级按[迁移表](migration-3.0.md)处理，不再复制第二套token补缺。

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

## 四个层级

页面使用 --game-ui-bg；普通面板与卡片用 --game-ui-surface；输入、凹槽与进度轨道用 --game-ui-surface-sunken；模态和浮层用 --game-ui-surface-raised 与唯一 --game-ui-shadow-raised。普通面板不投影，控件仍按十二个语义配方绘制，不将六种风格再复制成六套层级。

浅色以 #fffdf8 为大底，surface 为文字色4%混大底，sunken为8%，raised仍为大底并使用0 12px 32px的12%黑影。深色以#1f2326为大底，surface为6%、sunken11%、raised9%，浮层阴影45%。玻璃场景仍是显式独立场景语气，也提供相同四角色。不保留panel、panel-strong、panel-deep和旧普通阴影别名。Tailwind桥的card/muted/popover分别对应surface/sunken/raised。

## 常用变量

| 用途 | 变量族 |
| --- | --- |
| 页面和文字 | --game-ui-bg、--game-ui-surface、--game-ui-text、--game-ui-text-muted |
| 普通/选中/含义/禁用控件 | --game-ui-control-fill/edge/text，control-on-*、control-meaning-*、control-disabled-* |
| 危险操作 | --game-ui-danger-ink、--game-ui-control-danger-edge；不会改变普通底色 |
| 配色 | --game-ui-tint-*、--game-ui-mist-*；hue 映射为控件局部变量 |
| CTA | --game-ui-cta-from、--game-ui-cta-to、--game-ui-cta-text |
| 进度条液面 | 复用cta-from/to；轨道surface-sunken，高10px，无滤镜、无待机动画 |
| 轮廓和间距 | --game-ui-droplet-wobble、--game-ui-control-row-radius、--game-ui-control-padding-* |
| 字体和正文 | --game-ui-font-body/display/mono、--game-ui-font-reading、--game-ui-line-reading、--game-ui-measure-reading |
| 触控、安全区与滚动 | --game-ui-safe-*、--game-ui-scrollbar-*、--game-ui-focus-ring |

完整定义以源码为准；不要把某一个控件的私有 --game-ui-paint-* 通道当成新的产品主题系统。长条行的缓波不能突破几何层 1.4px 上限。文字色和背景色成对使用；名字都叫 token 并不表示组合一定可读。

## 产品如何使用

应用入口引一次 styles.css；给页面容器设置 data-game-ui-theme="light|dark" 和 data-game-ui-style。设计过的自有布局可引用公共变量：

```css
.reading {
  color: var(--game-ui-text);
  background: var(--game-ui-surface);
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

styles.css 已包含默认字体声明；fonts.css 仍可单独加载字体而不加载组件样式。英文标题使用 Baloo 2、正文使用 Geist Variable；中文标题与正文使用资源圆体 CN v0.990 的切分版，内部名称为 Swimmer Rounded CN。代码使用系统等宽字体，不列出未提供的 Noto 或其他命名字体。

中文按 Unicode 固定 512 码位分桶、四个字重切为 464 个 WOFF2 块，总计 23,612,344 字节；只下载页面用到的块，纯英文页面不请求中文块。Regular 对应400、Medium500、Bold600–700、Heavy800–900，全部 font-display: swap。完整字形文件较大，分块减少的是网页实际请求，不冒称安装包变小。

来源、输入文件哈希与工具版本以 scripts/zh-font-source.json 为准；scripts/build-zh-fonts.py 用 Python3.12.7、fonttools4.65.0、brotli1.2.0 重建，正常安装和构建直接使用已提交文件，不需要 Python。生成文件清单与哈希在 src/tokens/fonts/zh/manifest.json。源字体采用 OFL1.1，上游指定的保留字体名为 Source；切分后的内部名称已改为 Swimmer Rounded CN，版权和完整OFL仍在各字体与同目录OFL.txt中。两次切分逐字节相同，浏览器检查实际使用的字体，而不只读取font-family字符串。

只在产品已有 Tailwind 构建且需要主题桥时额外引 tailwind.css；主样式是标准 CSS，不需要 Tailwind。桥文件包含 @theme inline，不能直接交给不支持它的普通 CSS 管线。

GameIcon 使用本包的内联 SVG 线条，继承 currentColor。动态图标名由 GAME_ICON_NAMES 提供；单个具名路径数据可从 icon-paths 子入口导入并裁剪。没有资源复制命令、图片路径配置或运行时 Lucide 依赖。字体与图标路径各按其第三方许可证分发，见 LICENSE / NOTICE。

## 自动约束

十二个块齐全且不重复，危险边色也必须定义；编译后每个风格、明暗、色相、状态都计算真实文字/背景对比，至少 4.5:1。嵌套顺序、默认 pastel、CTA 渐变采样同时验证。减少动态与强制配色不以失去交互状态为代价。
