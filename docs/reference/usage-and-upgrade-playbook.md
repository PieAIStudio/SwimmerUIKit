---
id: REF-USAGE-AND-UPGRADE-PLAYBOOK
title: Usage and Upgrade Playbook
type: reference
status: active
canonical: true
owner: h
created: 2026-07-03
last_reviewed: 2026-09-11
domain: product
tags:
  - usage
  - upgrade
  - consumers
pinned: true
related:
  - REF-DESIGN-SYSTEM-GUIDE
  - SPEC-0001
  - SPEC-0002
---

# REF-USAGE-AND-UPGRADE-PLAYBOOK: Usage and Upgrade Playbook

## Purpose

给消费项目（University 及其他产品）的
接入、定制、升级手册，以及本仓自己的发版清单。

## 中央厨房模型

SwimmerUIKit 的运转模式（创始人定义，本文固化）：

```text
产品项目用 kit → 缺什么 → 回 kit 仓补 → 发新版 → 产品钉版升级 → 本地只留 token 覆写
```

初学者比喻：kit 是中央厨房，产品店面只做"加辣/换糖"（token 覆写），
不自己开灶（复制组件源码）。店面发现缺一道菜，报给中央厨房上新，
所有店面下次进货都有。

## 消费方接入（三步）

1. 从 npmjs 安装并钉精确版本：
   `"@pieai/swimmer-ui-kit": "2.5.0"`（不用 `^`，升级必须是
   显式动作 + 本仓库回归验证）。包是 **ESM-only**、**零运行时依赖**，
   peer 只有 react/react-dom ≥19——不需要 Tailwind、不需要任何 CSS
   处理器，也不需要 scope-specific `.npmrc` 或 package-read token。
2. 入口处引一次样式：`import '@pieai/swimmer-ui-kit/styles.css'`。
   （可选：Tailwind v4 宿主想让 `bg-primary` 等映射到 kit token，再加
   `import '@pieai/swimmer-ui-kit/tailwind.css'`；非 Tailwind
   项目**不要**引它。）
3. 按需 import 组件。本地定制只写 token 覆写（见 design-system-guide），
   **禁止**把 kit 的 `.game-ui-*` 基础规则复制回产品仓。

## 消费方升级 SOP

1. 读 kit 的 CHANGELOG/commit 记录，确认这次升级动了什么。
2. 升级版本号 → `pnpm install`。
3. 跑产品自己的门：typecheck、unit、build、E2E/截图回归。
4. 视觉变化逐屏走查（kit 升级可能让"以前赢在权重"的本地覆写行为变化，
   0.9.0 起 kit 在 `@layer swimmer-ui` 内，未分层的产品 CSS 一定赢）。
5. 有问题不要在产品仓打补丁盖住 kit，回 kit 仓修，再发补丁版。

## 2.4.0 → 2.5.0：University 的可执行升级边界

**兼容升级**：272 个根入口名字、包子路径、默认 DOM、主题 token、液体引擎与
十二形态均保留。唯一新增运行时选项是 `GameButton.fullWidth?: boolean`。
没有新增 `cta` 形态，也没有要求消费者改 import。旧调用继续可用。

本轮只读核实 University 的 `packages/ui`、`packages/world`、`apps/university`
均钉 `2.4.0`，**没有在 University 修改、安装或运行迁移**。以下由消费方 AI 执行，
不要把本仓的绿色测试当作产品回归证明。

```bash
# 在 University 根目录；先保存自己所属的进行中工作，不覆盖别的 agent 改动。
pnpm --filter ./packages/ui add --save-exact @pieai/swimmer-ui-kit@2.5.0
pnpm --filter ./packages/world add --save-exact @pieai/swimmer-ui-kit@2.5.0
pnpm --filter ./apps/university add --save-exact @pieai/swimmer-ui-kit@2.5.0
pnpm install --frozen-lockfile
pnpm verify
```

检查三个 `package.json` 和 lockfile，而不是只更新 UI 包。常规产品入口继续只引
`styles.css`；渲染 `GameUiPreview` 仍需 `preview.css`。字体与素材接入保持不变。

### 先升级包，再另一个提交迁移自建 CTA

`packages/ui/src/cta/LiquidCtaButton.tsx` 的共享按钮表面可以交回 kit：

```tsx
<GameButton variant="primary" surface="liquid" fullWidth onClick={onStart}>
  开始学习
</GameButton>
```

旧 `width="full"` 映射为 `fullWidth`，`width="auto"` 映射为省略它。
`type`、`disabled`、`aria-*`、`name`、`value`、本地化 children 仍走真实按钮。
`className` 仍落在真实按钮；`wrapperClassName` 不是 kit 新增属性，产品要保留
自己的布局 wrapper，不能不看调用点就删掉。

**有 `destination` 的调用不能只替换成上面的裸按钮。**
`LiquidCtaTransition.tsx` 的目标注册、pending/active/settling、超时、取消、
跨屏衔接由产品拥有，保留原文件和测试。可以在原适配层内换掉视觉组合：

```tsx
// 此回调属于 University 的适配层，不是新增 kit API。
// 保留现有“先捕获源矩形，再调用导航”的次序，避免路由卸载后找不到源。
onClick={(event) => {
  if (destination && !event.defaultPrevented) {
    beginLiquidCtaTransition(event.currentTarget, destination);
  }
  onClick?.(event);
}}
```

该 API 接受 HTMLElement，真实按钮可以作源；但旧源是外层 wrapper，消费方必须
对照两者矩形和过渡截图。布局 wrapper 有额外 padding/offset 时，仍保留原 ref。
这不是“823 行过渡已被 kit 吸收”的承诺。

**有意的视觉迁移**：旧自建 CTA 的统一 `scale=0.95` / `bouncy` 将变成 kit 已有的
`press` 非均匀压扁 / `wobbly` 回弹，投影与轮廓也取 kit 形态。这是消费方选择
迁移时才发生的观感变化；2.5.0 没有重调 2.4.0 的物理。旧 `static`、自建
LiquidGroup、视觉 pressed state、`.liquid-cta__surface` 和针对 button 的
透明底/阴影覆写应逐项检查后移除，避免双层表面或未分层 CSS 把 kit 覆盖掉。
产品自己的排版、目的地、业务状态不是需要删除的重复实现。

### 消费方验收与回滚

先跑原 CTA 与 transition tests，再走产品全门。按实际调用清单检查开始/继续、
课程入口、空状态、表单 submit、禁用、Enter/Space、pointer cancel、快速重复点击、
长中文、375px 窄屏、day/night、reduced-motion；导航还要检查目标缺失/延迟挂载、
同屏/跨屏、取消和卸载。观察焦点、点击矩形、文字清晰度和动画最终停稳。
本轮只读 JSX 查询在该快照得到 17 个生产 `<LiquidCtaButton` 标签；这不是对用户
历史“19 处”数字的覆盖，也不是完整运行时调用次数。迁移前重新枚举，不用旧数字验收。

回滚按钮迁移：revert 消费方的独立 CTA 提交，恢复旧适配层/CSS；需要回滚依赖时，
同时恢复三个包的 `2.4.0` 与对应 lockfile 并重跑产品门。不撤销或覆盖其他 AI 的工作。
本包已发布版本不可覆写；kit 的后续修复用新补丁版本。

## 检查消费方是否真的在吃 token（`swimmer-ui-check`）

kit 内部靠 `src/tokens.test.ts` 强制"裸颜色只能住在 theme.css"；消费方
没有等价的把关，容易出现"引了 `styles.css` 但组件 CSS 里全是裸
hex/rgb"的漂移（实测：Anvil 181 处 `var(--game-ui-*)`/0 裸色值是模范，
同一批里也有仓库是 0 处 token/数十处裸色值）。kit 随包发布一个可直接
跑的检查工具，消费方不用装任何依赖：

```bash
npx swimmer-ui-check src            # 默认扫 .css，报告组件规则里的裸颜色
npx swimmer-ui-check src --ext=css,tsx
```

`:root { ... }` 与 `[data-*theme*=...] { ... }` 块内的裸颜色是**预期
行为**（下游正是用这种写法覆写 token），不会被标记；只有组件规则
（如 `.card { background: #123456; }`）里的裸颜色才算漂移。退出码
非零可直接接进消费方自己的 lint/CI。

### Break 裸色迁移指引（2026-07 历史试点，当前状态未复查）

Break 引了 kit 的 `styles.css` 却 0 处 `var(--game-ui-*)`、76 个裸
hex/rgb 色值散在自己约 1476 行 CSS 里——中央厨房模式下这是治理缺口，不是
代码缺口：Break 每次改主题都要手动改这 76 处，其余仓库改一个 token 就够。
这是**给 Break 仓库执行的任务**，不在本仓库改动范围内。执行者按下面步骤
操作：

1. 在 Break 仓库根目录跑 `npx swimmer-ui-check src`，拿到全部裸色值的
   文件名 + 行号清单。
2. 逐个裸色值找"就近语义"映射到 `--game-ui-*` token，不追求完美对应
   （参考 design-system-guide.md 的 token 三层架构表）：
   - 明显是品牌主色/CTA → `--game-ui-accent`/`--game-ui-accent-bright`。
   - 明显是危险/警告/成功状态色 → `--game-ui-danger`/`--game-ui-warning`/
     `--game-ui-success`（纯背景用途）或 1.1.0 新增的
     `--game-ui-danger-ink`/`--game-ui-accent-ink`（纯文字用途，直接把
     品牌色当文字颜色用時的 WCAG contrast 安全变体）。
   - 灰阶文字 → `--game-ui-text`/`--game-ui-text-muted`。
   - 面板/卡片底色 → `--game-ui-panel`/`--game-ui-panel-strong`/
     `--game-ui-surface`/`--game-ui-surface-raised`。
   - 半透明色一律改写成
     `color-mix(in srgb, var(--game-ui-token) N%, transparent)`，不要保留
     裸 rgba。
   - 拿不准就跳过（留裸色 + 加注释说明"待定"），不要为了清零硬凑映射。
3. 迁移完重跑 `npx swimmer-ui-check src` 确认清零（或只剩明确标注的
   例外），并把 Break 自己的 lint/CI 接上这条检查防止再漂移。
4. 产出一份简短迁移笔记（映射了多少处、跳过了多少处、为什么）回填到
   Break 仓库自己的文档；不需要改动本仓库。

## 历史消费者清单与其他产品升级

以下七仓清单、使用深度和接入状态来自 2026-07，不是本轮确认的当前资产表；
本轮没有授权批量升级它们。去对应仓核实后再执行通用 SOP。

kit 发新版后，7 个消费仓库**不会自动升级**（钉版是有意设计，见"消费方接入"
一节）。每个仓库按下面同一套命令逐一执行，任何一步失败就停在那个仓库，
不要连锁往下做：

```bash
# 在每个消费仓库根目录：
pnpm add --save-exact @pieai/swimmer-ui-kit@<new-version>
pnpm typecheck && pnpm test && pnpm build   # 各仓库自己的门，命令可能略有出入
```

然后按"消费方升级 SOP"第 4 步视觉走查，确认无回归后 commit + push。

**TuringPact 额外一步**：`src/pages/UiPreviewPage.tsx` 渲染
`<GameUiPreview />`，preview.css 拆分（见 design-system-guide "GameUiPreview
需要额外的 preview.css"一节）后必须补一行
`import '@pieai/swimmer-ui-kit/preview.css';`，否则 `/ui-preview` 路由会
渲染成无样式页面。其余 6 个仓库不受这条影响（都不渲染 `GameUiPreview`）。

7 个仓库路径：`~/PieAI/Anvil`、`~/PieAI/Break`、`~/PieAI/Collapse`、
`~/PieAI/OwnMySpace`、`~/PieAI/Show`、`~/PieAI/TuringPact`、`~/PieAI/YaZu`。
升级顺序无强制要求，建议先做深度消费的（Collapse/Show/OwnMySpace），因为
回归面积最大、最可能先暴露问题；YaZu 已装但源码尚未 import，属于"待接入"，
可以只 bump 版本号不做代码改动。

## "缺东西"的判定（何时上游加组件）

- **两个以上产品需要**，或明显通用（按钮/面板/窗口类）→ kit 上新。
- 只有一个产品需要且强业务耦合（如 Show 的礼盒舞台）→ 留在产品仓。
- 拿不准 → 先在产品仓做一版，第二个产品要用时再提炼上移
  （提炼时保留 props 合同，产品仓换 import 即可）。

## 本仓发版清单（维护者/AI 用）

1. `pnpm verify && pnpm docs:check && pnpm build-storybook && pnpm build:site` 全绿
   （build 内含 lightningcss CSS 构建，任何 warning 即失败）。
2. `src/tokens.test.ts` 守卫通过（禁裸色值/TS-CSS 一致/night 完整/
   禁 Tailwind at-rule/ESM-only 打包合同/套壳硬化存续）。
3. 打包体检：`npx publint` 零发现；
   `npx @arethetypeswrong/cli --pack . --entrypoints . ./package.json --profile esm-only`
   的 node16-ESM/bundler 通过。与发布工作流使用同一 profile；node10 与
   node16-CJS 不在该 profile 的验收范围，不能把忽略的解析模式称为已验证兼容。
4. API 变化分类：纯增量 → minor；破坏性 → major 并写迁移说明。
   改公开导出结构必须按 major 处理；不能借“整理”移除名字。本版保持结构不变，
   新增可选布局属性，因此为 minor。运行 `pnpm api:inventory` 更新派生索引，
   `api:check` 和公开合同测试阻止清单漂移；更新 `CHANGELOG.md`。
5. bump `package.json` version；`pnpm docs:check`；commit + push 到 `main`。
6. 发布 = `gh workflow run npm-publish.yml --ref main`。该手动安全开关
   通过 GitHub Actions OIDC Trusted Publishing 发布到 npmjs；不运行本机
   `npm publish`，不保存长期 npm write token，也不需要每次登录。
7. 工作流完成后用
   `npm view @pieai/swimmer-ui-kit@<version> version --registry https://registry.npmjs.org/`
   核验；registry 返回前不得宣布发布成功。
8. 在 HQ 不需要登记版本号——消费仓 lockfile 是版本真相。

## 兼容性承诺（1.0 合同）

- 同一 major 内：导出的组件与 props 只增不删；删除/改名先 deprecation
  一个 minor 周期，实际移除必须走 major。
- CSS 类名 `.game-ui-*` 视为公共 API 的一部分（TuringPact 等在覆写），
  改名等同破坏性变更。
- token 变量名 `--game-ui-*` 同上。
- `dist/styles.css` 保持 100% 标准 CSS（消费方零构建工具假设）；
  `./tailwind.css` 永远是可选文件。
- 打包形态 ESM-only；恢复 CJS 属破坏性变更（不会发生，除非 major）。

## Related Commands / Files

- 设计与主题规则：`docs/reference/design-system-guide.md`
- 规格：`docs/specs/active/SPEC-0001-design-system-hardening.md`、
  `docs/specs/active/SPEC-0002-v1-release-readiness.md`
- 消费现状（2026-07-13）：版本对齐——Anvil、Break 已在 1.0.1；Collapse、
  OwnMySpace、Show、TuringPact、YaZu 仍钉 1.0.0，发新版后按
  "本仓发版清单"逐仓升级 + 回归验证。深度消费按 import 该 kit 的源文件数
  排序：Collapse（23）> Show（18）> OwnMySpace（11）> TuringPact（4）≈
  Anvil（5）> Break（3）；YaZu 已装但源码尚未 import，属于"待接入"。
