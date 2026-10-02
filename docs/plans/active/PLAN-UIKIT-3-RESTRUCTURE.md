---
id: PLAN-UIKIT-3-RESTRUCTURE
title: UIKit 3.0 Restructure
type: plan
status: active
canonical: true
owner: project
created: 2026-10-01
last_reviewed: 2026-10-02
domain: ui-components
tags:
  - restructure
  - liquid
  - release
pinned: false
related:
  - REF-CURRENT-WORK
  - REF-PUBLIC-API-INVENTORY
  - REF-DESIGN-SYSTEM-GUIDE
supersedes: []
superseded_by: null
---

# UIKit 3.0 大手术

给执行的 AI（Codex）读。一次只做一个阶段，每个阶段结束时仓库是绿的、可以停下来；
阶段的验收条件没有全部满足之前，不进入下一阶段。

## 授权与边界

- **Owner 2026-10-01 批准**：完全同意方案，接受更激进的做法。原则按重要性排：
  1. 健康、清晰，AI 读得懂；
  2. 解耦、模块化，人看得懂；
  3. 简洁高效。为此不惜代价。
- **三件拍板**：
  - **D1**：只给 OwnMySpace 用的盖房子、施工队工具移出品牌包，直接删；OwnMySpace 锁在 1.3.0，不受影响，它的改版另行处理。
  - **D2**：零使用的金属质感按钮（WebGL）和黏土配色变量删除。
  - **D3**：融化、弯曲两种液体特效保留，移到单独的子入口，不进默认包。
- **兼容策略：干净断代，不留兼容层。** 14 个产品都锁了精确版本，3.0 不会让任何一个被动坏掉；谁升级谁迁移。兼容层会让「健康的包」里同时有两套说法，违背原则 1。2.14.x 只在线上产品确有急需时打补丁。
- **单主线**：直接在 `main` 上做，不开长期分支。每个阶段至少一个提交，每个提交都过 `pnpm verify` 和 `pnpm docs:check`。npm 上的版本不变，所以 main 上的中间状态不会影响任何产品。
- **不在本计划内**：
  - 各产品接入 3.0。每个产品另有提示词，University 和 SwimmerNerveKit 先接。
  - 发布到 npm。最后一个阶段停在发布候选，等 Owner 点头。
- **并行约束**：本计划执行期间，Claude 不在 SwimmerUIKit 里改代码，只做阶段评审。遇到本计划没写到、又会影响产品的取舍，停下来写清选项，交 Owner。

## 现状（2026-10-01 实测）

- `src/` 平铺 121 个文件：65 个源文件约 1.94 万行，47 个测试文件（其中 14 个浏览器测试）。最大的是 `GameUiPreview.tsx`（1963 行）、`liquidGooeyImageMelt.tsx`（1751 行）、`liquidGooeyEngine.ts`（1072 行）、`liquidMetalWebGL.ts`（1052 行）。
- `styles.css` 4655 行，所有组件的样式都在里面；`theme.css` 562 行。
- `index.ts` 导出 295 个名字（132 个值、163 个类型）。扫描 14 个产品加 University 的源码，实际被引用的只有 89 个。
- **零使用的值**：
  - `LiquidMetalButton` 及其 WebGL 与预算（约 1270 行）；
  - `CLAY_*_TOKENS`；
  - 液体内部表 `LIQUID_FORMS`、`LIQUID_FORM_NAMES`、`liquidFormGroup`、`liquidFormSummary`；
  - 预算的默认值与 getter；
  - `GameCardFan`、`GameHud`、`GameOrientationGate`、`GameWindowPanel`、`FirstSessionHud`、`useGameSplashDelay` 等。
- **只有 OwnMySpace 用的**：`GameTerrainBuildTools.tsx`（998 行）、`GameContractorTools.tsx`（914 行），以及 `GameSurfacePack` 里的资产库部分。
- **注意保留的**：
  - `GameOtpInput` 是 2.13 为 University 账号流程新加的，还没接入，保留；
  - `setLiquidGooeyBudget` 被 SwimmerNerveKit 使用，保留。
- **两套液体重量**：
  - 「厚」：各形态的 gloss 4–6、blob 2–7、两层投影，是现在的默认；
  - 「涟」：blur 5、contrast 18、gloss 1.5（亮光收进边缘 1 像素）、轮廓 3.5 px 三瓣、贴地软影、上浅下深的渐变，只在涟和 `LiquidFill` 里用。
- 仓库里提交了的杂物：
  - `artifacts/`（269 个文件，21 MB，测量截图）；
  - `SCRATCH/`（7 个）；
  - `liquid.html`、`index.html`（站点入口，要核对还用不用）；
  - `public/` 351 个黏土素材（图标经 `getClayIconPath` 对外，属于公开契约）。
- 文档 79 篇 Markdown，其中 `docs/archive/legacy-doc` 等历史材料、多篇 OwnMySpace 报告、两篇 active 的 spec（SPEC-0001 stable、SPEC-0002 v1 release readiness）需要清点。

## 目标形状

### 目录

```
src/
  tokens/          颜色、字体、尺寸、圆角、动效、液体配色：唯一来源，含 theme.css
  liquid/          液体引擎：group、item、filter、geometry、spring、move、evolve、
                   waviness、shadow、budget、finish、material（涟的重量）、
                   forms（只管动作）、surface、press-surface
  liquid-effects/  融化与弯曲（D3），子入口 `./liquid-effects`
  presence/        涟：水滴、面板（reveal）、anchor、跟随、几何、动作、绘制、hooks；
                   子入口 `./liquid-presence` 保持
  controls/        Button、IconButton、Input、Field、TextArea、Select、Checkbox、
                   Toggle、Slider、SegmentedControl、Tabs、OtpInput、ListRow …
  feedback/        Toast、Callout、Progress、LoadingState、EmptyState、HelpTip、
                   Badge、Tooltip …
  containers/      Panel、Modal、Dialog、CollapsiblePanel、PanelSystem、Shell、
                   HudActions …
  game/            CollectibleCard（含朝向）、Splash、交互音效、Avatar、StageTile …
  icons/           黏土图标与素材解析（公开路径不变）
  preview/         GameUiPreview、LiquidPreview：子入口 `./preview`，不进主包
  index.ts         只列公开接口，按上面的分组写短注释
```

- **一个组件一个文件夹**：`Component.tsx`、`component.css`、`Component.test.tsx`、需要时加 `Component.browser.test.tsx` 和 `Component.stories.tsx`，再加一篇几行的 `README.md`（做什么、主要参数、什么时候不该用）。
- 一个文件里塞多个组件的（`ClayComponents.tsx`、`GameSurfaces.tsx`、`GameSurfacePack.tsx`、`GamePanelSystem.tsx` 等）按组件拆开。
- **组件名保留 `Game*` 前缀**：这是品牌词，14 个产品都在用，改名只增加迁移成本、不增加健康度。只修正不一致的个例，并写进迁移表。
- 文件搬家一律用 `git mv`，保留历史。

### 样式

- 每个组件的样式和组件放在一起，由 `scripts/build-css.mjs` 按「tokens → 引擎 → 组件」的顺序拼成 `dist/styles.css`。输出路径和 `./styles.css` 子入口不变，产品不用改引入方式。
- 继续守 `bin/swimmer-ui-check.mjs`：token 块以外不许写裸颜色。

### 公开接口

- 目标约 120 个名字：被产品用到的值和它们的参数类型，加上真正给二次开发用的少数原件（`LiquidGroup`、`LiquidSurface`、`liquidFormItem`、`setLiquidGooeyBudget`）。
- 内部表、默认值常量、只给预览用的名字一律不导出。
- `docs/reference/migration-3.0.md`：用 `pnpm api:inventory` 的前后差异生成，每个改名或删除的名字一行，写明「换成什么」或「删了，原因」。

### 主题：二维水滴，液体只给 CTA

Owner 2026-10-01 定稿（对比页第三版，选择原文：`UI 第二版：Q1=淡彩，Q2=灰阶，Q3=液体·潮汐，Q4=一点点`，并要求六套风格全部保留进品牌 UI）。

**两层，各管一件事：**

- **普通控件：二维水滴。** 平的，没有厚度；边是水滴的边，有一点不规整；按下时像水一样横向摊开、边晃一下再弹回。
  - 范围：除 CTA 以外的按钮（secondary、ghost、success、danger）、`GameIconButton`、选项行、标签页、分段、开关、列表行。输入框只换边和底色，不做按压形变。
  - 没有底边（删掉 `--game-ui-button-lip-depth`）、没有投影、没有渐变、没有高光、没有亮边。层次只靠色块、边和留白。
  - 选中：换成该风格的「选中」样子并加对勾，**不鼓起来、不变大**，一列选项左右两端保持对齐。
  - **用路径画，不用液体滤镜。** 液体滤镜的硬阈值会让细边出现台阶锯齿（Owner 一眼看出）。新做一个平面水滴原件：按控件尺寸生成一条平滑的闭合曲线（圆角矩形沿法线加两组整数频率的缓波，Catmull-Rom 转三次贝塞尔），SVG `path` 填色加描边（`vector-effect: non-scaling-stroke`）；按下是一组欠阻尼弹簧，驱动横纵缩放和波幅。参考实现：本机 `.scratch/flat-droplet-reference.jsx`，对比页成品：本机 `.scratch/ui-second-version.html`（浏览器直接打开）。按 UIKit 的结构重写，不要照抄。
  - 边的不规整程度：Owner 选「一点点」，全部风格一样。做成 token `--game-ui-droplet-wobble`（对比页里是 1.4 px；长条行的上限同值），原件在测量尺寸时读它。减少动态时不动。
- **CTA：唯一的液体按钮。**
  - CTA 就是 `GameButton variant="primary"`：推动主线往前的那一步（开始、确定、下一步、收下、付款）。primary 默认画成液体，不用再传 `surface`。一屏最多一个，这条写进组件选择指南，storybook 示例做对。
  - 样子用涟的重量：blur 5、contrast 18、gloss 1.5（亮光收进边缘 1 像素）、轮廓 3.5 px 三瓣、贴地软影 `0 6px 14px`、`LiquidFill` 上下渐变 sheen 0.3。
  - 颜色：涟的「潮汐」，`--game-ui-cta-from: #22d3ee`、`--game-ui-cta-to: #22bb91`，六套风格都一样；字用深墨色（渐变中段对比度 7.3）。不再用珊瑚（Owner：太丑）。
  - 涟本身、`LiquidReveal` 面板、`LiquidFill` 用同一套液体重量。液体滤镜只留给它们。
- **厚重量删除，不留开关。** 形态（press、swell、settle、drain …）只保留动作差异：姿态、回弹、过渡，以及 `set` 的变硬。多物体形态（merge、split、bead、follow）为了桥接间隙保留自己的 blur，亮光用同一材质。
- **`surface` 参数**：primary 固定液体、其余固定水滴以后，按 S3 的使用清点决定 `surface` 和 `plaque` 删还是留；删了写进迁移表。

**六套风格全部进品牌 UI，存法是「一个原件 + 六个 token 块」，不是六套组件：**

- 风格和明暗是两条独立的轴：已有的 `data-game-ui-theme="light|dark"` 不动，新增 `data-game-ui-style`，取值 `candy`（彩色）、`pastel`（淡彩）、`mist`（雾色）、`grey`（灰阶）、`outline`（包边）、`ink`（黑白包边）。不写时的默认值是 `pastel`。六套 × 两种明暗 = 十二个 token 块，组件代码里不出现风格名。
- 每个 token 块只定义语义变量，组件只读语义变量，例如：
  - 平时：`--game-ui-control-fill`、`--game-ui-control-edge`、`--game-ui-control-edge-width`、`--game-ui-control-text`；
  - 选中：`--game-ui-control-on-fill`、`--game-ui-control-on-edge`、`--game-ui-control-on-text`；
  - 有含义的控件（分类篮子这种「颜色就是它是谁」的）：`--game-ui-control-meaning-fill`、`-text`。
- 颜色来源：控件可带 `hue`（coral、sun、leaf、sky、grape、pink），组件把它映射成局部变量 `--hue`，各风格用它算出自己的颜色。彩色、淡彩用 C 档 `--game-ui-tint-*`；雾色用同六色加灰的 `--game-ui-mist-*`；灰阶、包边、黑白包边不用色相。淡彩的「平时」用 `color-mix(in srgb, var(--hue) 38%, var(--game-ui-paper))` 这类公式写在 token 里，不在组件里分支。
- 每套风格的颜色以对比页为准（源码 `.scratch/ui-second-version-source.jsx` 里的 STYLES 表；成品 `.scratch/ui-second-version.html`），下面是摘要：

  | 风格 | 给谁 | 平时 | 选中 | 有含义的控件 |
  | --- | --- | --- | --- | --- |
  | 彩色 candy | 年纪小的 | 纸色 + 细边 | C 档色 | C 档色 |
  | 淡彩 pastel | 年纪小的 | 色相 38% 混纸色，无边 | C 档色 | C 档色 |
  | 雾色 mist | 大人 | 纸色 + 细边 | 雾色 | 雾色 |
  | 灰阶 grey | 大人 | 浅灰块，无边 | 墨色底、纸色字 | 深一档的灰 |
  | 包边 outline | 大人 | 和背景同色，只有一道淡边 | 边变墨色 2 px、底略深 | 同「平时」 |
  | 黑白包边 ink | 大人 | 和背景同色，墨色实边 | 墨色底、纸色字 | 同「平时」 |

  C 档：珊瑚 `#f4876b`、向日葵 `#f7c948`、嫩叶 `#72c58f`、晴空 `#6bb3ea`、葡萄 `#b39bf0`、泡泡糖 `#f59ac2`；雾色：`#c99a86`、`#d6c39a`、`#a7bba3`、`#9fb3c6`、`#b4a8c4`、`#cfa8ae`。深色字 `#2a2320` 在 C 档上不低于 5.8:1，在雾色上不低于 6.2:1。深色主题：彩色和雾色不变暗，纸色和大块的底换深色。
- 选中一律加对勾，所以颜色少的几套（灰阶、包边、黑白包边）不只靠颜色区分选中。
- 加一个检查：十二个 token 块都定义了全部语义变量；每个块里「文字 / 底色」的组合对比度不低于 4.5:1（可点的控件）。
- **University 的用法**（产品侧，不在本仓库做）：年纪小的学习者用 `pastel`，大人用 `grey`。

**其余：**

- **配色 token 改名**：`--game-ui-liquid-*` 改为 `--game-ui-tint-*`（平面控件也用它），另加 `--game-ui-mist-*` 和未选中用的 `--game-ui-tint-cream`。
- **语气对应**：primary → 潮汐液体 CTA；secondary → 风格的「平时」；success → 嫩叶（有含义，灰阶和两套包边仍去色）；danger 按下面的评审补充执行。
- **S4 评审补充（Owner 委托 Claude 决定，2026-10-02；Owner 再次确认照此执行）**：危险操作在六套风格里都必须认得出来，只用红字、不用红底。danger 的底色保留各风格的「平时」，字使用对应明暗的 `--game-ui-danger-ink`；包边、黑白包边的边也使用同色。彩色、淡彩、雾色的原有风格配色和其他控件不变，不再把危险色当按钮底色。success 和其他有含义的颜色在灰阶、包边、黑白包边仍按表去色，只有 danger 的红字例外。十二组合及各色相的文字/底色对比度不低于 4.5:1；浏览器同时检查 danger 与 secondary 的实际文字颜色不同、实际 SVG 背景为该风格普通底色而不是危险红底。开关的轨道和圆点使用现有语义变量，不另造黑色描边配方。
- **评审状态**：Claude 已看过十二组合、8 倍边缘、375/390 窄屏和水滴几何/控制器，结论通过。上述补充实施并复验后可提交 S4、继续 S5/S6；npm 发布仍须另获 Owner 明确批准。候选版由 Claude 在 University 安装并跑完整门禁，本仓库不代做产品迁移。
- **涟的引导文字**（`LiquidPresence` 的 `guideContent`）装进涟的 material 面板，和 `LiquidReveal` 同一个样子，不再是平的卡片。

### 文档与治理

- **文档按「人和 AI 都能一次读懂」重组**：
  - `README.md`：是什么、怎么装、去哪看；
  - `docs/reference/`：只留现行的
    - 组件选择指南（含自动生成的接口清单）；
    - 液体与主题；
    - 设计 token；
    - 迁移指南；
    - 当前工作索引；
    - 文档地图。
  - `design-system-guide`、`liquid-primitives`、`game-surface-pack`、`usage-and-upgrade-playbook`、`liquid-next-stage-research` 等合并或归档，不保留两份说同一件事的文档。
- **删、归档、浓缩**：
  - 已经被代码或新文档取代的计划报告和历史设计稿：移到 `docs/archive/`，或删除（git 历史在）；
  - 只关 OwnMySpace 的报告随 D1 归档；
  - `docs/reference/learnings/` 保留仍然适用的，过时的删掉；
  - SPEC-0001、SPEC-0002 核对后关闭或改写。
- **PGS**：
  - `AGENTS.md` 路由按新目录改写；
  - `docs:check` 全过；
  - 改动 pinned 的 current-work 时，提交信息带 `Pinned-Override: REF-CURRENT-WORK`；
  - 共享规则仍然是 symlink，不改成实体文件。
- **根目录**：
  - `artifacts/`：删除，或只留被现行文档引用的（引用的随文档一起归档）；
  - `SCRATCH/`：删除；
  - `liquid.html`、`index.html`：站点和 storybook 还用就留，不用就删；
  - `.gitignore` 补上 `SCRATCH/`、`artifacts/`、`debug-*.log`；
  - `public/` 只保留公开图标路径实际用到的素材，删除前列出被删路径并确认没有产品引用。

## 阶段

每个阶段的通用验收：`pnpm verify`、`pnpm docs:check` 全过；`pnpm build-storybook` 能构建；在 current-work 里记一行进度。

1. **S0 基线。**
   - 记录现状数字：文件数、行数、导出数、测试数、`dist` 体积、storybook 能否构建。
   - 用 Playwright 给 storybook 每个 story 在浅色和深色下各截一张图（DPR 1），放在 `.scratch/baseline/`，不提交。S1–S3 的「不改样子」靠它对比。
2. **S1 目录与拆分。**
   - 按目标目录搬家、拆多组件文件。
   - 行为和样子都不变，截图逐张对比无差异，导出名字不变。
3. **S2 样式拆分。**
   - `styles.css` 拆到组件旁，构建产物的规则集合与拆分前等价（排序可以不同）。
   - 截图无差异，`check:styles` 过。
4. **S3 删除与收窄。**
   - D1、D2、D3；把零使用和内部名字移出公开接口；`./preview`、`./liquid-effects` 子入口。
   - 生成迁移表。截图除被删组件外无差异。
5. **S4 主题。**
   - 平面水滴原件、六套风格 token、潮汐液体 CTA、按钮语气、涟的引导面板。Owner 的选择已经定稿，见上面「主题」一节。
   - 这是唯一允许改样子的阶段：新截图和基线并排放进一页对比，交 Claude 评审后再提交。
6. **S5 文档与治理。**
   - 按上节重组文档、清根目录、改 `AGENTS.md`。
   - `docs:check` 全过，文档里不再出现已删的名字（`rg` 验证）。
7. **S6 发布候选。**
   - `package.json` 版本 3.0.0，CHANGELOG 写清断代、删除和迁移入口；`verify`、`docs:check`、`build-storybook`、`publint`、ESM 类型检查全过；报告体积变化。
   - **停在这里**，在 current-work 记「3.0.0 候选，待 Owner 批准发布」，交报告。

## 验收（整体）

- [ ] `src/` 按目标目录组织，一个组件一个文件夹，没有一个文件夹装着不相关的东西。
- [ ] `src/` 根目录只剩 `index.ts` 和各子入口文件。
- [ ] 公开接口约 120 个名字；迁移表覆盖每一个改名和删除。
- [ ] 只有一套液体外观（涟），厚重量和它的开关都不存在了。
- [ ] 液体只出现在 CTA、涟、`LiquidReveal` 和 `LiquidFill` 上；普通控件的计算样式里没有 box-shadow、渐变和底边（浏览器测试验证）。
- [ ] 六套风格 × 明暗都能切换，十二个 token 块齐全、对比度达标（自动检查）；平面水滴的边在 DPR 1 下放大看没有台阶。
- [ ] 组件选择指南写明「一屏最多一个 CTA」，storybook 示例守这条。
- [ ] 配色由 token 决定；换一档只改 token 块。
- [ ] 文档没有重复、没有过时的现行文档，`docs:check` 全过。
- [ ] 根目录没有提交进来的测量截图和临时目录。
- [ ] 每个阶段一个可回滚的提交，每个提交都是绿的。

## 收尾

Owner 批准后发布 3.0.0（`gh workflow run npm-publish.yml --ref main`），用 `npm view` 回读版本和 latest。然后把本计划移到 `docs/plans/completed/`，`status: completed`。各产品的接入另起任务。
