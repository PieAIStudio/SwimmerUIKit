---
id: PLAN-UIKIT-4-ALPHA
title: SwimmerUIKit 4.0 alpha plan
type: plan
status: active
canonical: true
owner: project
created: 2026-10-24
last_reviewed: 2026-10-24
domain: ui-components
tags:
  - uikit-4
  - alpha
  - baseline
  - matrixapps
pinned: false
related:
  - REF-CURRENT-WORK
  - REF-COMPONENT-SELECTION-GUIDE
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-DESIGN-TOKENS
supersedes: []
superseded_by: null
---

# SwimmerUIKit 4.0 alpha

给执行者读。A 段只做盘点、基线、名字表和切片计划；不改产品源码、不改消费者、不改名、不发版。4.0 预览按 `FLOW.md` 只走 npm `next`，`latest` 保持 3.2.5；每个 B 段独立提交、独立推送，先由 Codex 只读复查「是不是做复杂了」，再开下一段。

## 2026-10-30 Colour Worlds supersession

Owner 的 Colour Worlds contract supersedes the earlier quiet/aura B3 tool-shell surface. UIKit 4.0 now owns `ToolWindow`, `ToolSidebar`, `ToolLanding`, `Gem`, `RoundAction`, `GlassCard`, `ManagerSheet`, `BentoProgress`, `ActionPill`, `Switch` and the tool icon additions. The old tool-only `PageSurface` and Shell tool mode are removed without aliases; the game `Shell` contract and liquid implementation remain. Consumer apps are still out of scope and must opt into `swimmer-ui-check --rules=tool` during their own migration.

The B3 section below remains the historical record of the superseded implementation, not a current API instruction. Current facts and evidence live in `docs/reference/execution/current-work.md` and `.reports/2026-10-30-colour-worlds/RESULT.md`.

## A 段结论（2026-10-24，3.2.5）

- 入口基线：根入口 **37,460 / gzip 10,809 bytes**；所有 11 个公开入口合计 **485,481 / gzip 84,348 bytes**。单按钮消费者 Vite 构建是 **JS 256,594 / gzip 80,052**，CSS 666,402 / gzip 378,626；总计 **922,996 / gzip 458,678 bytes**。这是包含 React 宿主运行时和 styles.css 的消费者总量，不把它冒称成 Kit 自身增量。
- 速度基线：`pnpm build` 三次 **5.709–6.230s，median 5.788s**；`pnpm test` 三次 **114.431–128.256s，median 121.226s**。每次是 **105 files / 711 tests** 全过；日志里的既有 token guard、插件计时和 act 相关提示保留，不声称零警告。
- 没人用的入口：`./liquid-effects`、`./preview`、`./icon-paths` 的 JS 入口在 12 个只读消费者中均为零；`./preview.css` 仍被 TuringPact 使用，`./fonts.css` 仍被 SwimmerParty 使用，不能连 CSS 一起删。
- 没人用的公开运行时值共 **58 个**：根入口 5 个、`./liquid-effects` 2 个、`./preview` 3 个、`./icon-paths` 48 个；完整逐名收据在 `.reports/2026-10-24-uikit4-plan/baseline.json`。类型只读使用另有 80 个零使用名，不把类型零使用误报成运行时代码。
- 当前 main 实测是 **43 个 Game* 运行时公开零件、403 个 CSS 定义变量**，不是讨论稿里的 62 / 393；A 段按仓库实际生成表走，不沿用未核实数字。完整旧名→新名表在 `.reports/2026-10-24-uikit4-plan/names.md`。
- 最大风险是一次把「工具壳」做成第二套应用框架：B3 只提供壳、槽位、六页骨架和少数静态零件；ClaudeSync 的数据、文件、账号、云端、备份、文案、插画和 64 项能力仍归产品。

## 1. 基线收据与边界

脚本：[scripts/measure-uikit4-baseline.mjs](../../../scripts/measure-uikit4-baseline.mjs)。它在提交 `ee1b62d4d183a97c2c50353261840a182a01ee90` 上：

1. 以 `run-locked.py` 排队，完成 A 段的 `pnpm build`、`pnpm test` 基线与日志；
2. 对 `package.json.exports` 的 11 个运行时/CSS/JSON 入口算原始和 gzip；
3. 用一个只导入 `GameButton` + `styles.css` 的临时 Vite 消费者算 JS、CSS 和总量；
4. 只读扫描 12 个消费者的导入、包版本、公开值/类型和相对模块边；
5. 将日志和 tarball 放在 `.reports/2026-10-24-uikit4-plan/`，不写消费者。A 段已有的多次测量只作历史收据；B1–B4 不为体积或时间重复跑三次，也不把它们设为阻断门禁。

公开入口明细：

| 入口 | 原始 bytes | gzip bytes |
| --- | ---: | ---: |
| `.` | 37,460 | 10,809 |
| `./liquid-presence` | 47,145 | 14,087 |
| `./liquid-presence.css` | 4,136 | 1,164 |
| `./liquid-effects` | 41,915 | 11,435 |
| `./preview` | 63,357 | 18,566 |
| `./styles.css` | 179,361 | 18,230 |
| `./preview.css` | 22,497 | 4,260 |
| `./fonts.css` | 81,446 | 2,965 |
| `./tailwind.css` | 1,636 | 626 |
| `./package.json` | 5,258 | 1,618 |
| `./icon-paths` | 1,270 | 588 |

包候选只作基线证据：23,978,084 bytes，SHA-256 `38cdb42142fccd7d762cc83fecb89b6323ab79f9153714abf8c53270a13ce382`。A 段没有发布它。

## 2. 12 个消费者只读盘点

扫描对象是当前 checkout 的代码、测试和 package manifest；忽略 `node_modules`、构建产物、`.scratch`、`.reports`、`.devspace-*`、worktree 和临时目录。没有修改任何消费者。

| 消费者 | 当前锁定版本 | 备注 |
| --- | --- | --- |
| University | 3.2.1 | `apps/university/package.json` |
| ClaudeSync | 3.2.1 | MatrixAPPs app |
| OnePlace | 3.2.1 | MatrixAPPs app |
| SwimmerParty-Website | 3.2.1 | 另引 `fonts.css`、`liquid-presence.css` |
| OwnMySpace | 3.2.3 | 只读主仓库源码 |
| AccountCenter | 3.2.2 | `SwimmerBackend/apps/account-center` |
| Directing | 3.2.5 | 账号菜单在 presence 入口 |
| SwimInAI-Website | 3.1.0 | 账号菜单在 presence 入口 |
| YaZu | 3.0.0 | 账号控件使用精确版本 |
| TuringPact | 2.7.2 | 仍使用 `preview.css` |
| Break | 2.1.0 | HQ 清单里的 2.x 消费者 |
| HQ-board | 2.1.0 | HQ `packages/hq` |

入口使用结论：根入口和 `styles.css` 仍是 12 个消费者都能找到；`liquid-presence` 有 University、SwimmerParty、Directing、SwimInAI、YaZu；`liquid-presence.css` 有前四个；`fonts.css` 只有 SwimmerParty；`preview.css` 只有 TuringPact；`package.json` 只有 HQ-board 的读取；`liquid-effects`、`preview`、`icon-paths` 三个 JS 入口没有实际导入。

运行时零使用值：

- 根入口：`GAME_UI_THEME_CONTRACT`、`setLiquidGooeyBudget`、`GAME_ICON_NAMES`、`GAME_UI_STYLES`、`GAME_UI_DEFAULT_STYLE`。
- `./liquid-effects`：`LiquidEffectsGroup`、`LiquidEffectsItem`。
- `./preview`：`GameUiPreview`、`LiquidPreview`、`GAME_UI_PREVIEW_MESSAGES`。
- `./icon-paths`：48 个 `*_ICON` 具名路径，完整名单和每个建议名见 `.reports/2026-10-24-uikit4-plan/names.md`。

「没有导入」不等于「可以马上删」：`GameLanguageMenu`、`GameSplash` 等根值有消费者导入；入口与值盘点必须以当前版本和路径为准。4.0 B1 才按这份收据决定移除，A 段不动。

## 3. Game* 命名硬切

当前 43 个运行时值逐项映射如下；类型名（`Props`、`Variant`、`Item`、`Name` 等）按同一规则去掉开头 `Game`，不另设兼容词表。当前扫描没有发现新运行时名与公开非 Game 名冲突。

| 旧名 | 建议新名 |
| --- | --- |
| `GameButton` | `Button` |
| `GameCheckbox` | `Checkbox` |
| `GameField` | `Field` |
| `GameIconButton` | `IconButton` |
| `GameInput` | `Input` |
| `GameLanguageMenu` | `LanguageMenu` |
| `GameListRow` | `ListRow` |
| `GameOtpInput` | `OtpInput` |
| `GameSegmentedControl` | `SegmentedControl` |
| `GameSelect` | `Select` |
| `GameSlider` | `Slider` |
| `GameTabs` | `Tabs` |
| `GameTextArea` | `TextArea` |
| `GameToggle` | `Toggle` |
| `GameBadge` | `Badge` |
| `GameCallout` | `Callout` |
| `GameEmptyState` | `EmptyState` |
| `GameHelpTip` | `HelpTip` |
| `GameHelpCard` | `HelpCard` |
| `GameLoadingState` | `LoadingState` |
| `GameProgress` | `Progress` |
| `GamePrompt` | `Prompt` |
| `GameToast` | `Toast` |
| `GameTooltip` | `Tooltip` |
| `GameCollapsiblePanel` | `CollapsiblePanel` |
| `GameDialog` | `Dialog` |
| `GameHistoryPanel` | `HistoryPanel` |
| `GameHudActions` | `HudActions` |
| `GameModal` | `Modal` |
| `GamePanel` | `Panel` |
| `GameShell` | `Shell` |
| `GameAvatar` | `Avatar` |
| `GameCollectibleCard` | `CollectibleCard` |
| `GameCollectibleCardSlot` | `CollectibleCardSlot` |
| `GameFactList` | `FactList` |
| `GameMovementPad` | `MovementPad` |
| `GameRadialMenu` | `RadialMenu` |
| `GameSplash` | `Splash` |
| `GameStageTile` | `StageTile` |
| `GameMaterialSwatches` | `MaterialSwatches` |
| `GameIcon` | `Icon` |
| `GameAccountMenu` | `AccountMenu` |
| `GameUiPreview` | `UiPreview` |

变量建议是 `--game-ui-X → --swimmer-X`。当前定义 403 个，和 v2.7 已存在的 `--swimmer-*` 语义有 26 个候选冲突：`accent`、`accent-ink`、`bg`、`cta-from`、`cta-text`、`cta-to`、`danger`、`font-body`、`font-display`、`motion-fast`、`radius-control`、`radius-panel`、`shadow-raised`、`space-2`、`space-4`、`space-6`、`space-8`、`space-10`、`space-12`、`space-16`、`success`、`surface`、`surface-raised`、`text`、`text-muted`、`warning`。完整 403 行表（含建议新名和冲突列）是 `.reports/2026-10-24-uikit4-plan/names.md`；B2 不能机械替换后覆盖 v2.7 token，需在冲突处先定归属。

## 4. 图标库比较

| 库 | 2026-10-24 registry metadata | 按需引入 | 与 v2.7 四组图标的关系 |
| --- | --- | --- | --- |
| Lucide / `lucide-react` 1.61.0 | ISC；Feather 派生形状另有 MIT 条款 | named import 和 `dist/csr/*` wildcard；可 tree-shake | 语义最容易对应：carry≈双向箭头、older≈history、attention≈triangle-alert、aligned≈check；不能像素匹配 v2.6 的四张立体 PNG |
| Tabler / `@tabler/icons-react` 3.49.0 | MIT | named icon component / per-icon package surface；可 tree-shake | 语义可对应，线条更偏几何/实心，仍不能替代四张 PNG |
| Phosphor / `@phosphor-icons/react` 2.1.10 | MIT | per-icon CSR surface，并可选 weight；可 tree-shake | 语义覆盖强，但 weight 轴会把工具壳的单一线性语言做重 |

推荐沿用已经审核、内嵌的 Lucide path data：仓库 `scripts/game-icons-source.json` 固定 Lucide 1.51.0 archive hash，`NOTICE` 已保留 ISC/Feather MIT；不新增运行时图标依赖。v2.7 的四组 PNG 是 ClaudeSync 的状态插画/材质，不进入 Kit 的通用线性图标契约；B3 只提供语义线性图标，ClaudeSync 自己决定是否保留四张状态图。

## 5. ClaudeSync v2.7 拆成 Kit 清单

v2.7 的 `Specification.md`、`Tokens.md`、`prototype-src/*` 和 12 张 1440×1000 浅/深截图已读。页面视觉是定稿，不再另做一套设计。

| v2.7 能力 | 3.2.5 现状 | 4.0 处理 | ClaudeSync 自己保留 |
| --- | --- | --- | --- |
| Mac 半透明侧栏、Windows 普通侧栏、手机单列 | `GameShell`/`GameHudActions` 是游戏槽位，不是工具窗口壳 | 新增工具 `Shell`、`Sidebar`、`WindowBar`、mobile nav；接受 platform/compact/reduced-motion 属性，不自动猜宿主 OS | 窗口尺寸、Electron/宿主菜单、导航路由 |
| 六页骨架：home / progress / results / review / complete / settings | 没有工具页骨架 | 新增六个可组合 page slots 或一个明确的 page-surface API；提供布局、标题区、主动作槽、内容槽、底部动作槽 | 页面文案、数据、路由、加载和业务状态 |
| 四组结果卡、审阅左右栏、固定选择底栏 | `Panel`、`ListRow`、`Badge` 等零件可复用；没有组合布局 | B3 不新增结果组合件；用一个通用 page surface/slots 和已有零件组合，卡片/list 保持静止平面 | 4+2+2+3 计数、分组规则、聊天详情、账号范围 |
| 主动作 | `GameButton variant="primary"` 已有潮汐液体 | B2 改名为 `Button`，保留一屏一个 CTA；不把普通按钮变液体 | “检查聊天/全部同步”等动作语义 |
| 扫描/同步进度 | `GameProgress` 已有 600ms 变化后休眠的规则 | B2 改名为 `Progress`；B3 只接工具骨架，验证无待机动画和 reduced-motion | 真实进度、停止边界、写入结果 |
| 完成瞬间 | 没有通用 completion feedback；已有 `LiquidSurface` 只是一体装饰 | 先用现有 CTA/progress/静止图形验证；只有确有第二个工具需求才新增最小 `CompletionFeedback`，不把 `liquid-effects` 硬塞进完成页 | relay PNG、六项完成清单、产品成就文案 |
| 设置、表单、筛选、对话 | `Field`、`Input`、`Select`、`Toggle`、`Modal`、`Dialog` 已有 | B2 重命名后作为工具表单底座；不新造表单状态机 | 路径选择、语言包、持久化、文件权限 |
| 线性图标 | `GameIcon` + `icon-paths` 已有，路径来源已审核 | B1 移除公开 `icon-paths` 入口但保留内部按需数据；B2 改名 `Icon`，B3 补工具壳所需缺口 | v2.7 四张状态 PNG和首页大插画 |
| `--swimmer-*` 视觉变量 | 3.2.5 唯一来源是 `--game-ui-*`；v2.7 原型已有独立的约 96 个工具 token | B2 做硬改名，B3 收敛 token 层：窗口/侧栏/表面/CTA/状态/间距/圆角/字级/动效；冲突 26 个先合并再落地 | ClaudeSync sky 强调色、产品专属模块渐变和文案 |
| 深浅、Mac/Windows、mobile、reduced motion | 主题和 reduced-motion 有现成规则 | B3 用真实浏览器覆盖 2 主题 × 2 平台语气 × 桌面/手机 × reduced motion | Electron 实机行为和宿主窗口 API |
| 64 项能力 | 原型数据和状态在 ClaudeSync，不在 Kit | Kit 只承载可插槽布局和可访问骨架 | CS-001–CS-052、N-01–N-12 的数据/安全/业务/文案全部归 ClaudeSync |

## 6. B1–B4 切片计划

每片的行数是源码、测试、故事、入口和必要文档的**预计改动行数**，不含 `dist` 和生成的包；先做最小实现，超过预计的两倍先回到切片，不用堆防御。

### B1：清理与边界（`4.0.0-alpha.1`）

**改什么**

- 以本 A 段收据为准删掉零使用 `./liquid-effects`、`./preview`、`./icon-paths` 的公开包入口；`preview.css` 因 TuringPact 仍用，暂留，但 preview JS 不再随包可达。保留仓库内部预览、图标路径数据和特效源码供本仓库故事/测试使用，不把它们继续声明成已发布 JS leaves。
- 按基础 / 工具 / 游戏 / 液体收紧公开入口与入口依赖图；根入口只保留基础/普通控件，`liquid-presence` 按需保留。先不改 Game 名，避免把拓扑和改名混成一次不可诊断的提交。
- 删除入口后同步既有契约，不新增发布系统或第二套检查：`.github/workflows/npm-publish.yml` 的 attw `--entrypoints`、`scripts/verify-packed-candidate.mjs` 的 runtime/export/type fixture、`tests/publicApi.test.ts`、`tests/type-contracts/optional-entries.tsx`，以及 `scripts/check-warnings-survive-build.mjs` 的构建入口/警告清单；同时收敛仍宣称这些 leaves 可安装的现行文档。
- 检查液体外圈的稳定种子：几何使用调用方稳定身份或明确固定 seed，不依赖 React `useId` 的分配顺序；没有身份时保持可读静态结果。复查所有动态分支的 `prefers-reduced-motion` / explicit reduced-motion，静态展示不加环境时钟。

**不改什么**

- 不改消费者、ClaudeSync、University 或任何产品截图；不做名字硬切，不改 `latest`。
- 不重写液体引擎、不做第二套 theme engine、不把预览页搬成产品组件；`liquid-effects` 不为完成瞬间强行复活，Git 历史保留源码。

**怎么验证**

- 相关 API、类型、入口边界、警告构建和 packed fixture 检查通过；候选包的 export map、实际 `dist/bin` 文件集合、ESM 类型消费和最小消费检查与新公开入口一致。
- 受影响的固定浏览器 smoke set 是 `DropletSurface.browser.test.tsx`、`GameButton/contour-identity.browser.test.tsx` 和 `GameProgress.browser.test.tsx`；按 changed-path 选择时记录选择依据与盲点（不覆盖外部消费者）。视觉/交互结果必须看实际 Chromium，测试不替代浏览器证据。
- 入口体积、构建时间和测试时间只在本片收据中与 A 段作一次对照，不作阻断门禁，不为此重复三次。

**预计改动**：约 **120–260 行**；最大风险是入口边界移动时把共享 chunk 重复打进仍保留的入口。

### B2：硬改名（`4.0.0-alpha.2`）

**改什么**

- 将 43 个 Game* 运行时值和所有公开 Game* 类型按 A 段表硬改；`--game-ui-*` 按完整变量表迁移到 `--swimmer-*`，26 个 v2.7 冲突逐项定唯一归属。
- 删除旧名运行时出口和 CSS 别名；不保留 `GameButton`、`--game-ui-*` 的兼容分支。
- 在 Kit 包外提供旧名→新名对照和自动替换工具，工具只帮迁移、不能被 package `files` 带进运行时；更新生成的 API inventory 和迁移说明。

**不改什么**

- 不替消费者自动改代码、不在 Kit 里放兼容 alias、不借迁移脚本偷偷保留旧入口。
- 不同时做工具视觉设计；B2 只处理命名、公开成员和 token 归属。

**怎么验证**

- API inventory、类型消费、`rg` 旧名检查和迁移工具的正/负 fixture；旧名只能出现在迁移材料/历史证据，不能出现在运行时出口。API inventory 与迁移说明只运行现有 `pnpm api:inventory` 生成，不另写手工表。
- 相关浏览器 smoke set 由变更路径映射到现有控件/主题用例，记录选择依据和外部产品未覆盖的盲点；入口体积只作为一次收据指标，不作门禁、不重复三次。

**预计改动**：约 **2,000–4,000 行**（含调用点、测试和生成表）；最大风险是同名 token 的语义被机械替换，导致工具和游戏主题互相覆盖。

### B3：工具外壳和六页骨架（`4.0.0-alpha.3`）

**改什么**

- 只新增/改造一个 `Shell` API 和一个通用 page surface/slots；B2 的 `GameShell → Shell` 是同一个公开 API 的改名/收窄，工具壳不另造第二套 `Shell`。六页只用 `Shell`、通用页面槽位和已有 `Panel` / `ListRow` / `Badge` 等零件组合。
- 不在 alpha 加入 `SummaryCard`、`ReviewLayout`、`CategoryNav`、`SelectionFooter`、`ResultList` 五个结果组合件及其专属故事/测试；产品用 children/slots 注入数据和文案。
- 用已审核的 Lucide-derived 内嵌路径做统一线性图标；只把液体放在主按钮、进行中和完成一次反馈，静态卡片、列表、普通按钮不动不晃。
- 将 v2.7 的窗口/侧栏语气、浅深 token、字号/间距/圆角/动效和手机单列规则收为 `--swimmer-*`；工具壳不拥有 ClaudeSync 的 sky 业务数据。

**不改什么**

- 不把 v2.7 的 relay/group PNG、大插画、Claude 文案、聊天数据、账号/云端/备份逻辑放进 Kit。
- 不做通用路由、持久化、Electron IPC、业务错误恢复，也不为第二个产品提前造状态管理框架。

**怎么验证**

- 实际浏览器只做三个代表性 smoke：桌面浅色、桌面深色、窄屏 reduced-motion；六页用一张骨架故事/图逐页确认层级、唯一主按钮、静止卡片、窄屏不横溢和键盘焦点，不做 6 页 × 2 主题 × 2 平台 × 桌面/手机 × reduced-motion 的全交叉矩阵。
- 相关单元/浏览器/a11y/contrast 检查按维护的 source→browser mapping 或固定 smoke set 选择；收据写明覆盖与盲点，外部产品和 Electron 实机不在 Kit alpha 验收内。
- 入口与最小按钮消费者的体积/时间只作一次收据指标，不作阻断门禁、不重复三次。视觉验收单独留截图，不以 Storybook 绿灯冒充。

**预计改动**：约 **700–1,300 行**；最大风险是把 ClaudeSync 业务状态塞进 Kit，或为追截图重新引入无限待机动画。

### B4：检查工具（`4.0.0-alpha.4`）

**改什么**

- `swimmer-ui-check` 支持多个目录输入和可选规则组（tokens、old names、contrast 等）；一次报告每个目录的归属。保留旧写法负例，不复制 `api:check` 的 exports 审计。
- 用仓库内最小的两个 fixture 覆盖多目录/单目录和规则选择；不把 University 的行数或真实消费者接入作为 Kit 目标。

**不改什么**

- 不把检查器变成 formatter、迁移器、包配置选择器或运行时兼容层；不新增 warning/blocking 双语义体系或重复实现 exports 规则；不新增 CI 服务，不默认跑全仓库全套。
- 现有 `pnpm check:styles` 的默认单目录输入和退出行为保持不变。

**怎么验证**

- 多目录、单目录兼容、规则选择、缺目录和旧名负例；确认默认 `check:styles` 行为未变。
- 只跑脚本相关 lint/unit/fixture，不做 University 或真实消费者 smoke；在收据中记录 fixture 覆盖与外部消费者盲点。

**预计改动**：约 **120–260 行**；最大风险是可选规则默认值改变现有消费方的失败语义。

## 7. 每片通用发布验收清单

每个 B 片都必须独立完成这一组短清单；它是执行步骤，不新增门禁。B1 删除公开 JS leaves 时，先同步既有 workflow/packed/API/type 契约，再按本清单发布。

1. **版本号**：只改到该片批准的 `4.0.0-alpha.*`，确认预发布版本会选择 `next`。
2. **相关检查**：按完整 outgoing diff 的路径与依赖选择格式、lint、类型、单元/浏览器、API、构建、packed/文档等相关检查；浏览器使用维护的 source→browser mapping 或固定 smoke set，并在收据写覆盖盲点。体积和时间只记录一次，不作阻断，不跑三次。
3. **可信发布**：干净提交推到 `main` 后，只运行 `gh workflow run npm-publish.yml`；禁止本机 `npm publish`，不为发布绿灯降低断言或使用 `--no-verify`。
4. **npm `next` 回读**：独立读取精确版本、`dist.integrity` 和 dist-tags，确认 `next` 指向该 alpha 版本。
5. **`latest` 守护**：确认 `latest` 仍为 **3.2.5**；失败保留首红和原始日志，不重复发布。

API inventory 与迁移文档只通过已有 `pnpm api:inventory` 生成来源维护，不另写手工事实表；发布收据记录计划变化、相关检查/选择依据、workflow run 号、npm 回读和提交号。

## 8. 「别做大」

本计划明确不做：

- 不重新设计 v2.7，不把 Owner 已定的窗口、侧栏、唯一主动作和六页秩序再讨论一轮。
- 不把 ClaudeSync、OnePlace 或 HQ 看板的路由、数据、文件、账号、备份、IPC、翻译、插画和业务安全收进 Kit。
- 不新建 GameKit，不保留 3.x 兼容别名，不让 2.x 产品被动升级，不碰消费者仓库。
- 不为证明“液体特色”而把融化/弯折放进静态卡片；没有真实第二落点就移出 4.0 包，不新造一套特效引擎。
- 不在普通 push 前跑全仓库 full suite、全浏览器套件、整套 timing suite 或付费云验收；只跑 changed-path 相关检查。正式 E 版才按授权跑 release full suite。
- 不把 A 段的基线脚本变成新的长期门禁；包体、构建/测试时间只作为每片收据指标，不设置“不得劣于”阻断条件，也不重复三次。

## 9. A 段交付与下一步

- 计划：本文件。
- 基线/完整名字表/消费者只读扫描：`.reports/2026-10-24-uikit4-plan/RESULT.md`、`baseline.json`、`names.md`。
- 必要脚本：`scripts/measure-uikit4-baseline.mjs`。
- 本段提交只包含本计划和测量脚本；`.reports/` 按项目 Document Convergence 规则忽略，不强行入 Git。A 段不发布，下一步等待审阅和总指挥定稿后才开 B1。
