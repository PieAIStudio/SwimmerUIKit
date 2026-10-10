---
id: REF-DOCUMENTATION-MAP
title: Documentation Map
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-10-03
domain: ui-components
tags:
  - uikit
  - reference
pinned: false
related: []
---

# 文档地图

AI 从根 AGENTS.md 进入；本文只帮人和 AI 找事实，不另设一份工作流。

| 要找什么 | 唯一当前入口 |
| --- | --- |
| 选择组件、原生语义、安装资源 | [组件选择](component-selection-guide.md) |
| 外观、风格、液体、涟与高级特效边界 | [主题与液体](theme-and-liquid.md) |
| 变量来源、覆写、字体与样式构建 | [设计 token](design-tokens.md) |
| 当前公开名字、实现链接 | [生成的接口清单](public-api-inventory.md) |
| 断代、产品迁移、University 候选验收 | [3.0 迁移](migration-3.0.md) |
| 现在做到哪、提交与证据 | [当前工作](execution/current-work.md) |

## 执行与历史

[3.0 结构重整](../plans/completed/PLAN-UIKIT-3-RESTRUCTURE.md)与[发布前补齐](../plans/completed/PLAN-UIKIT-3-COMPLETION.md)均已完成，3.0.0-rc.1与rc.3已发布到next，3.0.0稳定版待发布到latest（发布前latest保持2.14.0）。发布与失败历史由[当前工作](execution/current-work.md)定位；正式版和产品接入不在本次发布范围内。

docs/plans/completed 保留完成记录；docs/specs/completed 保留历史需求。OwnMySpace 专用设计/报告在 docs/archive/ownmyspace；2.x 研究与手册在 docs/archive/reference-2.x。它们不再决定 3.0 产品如何接入。

原始图片和测量文件移到 docs/archive/evidence/2.x，非 Markdown 工件逐一保留原字节；旧路径对应在 [3.0 迁移记录](../archive/relocations-3.0.json)。2.5 当时的迁移记录仍作为历史保留。先前发布回执在 [2.14.0 及以前](../archive/releases/through-2.14.0.md)；不根据旧流水账声称本轮已发版。

docs/reference/learnings 只按任务 recall，保留可复用失败原因，不作为每次启动必读。决策属于受治理的 docs/adr；治理规则在 docs/governance；共享规则仍是指向 PGS 的符号链接。本轮不更改它们的来源。

PRODUCT.md / CONCEPTS.md 是工具适配入口，只指向上述文档。donors-individual.md、锁文件与 NOTICE 保留来源及许可权威；CHANGELOG.md 保留版本变更。index.html / liquid.html 是实际网站入口，不是可删临时报告。

新截图和验证日志只放忽略的 .scratch/ 或 .devspace-visual/；不在根目录再次创建受版本控制的测量垃圾。现行文档变更后运行 pnpm docs:check；生成接口和迁移表修改生成来源，再运行 pnpm api:inventory。
