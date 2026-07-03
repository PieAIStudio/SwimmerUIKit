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

1. 安装（GitHub Packages 私有源）并钉精确版本：
   `"@pieaistudio/swimmer-ui-kit": "0.9.0"`（不用 `^`，升级必须是
   显式动作 + 本仓库回归验证）。
2. 入口处引一次样式：`import '@pieaistudio/swimmer-ui-kit/styles.css'`。
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

1. `pnpm typecheck && pnpm test && pnpm build && pnpm build-storybook` 全绿。
2. `src/tokens.test.ts` 守卫通过（禁裸色值/TS-CSS 一致/night 完整）。
3. API 变化分类：纯增量 → minor；破坏性 → major 并写迁移说明。
4. bump `package.json` version；`pnpm docs:check`；commit + push。
5. 发布到 GitHub Packages（需要 `NODE_AUTH_TOKEN`）：`pnpm publish`。
   无 token 时由创始人本机执行。
6. 在 PieHQ 不需要登记版本号——消费仓 lockfile 是版本真相。

## 兼容性承诺

- `0.x` 阶段：导出的组件与 props 只增不删；删除/改名走 deprecation
  一个 minor 周期。
- CSS 类名 `.game-ui-*` 视为公共 API 的一部分（TuringPact 等在覆写），
  改名等同破坏性变更。
- token 变量名 `--game-ui-*` 同上。

## Related Commands / Files

- 设计与主题规则：`docs/reference/design-system-guide.md`
- 规格：`docs/specs/active/SPEC-0001-design-system-hardening.md`
- 消费现状：Show（钉 0.8.0，仅样式底座）、TuringPact（9 文件 + token
  覆写）、OwnMySpace（11 文件，最重度组件消费方）、Non-Heroes（未接入，
  接入时机由其商业里程碑决定）
