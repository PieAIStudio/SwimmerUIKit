---
id: PLAN-0003
title: Component Discovery 2.5.0 Closeout
type: plan
status: active
canonical: true
owner: project
created: 2026-09-12
last_reviewed: 2026-09-12
domain: product
tags:
  - release
  - discovery
  - evidence
pinned: false
related:
  - REF-COMPONENT-SELECTION-GUIDE
  - REF-PUBLIC-API-INVENTORY
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
  - REF-LIQUID-NEXT-STAGE-RESEARCH
---

# 2.5.0 组件发现性与整理交付

## Frame、范围与主线

让下一次正确改动变容易：新人从 README 找成品组件，而不是先学 272 个名字；
需要液体 CTA 时复用 kit；实现者沿模块职责定位；每个事实只有一个权威家。
主线是发现性与知识维护，拓扑和卫生整理支持同一目标。全宽按钮是单独命名、
单独验证的增量功能，不冒充行为保持的重构。不是美学重做或压缩液体源码。

范围仅 SwimmerUIKit。University 只读，donor 只读且 pin 不变。本轮未创建分支或
worktree；从 main 的 `1055db1`（2.4.0）接续。任务二仅形成调查，未实现未来
matte/glossy API、下拉选择或新效果。

## 发布状态

本地实现与发布闸门已通过；提交、远端发布与线上验证待本记录下一次更新。
`package.json` 的 2.5.0 此时仍是候选版本号，不是 npm 可用证明。

## 选择与否决的边界

选择保留根入口，用任务选型指南和编译器生成的索引提供分层视图。272 个公开
具名导出仍为 121 个值、151 个类型；全部原 export map 路径保留。引用审计基线在
`artifacts/api-audit/2.4.0.json`，记录声明、实际本地符号引用和 University 的导入，
而不是按名字猜私有性。未观察到引用不等于无人使用。

CTA 选 `GameButton surface="liquid"`，只加可选 `fullWidth`。拒绝再建 `cta` 形态、
重复按钮组件、为入口分类强拆物理引擎、把 University 路由过渡搬入 kit。
University 目的地注册和 `LiquidCtaTransition` 仍属产品；可执行迁移与回滚只在
[升级手册](../../reference/usage-and-upgrade-playbook.md)维护。

保住的合同：原具名导出/包路径/类名/token 名、默认非全宽按钮的 DOM 和布局、
十二形态、液体引擎与预算/休眠、ESM-only、零运行时依赖、原素材与 donor 归属。
新增可选布局属性且未改公开结构，因此是 minor。未来公开结构重排仍须 major。

## 已通过的证据与闸门

2026-09-12 本机最终源码验收（不是历史次数相加）：

| 闸门 | 结果 |
| --- | --- |
| `pnpm verify` | 47 个测试文件、309 项通过；包含 typecheck、lint、format、API 漂移、unit、Chromium browser、Storybook axe、样式和 build |
| `pnpm docs:check` | 加入本记录后 45 份文档通过，36 current files / 302 local links；audit/doctor 零警告 |
| `pnpm build-storybook` / `pnpm build:site` | 通过 |
| `npx publint` | All good |
| attw，按 SOP 的 esm-only profile | node16-ESM、bundler 通过；CJS/node10 被排除，非兼容证明 |
| 历史正文与 PNG 核对 | 13 次迁移已落位；要求保留原文的 11 份正文逐字保留；269 张旧 PNG 的路径与字节全同 |

浏览器证据在本地 `.devspace-visual/discovery-2.5/`（隔离的生成证据，不发布进包）：
`final-preview-evidence.json`、`final-*-cta-viewport.png`、`contract-comparison.json`。
本轮源站为 127.0.0.1:5176，已核实端口进程 cwd 属于本仓。

桌面明/暗、375px 触屏明/暗、桌面 reduced-motion 五组全部通过。全页宽度分别为
1280/1280 与 375/375，非只测新卡片；按钮和液体外形同宽，触屏高 44px；真实
Enter/Space/click 各触发一次；锚点有效，目标标题不被 sticky 导航遮住；无 pageerror。
夜间通过实际主题按钮切换，而不是仅修改截图。已查看实际窄屏及夜间截图。
长中文全宽 CTA 的两主题样例还检查了无横溢出、真实触屏/键盘和 reduced-motion。

与 npm 已发布 2.4.0 的隔离对照：固定 viewport、DPR1、字体、文案、坐标，在普通/
液体 × 明/暗四组静止场景中，按钮矩形与 PNG 字节完全一致。这不等于所有浏览器、
动画中间帧或全部组件都像素一致。早先整页截图的亚像素坐标不相同，PNG 不同，
已保留该观察，不拿它作为严格同场景对照；其具体像素差异来源未进一步定性。

## 文档与卫生决定

[迁移映射及逐项理由](../../archive/relocations-2.5.0.json)是此次路径变更清单。
旧教程、3D 前瞻、提取报告、July 计划和测量原文保留在 archive；旧计划退役不代表
未完成选项已经交付。两份仍有效的原语/游戏壳说明进入 reference，过时规则已收敛。
PRODUCT/CONCEPTS 保留工具入口，改为权威来源指针；AGENTS/CLAUDE 原相对链接
和 donor index/lock/NOTICE 保留。失效引用、manifest 和入口随迁移更新。

根 Markdown 数量由 11 降到 7；总行数由 2,375 降到 1,553（本机逐文件计数）。
统计 CLAUDE 时读取其 AGENTS 内容，与原口径一致。没有为了降数字删原始证据。

263 张 artifacts PNG 属于历次测量/人工验收；6 张 SCRATCH PNG 可追溯到
`4d4b90d` 的 LiquidGroup stroke 交付。独立 edge 测量脚本会写输出，不是自动读取
全库图片比对的 golden suite。未知外部验收引用阻止破坏性清理，原路径均保留，
补 README 说明归属。新 scratch、日志、构建和本机交接输出被忽略。
仅去掉已忽略的 Finder 元数据与核实为空的旧 doc 目录；没有删除未知内容或宿主缓存。

## 有意变化与回滚

有意变化：fullWidth 布局、组件选择入口、资料位置、派生 API 索引与守卫、展厅
代码/资源长路径换行、窄屏状态行换行和导航锚点避让。展厅修复仅在 preview CSS，
不修改消费者组件样式；液体物理和主题没有重调。

提交前不使用 reset/clean；提交后按具体提交 revert。Git 基线 `1055db1` 可恢复
原路径，迁移映射保留一对一对应。npm 已发布版本不可覆盖：修复发新的 patch；
消费方按升级手册分别回滚 CTA 迁移、三包钉版与 lockfile，不覆盖其他 AI 的工作。

## 仍然存在的不确定性

**确认过并保留**：原 272 个公开导出、包路径、液体源码/形态、269 PNG 原件、11 份
归档正文、两个宿主相对链接、donor pin/NOTICE、默认按钮四组渲染对照。

**因为边界未查全而保留**：其他消费仓、外部 npm 使用方、历史截图在外部验收线程
和书签的引用；不能据 University 未导入就删除 helper 或图片。本次没有向 University
发出写操作，但不宣称其他 AI 没有在该仓工作。

**未在本轮验证**：Safari/Firefox/真机 WebView 的完整矩阵、FPS/性能提升、未来
两种 finish 的审美 A/B、更多 donor 图像优化的收益和商业 Studio 素材许可。
已有 WebGL/原语效果不因为本次文档整理自动获得新的跨平台性能保证。
嵌入 GameUiPreview 的产品仍需自行提供其 `liquid.html` 相对目标；本轮没有改变
该旧链接合同。API Extractor 内置 TS5.9.3 与项目 TS6.0.3 的提示、Storybook 空
MDX glob 和大 chunk 提示仍存在；通过闸门不等于整个工具链零警告。

复用学习：本轮的导出、材质和清理结论归入现有指南与本记录；没有另建重复的
learning 文档。下一阶段候选及一手来源在 [调查](../../reference/liquid-next-stage-research.md)。
