---
id: PLAN-UIKIT-3-COMPLETION
title: UIKit 3.0 Completion Before Release
type: plan
status: active
canonical: true
owner: project
created: 2026-10-03
last_reviewed: 2026-10-03
domain: ui-components
tags:
  - restructure
  - release
  - fonts
  - icons
pinned: false
related:
  - PLAN-UIKIT-3-RESTRUCTURE
  - REF-CURRENT-WORK
  - REF-MIGRATION-3-0
---

# UIKit 3.0 发布前补齐

给执行的 AI（Codex）读，一次做到底。前置是
[PLAN-UIKIT-3-RESTRUCTURE](PLAN-UIKIT-3-RESTRUCTURE.md) 的 S0–S6，它们已经完成；
本计划是 S7–S14。

## 来由与授权

SwimmerParty-Website 是第一个完整接入 3.0 候选的产品，接入后暴露出 11 个问题。
Owner 在 2026-10-03 做了以下决定：

- 发布前把 11 条**全部**解决。
- **不兼容旧写法**：完全按照"简单、高效、AI 读得懂"重构；哪个产品要升级，就由它自己适配。
- 中文默认字体用**资源圆体**（Resource Han Rounded），英文保持 Baloo 2 + Geist；
  各产品可以覆盖。这条成为新规矩。
- 黏土图标**彻底退场**：UI 图标改为线条图标，与平面水滴同一气质。
- 全部完成、门禁通过后，**以 `3.0.0-rc.1` 发布到 npm 的 `next` 标签**；`latest` 保持 2.14.0。
  这是 Owner 对本次预发布的明确批准。正式版 `3.0.0` 另行批准。

## 执行规则

1. **阅读顺序**：`AGENTS.md` → `docs/policy/**` → 原计划 → `docs/reference/` 下的
   `theme-and-liquid.md`、`design-tokens.md`、`component-selection-guide.md`、`migration-3.0.md`
   → `donors-individual.md`。开始前运行 `pro-gov learn recall --query "UIKit 3.0 completion"`。
2. **在 `main` 上逐阶段提交**。每个阶段结束都要通过 `pnpm verify` 与 `pnpm docs:check`；
   公共 API 有变化时同时运行 `pnpm api:inventory`。
3. **推送与发布的边界**：S14 之前不推送。S14 按本节授权推送 `main`，并触发一次 npm-publish 工作流。
4. **不改其他仓库**。对产品的影响写进迁移表与报告。
5. **只有这些情况停下来写报告**：
   - 同一失败连修三次仍不通过；
   - 需要本计划以外的凭据或付费操作；
   - 资源圆体许可证不允许本计划的切分方式；
   - 发布工作流失败。
6. **设计拿不准时选"更少"**：更少颜色、更少动效、更少变体。普通控件不加投影、渐变、高光。
7. **不保留兼容层**：删掉的名字不留别名，不留"旧写法也能用"的分支；检查工具只负责报告旧用法。

## S7 清理与指南全覆盖（问题 10、11）

**删除**这些没有导出、产品用不到的组件，以及它们的样式、故事、测试和展厅片段：

- `GameActionGrid`（完全无人使用）
- `GameCardFan`
- `GameHud`
- `GameOrientationGate`
- `FirstSessionHud`

同时删除空目录 `src/clay/`、`src/fonts/`。删除前确认它们不在 `public-api-inventory.md`
的导出里；若有导出，同样删除并写进迁移表。

**组件选择指南全覆盖**：

- `docs/reference/component-selection-guide.md` 要覆盖**每一个**公开值导出。目前缺
  `GameBadge`、`GameLanguageMenu`、`GameTooltip` 等，要补齐。
- 新增检查脚本，接入 `pnpm verify`：读取生成的 API 清单，指南里缺任何一个公开组件名就失败。
  可以并入已有的 `check:catalog`。

验收：`pnpm verify`；检查脚本对"故意删掉指南里一行"的情况会失败（在测试里覆盖）。

## S8 图标换代：黏土退场（问题 4）

**删除**以下内容，全部写进迁移表：

- `GameAssetIcon`、`getClayIconPath`、`setClayAssetMode`、`setClayAssetBasePath`、`ClayIconName` 等黏土相关名字。
- `./assets/*` 子路径导出。
- `swimmer-ui-assets` 命令。
- 包内全部 351 个黏土素材，以及相关文档和测试。
- README、NOTICE、LICENSE 中关于黏土素材的条款，同步更新。

**新增 `GameIcon`**：

- **画法**：内联 SVG 线条图标，`viewBox="0 0 24 24"`，`stroke="currentColor"`，
  `stroke-width` 2，圆头圆角，无填充。
- **参数**：`size` 为 `sm` 16、`md` 20、`lg` 24；有 `label` 时 `role="img"` 加 `aria-label`，
  否则 `aria-hidden`。
- **图标集与名字**：
  - 保留原来的 41 个名字，迁移只需改组件名：
    ai alert card chat check close coin compass copy crown energy gem gift globe history
    redo undo home hourglass laurel lock lucky mail medal mission mobile portal scroll
    settings shirt shop smile timer trophy vote。
  - 再加常用的 13 个：arrow-left arrow-right chevron-down chevron-up download external
    menu minus moon plus search sun user。
- **来源**：从 Lucide（ISC 许可）挑形状最接近的图标转写，例如 energy→zap、lucky→clover、
  shop→store、mission→flag、portal→orbit。按本仓库的第三方来源规则登记到 NOTICE
  （必要时也登记到 donors），**不加运行时依赖**。
- 每个图标一个具名导出的路径数据，保证可以按需裁剪。

所有内部用到黏土图标的组件都改用 `GameIcon`：语言菜单、空状态、加载状态、事实列表、
开屏引导、摇杆、关卡格，以及 `src/game/*` 里其余用到的组件。

验收：

- 源码和包里不再出现 `clay`、`getClayIconPath`、`swimmer-ui-assets`（历史归档除外）。
- 每个图标都有快照测试。
- 展厅里新增一张图标总览，浅色、深色各截一张图。

## S9 字体：默认英文 + 中文，各产品可覆盖（问题 2）

**新规矩**（写进 `design-tokens.md` 的"字体"一节）：

- UIKit 提供默认英文与中文字体。
- 产品可以改写 `--game-ui-font-display`、`--game-ui-font-body`、`--game-ui-font-mono`。
- 字体栈里只能写已经加载的字体。

**实现**：

1. **中文字体**：资源圆体简体版 v0.990，取四个字重 Regular、Medium、Bold、Heavy。
   - 来源：`https://github.com/CyanoHao/Resource-Han-Rounded/releases/tag/v0.990` 的 `RHR-CN-0.990.7z`。
   - 下载后记录 SHA-256，下载缓存放在被 Git 忽略的目录里。
   - 先读包内许可证，确认是 OFL 1.1，并确认有没有"保留字体名"。
     如果有，切分后的字体内部名称必须改掉，并在 NOTICE 说明。
2. **切分**：用脚本（如 `cn-font-split`，精确版本，先核实其许可证）把每个字重切成带
   `unicode-range` 的 woff2 小块，生成到 `src/tokens/fonts/zh/`，并提交。
   - 切分可重复：同一源文件、同一工具版本，结果逐字节一致。
   - 报告里写清总大小与块数。
3. **`fonts.css`**：同时声明拉丁字体与中文小块。
   - 浏览器只在页面出现对应字符时才下载那一块，纯英文页面不会多下载。
   - 字重对应：400 → Regular，500 → Medium，600–700 → Bold，800–900 → Heavy。
   - 一律 `font-display: swap`。
4. **字体栈**：
   - `--game-ui-font-display: 'Baloo 2', 'Resource Han Rounded CN', system-ui, sans-serif;`
   - `--game-ui-font-body: 'Geist Variable', 'Resource Han Rounded CN', system-ui, sans-serif;`
   - 删除没有随包提供的 `Noto Sans SC` / `Noto Sans`。
   - 中文家族名以第 1 步的许可证结论为准。
5. **自检**：新增测试，断言 tokens 里每个具名字体在 `fonts.css` 都有 `@font-face`。

验收：

- 中文页面截图，浅色、深色各一张，标题与正文都用资源圆体渲染：在浏览器里核对实际使用的字体。
- 纯英文页面的网络请求里没有中文字块。

## S10 表面层次（问题 3）

现在 light 主题下 `--game-ui-bg`、`--game-ui-panel`、`--game-ui-surface` 都是 `#fffdf8`，
dark 下都是 `#1f2326`，产品没法用 token 分出层次。

**收敛为四个层级 + 一个阴影**，删除 `--game-ui-panel`、`--game-ui-panel-strong`、`--game-ui-panel-deep`
以及重复的表面名，写进迁移表：

| token                       | 用途           | light                                                       | dark                                                        |
| --------------------------- | -------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `--game-ui-bg`              | 页面           | `#fffdf8`                                                   | `#1f2326`                                                   |
| `--game-ui-surface`         | 页面上的卡片   | `color-mix(in srgb, var(--game-ui-text) 4%, var(--game-ui-bg))` | `color-mix(in srgb, var(--game-ui-text) 6%, var(--game-ui-bg))` |
| `--game-ui-surface-sunken`  | 凹陷、静态底   | 文字色 8%                                                   | 文字色 11%                                                  |
| `--game-ui-surface-raised`  | 浮层、弹窗     | `#fffdf8`，配 `--game-ui-shadow-raised`                     | 文字色 9%，配 `--game-ui-shadow-raised`                     |

- `--game-ui-shadow-raised`：light `0 12px 32px rgb(0 0 0 / 0.12)`，dark `0 12px 32px rgb(0 0 0 / 0.45)`。
- 组件按用途改用新 token：卡片、面板用 surface；弹窗、浮层用 surface-raised；轨道、凹槽用 surface-sunken。
- `tailwind.css` 桥：card → surface，muted → surface-sunken，popover → surface-raised。
- 风格配方保持不变；十二个块的对比度检查必须仍然全部通过（≥ 4.5:1）。

验收：`pnpm check:themes` 通过；展厅首页在浅色、深色下都能看出三层。

## S11 组件能力（问题 6、7、9）

**1. 按钮可以当链接（问题 6）**

- `GameButton` 与 `GameIconButton` 增加 `href`，有它就渲染 `<a>`，外观与交互和按钮相同：
  水滴、primary 的潮汐液体、按压只变背景。同时支持 `target`、`rel`、`download`。
- 增加 `linkComponent`：可以传入路由链接组件（例如 Next 的 `Link`），它接收
  `href`、`className`、`children` 和 ref。
- 禁用的链接按钮渲染为不带 `href`、带 `aria-disabled="true"` 的 `<a>`，不可聚焦点击。
- 规则写进指南：链接型主按钮也受"一屏最多一个 CTA"约束，只用于"开始 / 收下"类主操作。

**2. 按钮小号（问题 9）**

- `GameButton`、`GameIconButton` 增加 `size: 'md' | 'sm'`，默认 `md`。
- `sm`：高 32px，左右内边距 12px，字号 14px。图标按钮 `sm` 为 32×32。
- 水滴几何随尺寸缩放，缓波上限不变。

**3. 液体弹出面板 `LiquidPopover`（问题 7）**

放在 `./liquid-presence` 入口，内部组合 `LiquidAnchor` 与 `LiquidReveal`：

- 参数：`open`、`onOpenChange(open)`、`source`（启动按钮的 ref）、`placement`（默认 `bottom-end`）、
  `title`、`width`（默认 440）、`children`。
- 打开时：每次打开生成新的 `revealKey`；焦点移到标题；`role="dialog"`、`aria-modal="false"`、
  `aria-labelledby` 指向标题。
- `Esc` 或点击面板外关闭，关闭后焦点回到 `source`。
- 窄屏（< 768px）自动改为 `top` 放置，宽度为视口减 24px。
- 遵守现有液体预算：超出预算时静态呈现，不调高预算。
- 面板内的按钮用 secondary（面板本身已经是液体）。指南写明这一点。

验收：每项都有浏览器测试，覆盖键盘、焦点、减少动态和窄屏。

## S12 展示组件家族化与液体进度条（问题 8）

**新的规则**（写进 `theme-and-liquid.md`）：

- 能按的东西是水滴，按下会变形。
- 只用来看的东西也是水滴形，但是静止不动。
- 液体只给四处：主按钮、液体面板、涟、进度条的液面。

**具体改动**：

- **`GameBadge`**：静止的小水滴（复用 `DropletSurface`，不响应按压，缓波 ≤ 1px）。
  高 24px，左右 10px，字号 12px / 600。`tone` 的颜色取各风格的语义配方；灰阶和包边风格按现有规则去色。
- **`GameToast`、`GameCallout`、`GameTooltip`**：背景改为静止水滴面（缓波 ≤ 1.4px），文字布局不变。
- **`GameProgress` 液体进度条**：
  - 轨道：静止水滴长条，`--game-ui-surface-sunken`，高 10px。
  - 液体：潮汐配色（`--game-ui-cta-from` → `--game-ui-cta-to`），右端是液面，用缓波画出弯月形。
    数值变化时液面晃动约 600ms 后静止；**没有待机动画**。
  - 用 SVG 路径和 CSS 实现，**不占用液体滤镜预算**。
  - 减少动态时直接到位、不晃。
  - 保留原生 `progressbar` 语义与数值。

验收：

- 展厅里 12 种风格 × 明暗组合的截图，展示组件都呈现静止水滴。
- 进度条从 0 到 100 的变化有一组截图，并验证静止后不再重绘。

## S13 Next.js 适配（问题 5）

- 构建时给含 React 组件的入口文件和分块加上 `"use client";` 指令：`index`、`liquid-presence`、
  `liquid-effects`、`preview`。纯 CSS 和纯类型文件不加。
- 新增打包后消费者测试：在临时目录建一个最小的 Next.js App Router 项目，安装实际 tarball。
  服务端组件里**直接**引入 `GameButton`、`GameBadge`、`LiquidPopover`，必须能 `next build` 成功并渲染。
  这个测试并入 `check:packed` 或作为独立脚本，不进普通 `pnpm test`，以免太慢。

## S14 文档、版本与预发布（问题 1）

1. **迁移表** `migration-3.0.md`：逐项补齐 S7–S13 的删除、改名、新增和视觉变化。
   - 黏土图标给出旧名 → `GameIcon` 名的对照，并写明"需要彩色黏土插图的产品，升级前自行把需要的图片复制到产品仓库"。
2. **已知受影响的产品**（只写说明，不改它们的仓库）：
   - **University**：大量使用黏土图标与 `setClayAssetMode`，还用到成就页的 crown / trophy / medal；任务 16 改为接入 `3.0.0-rc.1`。
   - **Directing**：用到 `setClayAssetMode` / `setClayAssetBasePath`（目前锁在 2.13，升级时处理）。
   - **SwimmerAuthKit 0.8.0-rc.0、SwimmerNerveKit 0.8.0**：需要对 rc.1 重跑 UIKit-3 兼容测试。
     注意 `>=2.6.1 <4` 这类范围默认**不包含**预发布版本，安装时会出现对等依赖提示。
   - **SwimmerParty-Website**：可以删除自己做的表面色、客户端导出层、自拼的液体面板和路由跳转按钮，改用 rc.1。
3. **其余文档**：
   - README、`CHANGELOG.md`（新增 `3.0.0-rc.1` 一节）、组件选择指南、`design-tokens.md`、`theme-and-liquid.md`。
   - `current-work.md`：S7–S14 的进度与证据。
   - 运行 `pnpm api:inventory`。
4. **版本**：`package.json` 改为 `3.0.0-rc.1`。
5. **发布工作流** `.github/workflows/npm-publish.yml`：
   - 版本号带预发布后缀（含 `-`）时用 `npm publish … --tag next`，否则用 `latest`。
   - 加一步发布后检查：`npm view @pieai/swimmer-ui-kit dist-tags`，预发布时 `next` 等于新版本，且 `latest` 没有变化。
6. **本地完整门禁**：
   - `pnpm verify`、`pnpm docs:check`、`pnpm build-storybook`；
   - `pnpm pack` 后运行 `pnpm check:packed <tarball>`、publint 严格检查、attw，以及 S13 的 Next 消费者测试。
   - 记录 tarball 的 SHA-256。
7. **推送 `main`，触发发布**：`gh workflow run npm-publish.yml --ref main`，跟踪到结束。
   - 成功标准：`npm view @pieai/swimmer-ui-kit@3.0.0-rc.1 version` 可见；`dist-tags` 中 `next` 为 `3.0.0-rc.1`，`latest` 仍为 `2.14.0`。
   - 失败就停止，不重试第二次，写报告。

## 报告

写到 `.devspace-reports/uikit-3-completion/REPORT.md`（不提交），截图放同一目录。报告用中文，依次写：

1. 每个阶段的结论；
2. 提交列表；
3. 命令与结果，包括失败过的检查和修法；
4. 新旧对比截图索引（图标、字体、表面层次、展示组件、液体进度条、按钮链接和小号、液体面板）；
5. 资源圆体许可证结论、切分大小与块数；
6. 迁移表摘要；
7. 发布结果（版本、标签、tarball 校验值、工作流运行链接）；
8. 未做或未验证的事项；
9. 下游产品要做的事。

报告全文也贴在对话里。
