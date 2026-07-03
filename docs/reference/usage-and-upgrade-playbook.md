---
id: REF-USAGE-AND-UPGRADE-PLAYBOOK
title: Usage and Upgrade Playbook
type: reference
status: active
canonical: true
owner: h
created: 2026-07-03
last_reviewed: 2026-07-03
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
   `"@pieaistudio/swimmer-ui-kit": "1.0.0"`（不用 `^`，升级必须是
   显式动作 + 本仓库回归验证）。包是 **ESM-only**、**零运行时依赖**，
   peer 只有 react/react-dom ≥19——不需要 Tailwind、不需要任何 CSS
   处理器，也不需要 scope-specific `.npmrc` 或 package-read token。
2. 入口处引一次样式：`import '@pieaistudio/swimmer-ui-kit/styles.css'`。
   （可选：Tailwind v4 宿主想让 `bg-primary` 等映射到 kit token，再加
   `import '@pieaistudio/swimmer-ui-kit/tailwind.css'`；非 Tailwind
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
   `npm view @pieaistudio/swimmer-ui-kit@<version> version --registry https://registry.npmjs.org/`
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
- 消费现状（2026-07-03）：深度消费 = TuringPact（组件 + token 覆写）、
  Show（样式底座 + GameButton/GamePanel/GameTabs 等）、OwnMySpace
  （最重度，11 文件）；已安装待接入 = SupaLuv、Non-Heroes、YaZu
  （均已钉 0.9.0 并配好 .npmrc，源码尚未 import）
