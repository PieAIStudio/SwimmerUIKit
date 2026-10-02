---
id: REF-COMPONENT-SELECTION-GUIDE
title: Component Selection Guide
type: reference
status: active
canonical: true
owner: project
created: 2026-09-11
last_reviewed: 2026-09-21
domain: product
tags:
  - components
  - discovery
  - liquid
pinned: true
related:
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
  - REF-PUBLIC-API-INVENTORY
---

# 我该用哪个组件？

当前 main 正在进行 3.0 断代，不是已发布公告。升级产品前先读 [逐项迁移表](migration-3.0.md)；不让现有产品自动跟随 main。

## 先按任务选择

| 要完成什么 | 使用什么 | 边界 |
| --- | --- | --- |
| 开始、保存、继续、确认 | GameButton | 主操作 variant="primary"；提交表单明确写 type="submit"，默认只是按钮。 |
| 只有图标的动作 | GameIconButton | label 是可访问名称，不能只靠提示框。 |
| 单行、长文、勾选、固定下拉 | GameField + GameInput / GameTextArea / GameCheckbox / GameSelect | 保持原生输入、表单重置和焦点语义；GameSelect 不是搜索框。 |
| 开关、数值、分段与页签 | GameToggle / GameSlider / GameSegmentedControl / GameTabs | 产品拥有值；Tabs 由产品连到相应 tabpanel。 |
| 验证码、独立列表动作 | GameOtpInput / GameListRow | 验证请求由 AuthKit/产品拥有；列表右侧动作与选择是兄弟按钮。 |
| 一块信息、折叠信息、阻断背景的对话框 | GamePanel / GameCollapsiblePanel / GameModal | GameDialog 是内联对话内容，不是模态框；编辑表单跨关闭保留时用 keepMounted。 |
| 空状态、通知、进度、简短解释 | GameEmptyState / GameToast / GameCallout / GameProgress / GameHelpTip | 进度必须真实；Toast 不是队列服务，必要错误不能藏进 HelpTip。 |
| 游戏外壳和 HUD 槽位 | GameShell / GameHudActions / GameFactList | 不包含场景、持久化、资产业务和建造队列。 |
| 头像、配色、收集卡、开屏 | GameAvatar / GameMaterialSwatches / GameCollectibleCard / GameSplash | 产品负责内容、稀有度、加载状态；配色色块也用于头像，不依赖地形工具。 |
| 图标 | GameAssetIcon / getClayIconPath | 先用 swimmer-ui-assets 复制包内素材，再设置 source 模式；公开 assets 路径保持。 |

## 液体、可选特效和预览的入口

普通界面从 @pieai/swimmer-ui-kit 导入成品控件，样式在应用入口只引一次 styles.css。
S3 保持现有控件表面；S4 才切换到 Owner 定稿的二维水滴和专属 CTA，不能把中间阶段截图当最终主题。

单体装饰用 LiquidSurface，多体关系用 LiquidGroup + liquidFormItem。它们不替代真实 DOM 控件。
宿主预算只通过 setLiquidGooeyBudget 设置，不依赖内部计数器、默认常量或整张配方表。

需要融化、弯曲或图像接触溶解时，从 **@pieai/swimmer-ui-kit/liquid-effects** 导入 LiquidEffectsGroup，子项使用其 Item。
这是可选依赖边界，不是第二套液体引擎：测量、时钟、预算与减少动态仍由同一引擎负责。

涟与它的面板、锚点继续从 **@pieai/swimmer-ui-kit/liquid-presence** 导入；还需显式引入 liquid-presence.css。
它只画身体与手势，不调用模型，不开启麦克风，不替用户点击目标。

组件展厅 GameUiPreview 和 LiquidPreview 从 **@pieai/swimmer-ui-kit/preview** 导入，并显式引入 preview.css。
默认控件包和涟的入口都不会带上展厅、图像融化或弯曲代码。

## 深色主题与迁移

3.0 使用 data-game-ui-theme="light" 或 "dark"。产品源码与样式可运行 swimmer-ui-check 发现旧取值；检查报错不会提供兼容渲染。
拆分、删除和改名逐条见 [迁移表](migration-3.0.md)。完整的当前名字与源码链接在 [公开接口清单](public-api-inventory.md)，以它为准，不从旧示例猜哪些内部名字仍然公开。

常规布局、原生语义和工程边界在 [设计系统指南](design-system-guide.md)；S5 会继续收敛旧文档，不在产品仓库复制一套控件。
