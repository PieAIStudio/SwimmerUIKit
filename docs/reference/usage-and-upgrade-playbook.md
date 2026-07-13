---
id: REF-USAGE-AND-UPGRADE-PLAYBOOK
title: Usage and Upgrade Playbook
type: reference
status: active
canonical: true
owner: h
created: 2026-07-03
last_reviewed: 2026-07-13
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

给消费项目（Show / TuringPact / OwnMySpace / Non-Heroes 及未来产品）的
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
   `"@pieai/swimmer-ui-kit": "1.0.0"`（不用 `^`，升级必须是
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

### Break 裸色迁移指引（试点，待 Break 仓库内执行）

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

## 全生态版本对齐清单（发新版后逐仓执行）

kit 发新版后，7 个消费仓库**不会自动升级**（钉版是有意设计，见"消费方接入"
一节）。每个仓库按下面同一套命令逐一执行，任何一步失败就停在那个仓库，
不要连锁往下做：

```bash
# 在每个消费仓库根目录：
pnpm add @pieai/swimmer-ui-kit@<new-version>
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

1. `pnpm typecheck && pnpm test && pnpm build && pnpm build-storybook` 全绿
   （build 内含 lightningcss CSS 构建，任何 warning 即失败）。
2. `src/tokens.test.ts` 守卫通过（禁裸色值/TS-CSS 一致/night 完整/
   禁 Tailwind at-rule/ESM-only 打包合同/套壳硬化存续）。
3. 打包体检：`npx publint` 零发现；`npx @arethetypeswrong/cli --pack .`
   node10/node16-ESM/bundler 全绿（node16-CJS 的 ⚠️ 是 ESM-only 固有
   属性，属预期）。
4. API 变化分类：纯增量 → minor；破坏性 → major 并写迁移说明。
   更新 `CHANGELOG.md`。
5. bump `package.json` version；`pnpm docs:check`；commit + push 到 `main`。
6. 发布 = `gh workflow run npm-publish.yml --ref main`。该手动安全开关
   通过 GitHub Actions OIDC Trusted Publishing 发布到 npmjs；不运行本机
   `npm publish`，不保存长期 npm write token，也不需要每次登录。
7. 工作流完成后用
   `npm view @pieai/swimmer-ui-kit@<version> version --registry https://registry.npmjs.org/`
   核验；registry 返回前不得宣布发布成功。
8. 在 PieHQ 不需要登记版本号——消费仓 lockfile 是版本真相。

## 兼容性承诺（1.0 合同）

- `1.x` 内：导出的组件与 props 只增不删；删除/改名先 deprecation
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
