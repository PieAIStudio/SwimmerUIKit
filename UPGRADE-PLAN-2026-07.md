# SwimmerUIKit 升级计划（2026-07 全面评估产出）

> 本文件由 Claude Fable 5 全面评估后撰写，供执行 AI（Sonnet 等）自主执行。
> 位置在仓库根目录，属于非治理文档（product artifact）。执行完成后可归档或删除。

## 0. 执行者须知（先读这一节）

**开工前必读**（项目 CLAUDE.md 已有要求，此处重申）：

1. `docs/policy/best-practice-for-this-project.md`
2. `docs/governance/boundary.md`、`docs/governance/agents-routing/engineering-runtime-v1.0.md`
3. `docs/reference/execution/current-work.md`
4. `docs/reference/design-system-guide.md`（token 三层架构、主题配方、守卫规则）
5. 每批动工前运行 `pnpm pro-gov learn recall --query "<任务摘要>"` 并阅读相关命中。
6. 若要新建/修改 `docs/**` 下的治理文档，先读 `docs/governance/ssot-v1.0.md`、
   `doc-agent-rules.md`、`doc-types.md`，并用 `pnpm doc-gov find <topic>` 查重。

**硬性约束（不可违反的项目合同）**：

- **raw 颜色只能住在 `src/theme.css`**。组件规则只准引用 token；半透明一律
  `color-mix(in srgb, var(--token) N%, transparent)`。由 `src/tokens.test.ts` 守卫。
- **`styles.css`/`theme.css` 必须是 100% 标准 CSS**，禁任何 Tailwind at-rule。
  CSS 构建用 lightningcss，出现任何 warning 即构建失败（`scripts/build-css.mjs`）。
- **零运行时依赖**。不得新增任何 runtime dependency；优先浏览器原生能力
  （`<dialog>`、popover API、color-mix、cascade layers）。
- **1.x 兼容合同**：消费方升级零代码改动。任何"打破"必须是 packaging-only 且
  逐一验证 7 个消费项目未使用（先例见 SPEC-0002 的 1.0 做法）。
- 组件样式全部包在 `@layer swimmer-ui` 内；触控目标 ≥44px；所有动效必须有
  `prefers-reduced-motion` 降级；hover 位移必须包 `@media (hover: hover)`。

**每批完成后的验证命令**（全绿才算完成）：

```bash
pnpm typecheck && pnpm test && pnpm build && pnpm build-storybook && pnpm docs:check
npx publint && npx @arethetypeswrong/cli --pack .
```

**消费项目清单**（验证"下游未使用"时逐一 grep 这些仓库）：
`~/PieAI/Anvil`、`~/PieAI/Break`、`~/PieAI/Collapse`、`~/PieAI/OwnMySpace`、
`~/PieAI/Show`、`~/PieAI/TuringPact`、`~/PieAI/YaZu`。

**建议分 4 批各自成 PR**，按下面顺序执行。每批内条目已按优先级排列。

---

## 第 1 批（P0）：真 bug 与品牌级缺陷

### 1.1 GameRadialMenu 完全没有样式（bug）

**证据**：`src/GameSurfaces.tsx:187-197` 渲染 `.game-ui-radial-item`，但
`src/styles.css` 里不存在该类的任何规则（只有容器 `.game-ui-radial-menu` 在
一条共享 flex 规则里）。演示页上 Wave/Think/Doubt 三个按钮渲染成浏览器默认
灰框按钮，与整体黏土风格完全脱节。另外它声明了 `role="menu"`/`role="menuitem"`
却没有实现 ARIA menu 键盘模式（方向键导航），属于 a11y 违约。

**改法**（二选一，倾向 A）：

- **A（推荐）**：把它降级为普通的快捷动作排（它现在本来就是横排 flex，不是
  radial）。改 `role="menu"` 为 `role="group"` + `aria-label`，menuitem 改普通
  button；给 `.game-ui-radial-item` 补黏土样式（复用 `.game-ui-icon-button` 的
  视觉配方：`surface-raised` 底、`radius-control`、`shadow-button`、44px 触控、
  touch-action/tap-highlight 硬化、focus-visible 环、hover 包裹）。加 `onSelect`
  回调（现在的按钮点了什么都不发生，props 里根本没有回调——顺手补上
  `onSelect?: (id: string) => void`，保持向后兼容的可选参数）。
- **B**：真做成扇形/环形 radial menu。工作量大，仅当消费项目确有需求才做
  （先按第 3 批 3.1 的调研结论决定）。

**验收**：Storybook 新增/更新 GameRadialMenu story；演示页三个按钮与整体风格
一致；键盘 Tab 可达、focus 环可见；`pnpm test` 通过。

### 1.2 按钮与选中态对比度系统性不达标（a11y，影响所有消费项目）

**证据**（按 WCAG 相对亮度实测计算）：

| 配对 | 实测 | 要求 |
| --- | --- | --- |
| 主按钮文字 `--game-ui-accent-contrast` #fff8ec on `--game-ui-accent` #e8743b | **2.84:1** | 4.5:1（正文字号加粗仍不足 large-text 的 3:1 也仅勉强） |
| danger 按钮 #fff8ec on #d85a45 | 3.64:1 | 4.5:1 |
| success 按钮 #16382d on #4f9d6b | 3.89:1 | 4.5:1 |
| 激活 tab #fff8ec on `--game-ui-secondary` #1d9a8b | 3.29:1 | 4.5:1 |
| night 主题主按钮 #fff8ec on #ef8148 | **2.52:1** | 4.5:1 |

按钮文字约 15px/860 字重，不属于 WCAG large text（需 ≥18.66px bold），所以
适用 4.5:1。这是"品牌底色偏亮 + 白字"的系统性问题，不是个别组件问题。

**改法**：只动 `src/theme.css` 的 token 值（组件规则不动，这正是 token 化的
红利）。两条路线，做视觉试验后择一，或分场景混用：

- 路线一：把按钮文字换成深墨色——新增语义 token `--game-ui-on-accent`（浅色
  主题取 ink 系深色，如 #3b2d23 系），`.game-ui-button--primary` 等改用它。
  黏土/玩具风格用深字橙底非常常见（视觉上也更"糖果"）。
- 路线二：压深 accent/danger/success 的基色直到 ≥4.5:1（如 accent 向
  #c85a20 方向），`-bright` 渐变端同步微调。风险是品牌色变闷。

night 主题需单独调一遍（问题更严重）。

**同时新增守卫测试**（关键，防止回归）：在 `src/tokens.test.ts` 增加
"contrast guard"——解析 `theme.css` 中声明的前景/背景配对清单（在测试文件里
显式维护配对表：text/bg、text-muted/panel、on-accent/accent、on-success/success、
accent-contrast/secondary、night 全套……），实现 WCAG 相对亮度计算，断言
≥4.5（正文）或 ≥3.0（明确标注 large/非文本的配对）。这完全符合本项目
"guard test 固定合同"的文化。

**验收**：守卫测试全绿；Storybook 里主/次/成功/危险按钮、tabs、night 主题
截图肉眼确认没有"变脏"；CHANGELOG 记录视觉变化（minor 版本）。

### 1.3 品牌字体从未被加载（品牌一致性缺陷）

**证据**：`src/theme.css:15-16` 声明
`--game-ui-font-display: 'Baloo 2', 'Geist Variable', 'Noto Sans SC', ...`，
但**kit、演示站、全部 7 个消费项目里没有任何 `@font-face`、fontsource 或
字体链接**。在作者机器上正常显示只因本机安装了这些字体；最终用户全部静默
回退到系统字体。同时 `--game-ui-weight-body: 620`、`860`、`930` 这类字重
只有可变字体能渲染，回退字体会被浏览器归到 400/700，视觉层级全变。

**改法**（分两步）：

1. kit 新增可选子路径导出 `@pieai/swimmer-ui-kit/fonts.css`：
   - 内容为 `@font-face` 规则 + 随包发布 woff2（放 `dist/fonts/`，
     `package.json` files/exports 同步）。
   - 建议只随包发 **Baloo 2**（display 字体，latin 子集很小）与
     **Geist Variable**；**Noto Sans SC 体积过大不随包发**，在文档里给
     fontsource/CDN 配方（`@fontsource-variable/noto-sans-sc` 或宿主自行
     子集化）。这样不违反零运行时依赖（字体是静态资产）。
   - 演示站与 Storybook 引入 fonts.css，让"看到的就是用户看到的"。
2. `docs/reference/design-system-guide.md` 与 `usage-and-upgrade-playbook.md`
   增加"字体"一节：加载方式、不加载的后果、非标准字重依赖可变字体的说明。
   之后把 7 个消费项目逐个接上（消费项目一行 import 即可）。

**验收**：演示站在 `document.fonts` 里能看到已加载字体；打包后
`npx publint` 通过；文档更新过 doc-gov 检查。

### 1.4 文档漂移修正（小，顺手做）

**证据**：`docs/reference/design-system-guide.md:74-75` 说 TuringPact 的
`clay-overrides.css` 是 651 行；实际已 1525 行（其中直接触碰 `.game-ui-*`
选择器的只有 57 处，大头是 `.tp-*` 产品自有样式，性质不算对抗，但数字失真、
表述过时）。

**改法**：更新该段描述为现状（"产品自有样式与 token 覆写共存，`.game-ui-*`
覆写仅 N 处，目标是继续保持仅 token 覆写"）。改动走 doc-gov 流程
（`last_reviewed` 等 frontmatter 同步）。

---

## 第 2 批（P1）：生态治理与打包（"中央厨房"的核心价值）

### 2.1 下游 token 采用守卫 + Break 试点迁移

**证据**：token 采用度两极分化——Anvil 181 处 `var(--game-ui-*)`、0 裸色值
（模范）；OwnMySpace 153 处、2 裸色值；**Break 引了 kit 的 styles.css 却
0 处 token、76 个裸 hex 色值散在 1476 行 CSS 里**。中央厨房模式下，下游
不吃 token 就享受不到主题联动，这是治理缺口而非代码缺口。

**改法**：

1. kit 增加一个 dev-time bin（如 `swimmer-ui-check`，注册进 package.json
   `bin`，Node 脚本，不引入 runtime 依赖）：扫描指定 glob 的 CSS/TSX，
   报告裸 hex/rgb 色值（白名单机制，允许 `theme.css` 类文件）。本质是把
   kit 内部 `tokens.test.ts` 的"禁裸色"守卫做成可分发工具。
2. 在 Break 试点：把 76 个裸色值映射到语义 token（就近语义，不追求完美），
   接入上述检查到 Break 的 lint/CI。产出一份简短迁移笔记回填到
   `docs/reference/usage-and-upgrade-playbook.md`。
   （注意：Break 是另一个仓库，改动需在该仓库内提交；如果本次执行范围
   限定 SwimmerUIKit 仓库，则只交付工具 + 文档 + 给 Break 的迁移指引文件，
   把实际迁移留给 Break 侧任务。）

**验收**：`npx swimmer-ui-check "src/**/*.css"` 在 kit 演示目录可运行；
playbook 新增章节过 docs:check。

### 2.2 拆分 demo/preview CSS 与组件 CSS

**证据**：`dist/styles.css` 84KB（未压缩）里包含大量 demo 舞台专用规则：
`.game-ui-preview-*`、`.game-ui-stage-world`、场景 scenery 渐变、
`.game-ui-proof-frame`、first-session 的假摇杆/假世界背景、token 色卡等。
`GameUiPreview`（867 行）也从主入口导出（JS 可被 tree-shake，CSS 不能）。
所有消费项目都在为演示页样式买单。

**改法**（严格走"packaging-only、verified unused"先例）：

1. 先逐一 grep 7 个消费项目：`game-ui-preview|game-ui-stage-|game-ui-proof|
   GameUiPreview|GAME_UI_PREVIEW_MESSAGES|swimmer-first-session`。把结果记录
   在 PR 描述里。若有使用，方案改为"新增 `./preview.css` 并保持 styles.css
   现状，2.0 再拆"。
2. 若确认未使用：新建 `src/preview.css` 承接 demo-only 规则（同样
   `@layer swimmer-ui`）；`styles.css` 不再包含它们；新增 exports
   `"./preview.css"` 与 `"./preview"`（导出 `GameUiPreview` 等 demo 组件），
   主入口停止导出 GameUiPreview（或保留 re-export 一个大版本的过渡期，
   由你评估后在 PR 里说明取舍）。演示站与 Storybook 改引新入口。
   theme.css 里 `--game-ui-scenery-*`/`--game-ui-preview-*` token 挪进
   preview.css 的 `:root` 块（注意 tokens.test.ts 的清单要同步）。
3. `scripts/build-css.mjs` 增加对 preview.css 的构建；publint/attw 验证。

**验收**：`dist/styles.css` 体积显著下降（预计 -30% 上下）；7 个消费项目
`pnpm build` 不受影响（至少抽查 2 个：Anvil、TuringPact，本地 link 验证）；
CHANGELOG 记录。

### 2.3 主题完整性测试函数导出给下游

**证据**：`tokens.test.ts` 的 night 完整性清单是"一个主题该覆盖哪些变量"的
官方合同，但下游做自定义主题（如 abyss）时无法复用这个校验，只能肉眼对照。

**改法**：把"语义 token 完整清单"作为导出常量（如
`GAME_UI_THEME_CONTRACT: readonly string[]`）加入 `src/tokens.ts` 并从主入口
导出；kit 内部测试改为引用它；文档给出下游用法示例（下游在自己的测试里
解析自家主题 CSS 并断言全覆盖）。

**验收**：类型导出出现在 `dist/index.d.ts`；design-system-guide 主题化一节
补充示例；attw 通过。

### 2.4 版本对齐与升级 SOP 脚本化

**证据**：消费方版本混杂（Anvil/Break 1.0.1，其余 1.0.0）。

**改法**：本批发布后（预计 1.1.0），在 `usage-and-upgrade-playbook.md` 的
release SOP 里补一段"全生态对齐"清单（7 个项目的升级命令 + 验证命令），
可选做一个 `scripts/bump-consumers.mjs`（遍历同级目录改 package.json +
提示逐仓验证），不强求。

---

## 第 3 批（P1.5）：组件补强（先调研，后动手）

### 3.1 【先做】消费项目组件缺口调研（产出报告，不写代码）

**方法**：在 7 个消费项目 `src/` 里找重复自造的 UI 模式（搜索线索：
`dropdown|select|popover|toast|tooltip|stepper|skeleton|spinner|drawer|
joystick|pad`，以及各项目自有 CSS 里反复出现的控件类样式）。产出一份
`docs/plans/` 下的调研报告（走 doc-gov 模板）或 PR 描述内报告：每个候选
组件列出"哪些项目自造了、共性 API 是什么、建议 kit 化还是保持产品自有"。

**以下 3.2–3.5 的取舍以调研结论为准**；调研若显示无人需要，就砍掉。

### 3.2 GamePopover（通用锚定弹层）

现状只有 `GameLanguageMenu` 这个特化弹层。建议用**原生 Popover API**
（`popover` 属性 + anchor positioning 渐进增强）做一个通用
`GamePopover`，符合零依赖路线；LanguageMenu 内部改用它。

### 3.3 GameSelect（下拉选择）

游戏设置面板高频需求。方案：样式化原生 `<select>`（零依赖、移动端体验好）
为第一档；自绘 listbox 等到 Base UI 出口再说（current-work 已记录该出口）。

### 3.4 Toast 队列管理

`GameToast` 只是静态视觉。补一个无依赖的 `useGameToasts()` hook +
`<GameToastViewport>`（栈式渲染、自动消失、进出场动画复用现有 keyframes、
`role="status"/"alert"` 已有）。注意 SSR 安全与 reduced-motion。

### 3.5 GameNumberStepper（+/- 数字步进器）

游戏内买卖数量、音量等高频。组合现有 GameIconButton + GameInput 的视觉。

### 3.6 组件级 a11y 补强（无论调研结果都做）

- **GameTooltip**（`src/GameSurfaces.tsx:41-48`）：加 `useId` +
  `aria-describedby` 关联触发器与 tooltip；文档注明"触屏无 tooltip，重要
  信息不要只放 tooltip"（或触发器可聚焦时 focus 也能出现——现有
  `:focus-within` 已覆盖，但触发器常是非聚焦元素，story 里补正确用法示例）。
- **GameTabs**（`GameSurfaces.tsx:61-108`）：props 增加可选 `getPanelId`
  或约定 `panelIdPrefix`，渲染 `aria-controls`；文档示例补 `role="tabpanel"`
  + `aria-labelledby` 的消费方写法。
- **forced-colors 支持**：`styles.css` 增加一小段
  `@media (forced-colors: active)`——按钮/输入框保留边框、focus 环用
  `Highlight`、选中态用 `SelectedItem`。规模控制在一屏内，覆盖交互控件即可。
- **GameSlider 视觉**：现在只有 `accent-color`，与黏土风格脱节。用
  `::-webkit-slider-thumb`/`::-moz-range-thumb` 标准写法做 token 化的
  拇指+轨道（注意 lightningcss 下必须零 warning）。

---

## 第 4 批（P2）：演示站与 Storybook 打磨

### 4.1 演示站 token 总账可读性（bug 级观感问题）

**证据**（视觉核查发现）：

- token 值全部截断显示为 `var(--…`（`.game-ui-token-row code` 是
  ellipsis + nowrap，列宽 0.42/0.58 分配太挤）。看不到值的 token 表没有
  查阅价值。
- token 名 uppercase + `overflow-wrap: anywhere` 导致
  "TOUCHMINIM UMPX"、"ADJACENTSPAC INGPX" 这种词中断行。
- "motion"/"layers" 等卡片在 auto-fit 网格里被同行最高卡片拉伸，内容
  贴底、上方大片空白（`align-items` 未设 start，且卡片内容 `display:grid`
  默认拉伸分配）。

**改法**：改 `GameUiPreview.tsx`/相关 CSS——值列允许换行（`overflow-wrap:
anywhere` 移到值列、去 nowrap），或 hover/点击展开完整值；名列改
`overflow-wrap: normal` + `hyphens: none`，宁可换行在词边界；网格
`align-items: start` 或卡片 `align-content: start`。

### 4.2 演示站加主题切换

**证据**：演示站没有 night 切换（评估时只能用 JS 手动设
`data-game-ui-theme`）；night 覆盖是 kit 的核心卖点却无法演示。

**改法**：导航栏加一个 GameToggle/GameSegmentedControl 切 light/night
（就用 kit 自己的组件，dogfooding），持久化到 localStorage 可选。
Storybook 加一个全局 toolbar 切换（`preview.tsx` globalTypes +
decorator 设 `data-game-ui-theme`），让每个 story 都能一键看夜间效果，
替代现在零散的单个 night story。

### 4.3 Storybook 自动化 a11y

**证据**：`@storybook/addon-a11y` 已装（`.storybook/main.ts:6`），
`@storybook/addon-vitest` 在 devDeps 里，但需确认 story 级 a11y 断言是否
真的在 `pnpm test` 里跑。

**改法**：确认/接通 addon-vitest 的 story 测试（Vitest browser mode +
playwright 已在依赖里）；开启 a11y addon 的 `test.todo→error` 模式，让
axe 违规在 CI 失败。修掉暴露出的存量违规（预计以对比度为主，第 1.2 条
修完会消掉大半）。`@chromatic-com/storybook` 已装：若用户无 Chromatic
账号意愿，不要强推视觉回归，跳过即可。

### 4.4 交互音效 review（可选，低优先）

`src/interactionSound.ts`（133 行，Web Audio 合成音）本次未深审。顺手项：
确认懒创建 AudioContext（iOS 需用户手势后 resume）、音量是否走某个 token/
参数、demo 站是否演示了它。有问题记 issue，不强改。

---

## 交付与发布

1. 每批一个 PR，PR 描述里附验证输出（测试数、build 无 warning、publint/attw
   结果、涉及消费方验证的 grep 记录）。
2. 全部四批合并后发 **1.1.0**（有 token 值变化 + 新增导出，无消费方代码
   改动），CHANGELOG 按现有格式写迁移说明（重点：视觉对比度变化、字体
   加载建议、preview 拆分说明）。
3. 发布走现有 `npm-publish.yml` Trusted Publishing 手动流程（不要自己
   找 token）。
4. 发布后按 2.4 对齐 7 个消费项目版本。
5. 若过程中沉淀出非显然的可复用经验（如 lightningcss 对 range 伪元素的
   兼容性坑），用 `capture-learning` 记录。

## 明确不做（本轮范围外）

- 不引入任何 runtime 依赖（含 Base UI —— 等复杂 headless 需求真出现，
  见 current-work 的"未来出口"）。
- 不做 DTCG/Style Dictionary token 管线（等 Figma/多工具协作需求出现）。
- 不做 RTL（游戏 UI 无此需求信号）。
- 不重做视觉语言——黏土风格是品牌资产，本计划只修对比度、补缺口、
  提治理，不动设计方向。
