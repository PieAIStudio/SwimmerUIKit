---
id: REF-GAME-SURFACE-PACK
title: Game Surface Pack
type: archive
status: archived
canonical: false
owner: project
created: 2026-09-11
last_reviewed: 2026-09-11
domain: product
tags:
  - compositions
  - game-shell
pinned: false
related:
  - REF-COMPONENT-SELECTION-GUIDE
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
---

> 2026-10-02 归档：以下是 2.x 的设计/执行原文，不是 3.0 接入说明。新的边界见[迁移表](../../reference/migration-3.0.md)；原路径 docs/reference/game-surface-pack.md，来源提交 8442b1a。归档不把未完成提案改写成已交付。


# 游戏外壳与通用组合

GameShell 是围绕场景的槽位，不是建造业务包。children 放场景，hud、sidePanel、movementPad、bottomBar、overlay 和 assetLibrary 放由产品拥有的 DOM 内容。
GameFactList 展示事实；GameMovementPad 输出带可访问名称和键盘操作的方向意图；GameHudActions 安排动作。
产品仍负责场景、房间、持久化、模型提供者、资产清单与建造任务。

3.0 按 Owner 的 D1 决定移除 OwnMySpace 独占的建造、施工、资产库和放置工具。别名收敛到 GameShell 与 GameFactList；逐项见 [迁移表](../../reference/migration-3.0.md)。
GameMaterialSwatches 已被 University 用于头像配色，因此作为不依赖建造模型的通用控件保留。

先用 [组件选择指南](../../reference/component-selection-guide.md) 找当前公开组件；历史 OwnMySpace 界面不能再作为 3.0 产品接入示例。
