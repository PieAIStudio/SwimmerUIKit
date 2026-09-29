---
id: PLAN-WO-UI-1-ACCOUNT-CONTROLS
title: WO-UI-1 Account Controls
type: plan
status: active
canonical: true
owner: project
created: 2026-09-29
last_reviewed: 2026-09-29
domain: ui-components
tags:
  - account
  - upstream
  - release
pinned: false
related:
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-CURRENT-WORK
supersedes: []
superseded_by: null
---

# WO-UI-1 账号界面原件

## 授权与边界

按 Owner 的 World UX V2 工单实现，不重新设计；L1 M1 N1 已确定。
只改 SwimmerUIKit，不接入 Directing、不升级其他产品。
main 基线为 `6eeb09e`，原有未跟踪 `.scratch/` 保留、不提交。
候选版本 `2.13.0`；2026-09-29 npm 官方版本列表最高为 `2.12.0`。
正式发布前必须再查是否被其他工作占用。

**发布权限未解决**：Owner 要求私有发布，但 manifest 和现行 SOP 是公开 npm
及公开 GitHub。当前仅做本地代码、合成验收与候选提交，不推送、不公开发布、不改包可见性。
Owner 明确允许现有公开流程，或给定私有发布目标后，才能收口为已发布。

## 验收进度

- [x] 铜牌皮肤、数字验证码输入、竖排页签、独立操作列表行。
- [x] 先红后绿：7 个浏览器用例全红；定位焦点旧状态问题后原断言 7/7 通过。
- [x] 相关类型、令牌/对比度及六个新故事：63 个检查通过。
- [x] Storybook 与 site 构建。
- [x] 全库 verify（76 文件、482 测试）、文档及包体/ESM 类型检查。
- [x] 构建后三浏览器 × 深浅色 × 1280/375px 共 12 组；含合成触控、减少动效。
- [x] 最终四张新原件与四张旧控件对照截图逐张看过，没有遮挡或横向溢出。
- [x] 旧默认控件四张截图逐像素一致，SSR 标记也完全一致。
- [ ] Owner 确认发布范围后发布、registry 回读。

## 实现与兼容

接口只在 [设计指南](../../reference/design-system-guide.md#账号界面原件) 维护。
纯新增，不改默认外观，不加依赖、不改 peer 要求。只给按钮/图标按钮/头像开放铜牌，
没有让原来共用 surface 类型的选择框、开关或进度条宣称支持它。
API 生成器补了两个新模块归类，没有取消未分类检查。

旧模态测试的截图输出从 `.scratch/` 移到 `.devspace-visual/`，防止全库测试
覆盖他人的旧证据；测试内容、断言和原始截图均未替换。

## 证据

证据根目录：`.devspace-visual/wo-ui-1-20260929/`。

- `red.log`：实现前 7 个用例失败。
- `green-1.log`：连续输入焦点被旧 value 拉回，6 过/1 失败。
- `green-2.log`：只修焦点处理后 7/7 通过，断言未放宽。
- `components-and-stories.log`：50 个令牌检查、7 个交互检查、6 个故事通过。
- `storybook-build.log`、`site-build.log`：构建成功。
- `baseline-build.log`、`baseline-defaults.json`、`default-*-before.png`：未改实现前的
  实际 dist 基线，不是用新实现重新生成的金图。

最终采用的浏览器证据在 `accepted/`，不是之前的 `built-1/` 或 `built-2/`。
`accepted/receipt.json` 记录自有 localhost 预览的 PID、根目录、端口及 12 组结果；
预览进程均已在测试结束时关闭。铜牌最低实测对比度 4.8818:1，故事画布文字最低
10.9392:1。验收图为 `accepted/chromium-{light,night}-{1280,375}.png`，
对照图为 `accepted/default-{light,night}-{1280,390}-after.png`，共八张逐张检查。

| 命令 | 结果 / 日志 |
| --- | --- |
| `pnpm verify` | 76 文件 / 482 测试；`verify-accepted.log` 为收口重跑，旧 `verify-final.log` 保留 |
| `pnpm docs:check` | `docs-accepted.log`；沿用仓库全部文档门禁 |
| `pnpm build-storybook` | `storybook-canvas-build.log` |
| `pnpm build:site` | `site-build-final.log`；之后仅改测试/故事画布，不改展示站或运行时代码 |
| `pnpm check:account-controls <output> <baseline>` | 12 组和四帧默认对照通过；`accepted-built.log` |
| `node scripts/verify-catalog.mjs <origin> <browser>` | Chromium 31、Firefox 31、WebKit 29 场景；`catalog-*.log`，保留原有能力差异 |
| `npx publint` | 通过；`publint.log` |
| `npx @arethetypeswrong/cli --pack . --entrypoints . ./package.json --profile esm-only` | 通过；`package-types.log`，既有 ESM-only 合同不扩为 CommonJS |

视觉检查另发现铜牌禁用态与夜间故事背景问题，分别保留
`red-disabled-plaque.log`（opacity 为 1）和 `canvas-red.log`（画布文字仅 1.2146:1），
修样式/故事画布后原断言通过。未更新旧金图、取消检查或放宽阈值。

Firefox 的合成 ClipboardEvent 构造器会丢弃传入的 clipboardData；三浏览器最小实验
证实后，只为合成事件显式附上测试数据。receipt 标明此处是合成夹具，
没有操作系统剪贴板读取、权限变更或真实粘贴验收。`built-check-1.log` 保留该失败。

没有另起经验文档：焦点、主题和事件夹具的已验证边界留在对应回归/源码注释及本记录，
不扩展新的必读流程。

## 未验证与回退

本地验收收口，发布等 Owner 确认公开/私有范围。本工单仍保持 active，不能记为已发布。
Directing 不应安装本候选；AK-1 的 UI-1 已发布依赖未满足。
不声称真实短信、自动填充服务、物理手机输入法或产品线上接入已验收。
本库不发送登录请求，测试全部使用合成值。

消费者保持原来的精确版本即可回退；新 API 未接入不影响现有产品。
本地如需撤回，只反向还原本工单的精确提交，不 reset/clean 原有工作区。
