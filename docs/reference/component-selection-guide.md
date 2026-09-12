---
id: REF-COMPONENT-SELECTION-GUIDE
title: Component Selection Guide
type: reference
status: active
canonical: true
owner: project
created: 2026-09-11
last_reviewed: 2026-09-12
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

## 做一颗主按钮

用 **`GameButton variant="primary"`**。要液体质感，加 `surface="liquid"`；
要填满卡片的一行，再加 `fullWidth`。不要先打开液体引擎调参数。

```tsx
import { GameButton } from '@pieai/swimmer-ui-kit';
import '@pieai/swimmer-ui-kit/styles.css'; // 应用入口只引一次

export function StartAction({ onStart }: { onStart: () => void }) {
  return (
    <GameButton variant="primary" surface="liquid" fullWidth onClick={onStart}>
      开始学习
    </GameButton>
  );
}
```

普通主按钮只去掉 `surface="liquid"`。`variant` 是操作语义，`surface` 是表面，
两者不是互斥的按钮品种。`fullWidth` 是布局，不是新的液体形态。

**三步路径证据**：README 的「我该用哪个组件？」链接 → 本页第一个标题
「做一颗主按钮」及可复制代码 → Storybook `Clay / Controls / GameButton`
的 `Liquid CTA / 液体主按钮`（也可在 preview 首页的 Start here 直接操作）。
仅需前两步就已找到组件；第三步用来确认观感，而非继续找 API。

## 按要完成的事情选

| 我要做什么 | 先用什么 | 容易用错的地方 |
| --- | --- | --- |
| 开始、继续、保存、提交 | `GameButton` | 表单提交须写 `type="submit"`；默认是 button |
| 只有图标的操作 | `GameIconButton` | 提供可访问名称，不靠 tooltip 代替 |
| 文本输入、长文本、勾选 | `GameField` + `GameInput` / `GameTextArea` / `GameCheckbox` | `GameForms` 是源码模块名，不是公开组件 |
| 设置开关、范围数值 | `GameToggle` / `GameSlider` | 产品拥有值和变化回调 |
| 从固定选项中选择 | `GameField` + `GameSelect` | 原生 select；弹出菜单归系统，支持 optgroup/表单/reset；不是可搜索 combobox |
| 在少量选项间切换 | `GameSegmentedControl` | 已集成液体跟随，不要再包第二个 LiquidGroup |
| 标签页切换 | `GameTabs` | 产品连接 tab 与对应 panel |
| 一块信息面板 | `GamePanel` / `GameCollapsiblePanel` / `GameWindowPanel` | 窗口式面板不等于模态对话框 |
| 真正阻断背景操作的模态框 | `GameModal` | `GameDialog` 是内联对话内容，不是 native dialog |
| 空状态、提示、进度 | `GameEmptyState` / `GameCallout` / `GameProgress` | `GameToast` 是展示组件，不是完整队列服务 |
| 图标、头像、徽章 | `GameAssetIcon` / `GameAvatar` / `GameBadge` | 图标需先完成 [README 素材设置](../../README.md#whats-inside) |
| 围绕游戏画布的壳、HUD、资产栏 | `GameShell` / `GameSceneHudLayout` / `GameAssetLibrary` | [游戏壳说明](game-surface-pack.md)；不包含游戏运行时 |
| 地形工具或建造任务面板 | `GameTerrainBuildToolbox` / `GameContractorPanel` | 领域组合，不是所有产品的起步依赖 |

没有列出的名字不是私有，也不是废弃。完整的 [公开 API 分组索引](public-api-inventory.md)
由 TypeScript 生成，列出每个值、类型和定义文件；`pnpm api:check` 防止遗漏。

## 液体：先选控件，再选动作

一个新人用液体按钮只需知道 `GameButton` 和 `surface="liquid"`。
自定义单体反馈才需要 `LiquidSurface` 和 `active`。多个物体相互融合、分离、
跟随时，才读 `LiquidGroup`。预算、滤镜和弹簧不是使用按钮的前置知识。

| 使用层 | 入口 | 何时需要 |
| --- | --- | --- |
| 成品控件 | `GameButton`、`GameSegmentedControl`、`GameProgress` | 常见交互，先用这层 |
| 单体装饰 | `LiquidSurface form="press" active={pressed}` | 自己拥有真实 DOM 控件，只借用背后的一团液体 |
| 多体关系 | `LiquidGroup` + `liquidFormGroup` / `liquidFormItem` | 融合、分离、跟随、液滴关系，需要自己安排参与者 |
| 高级支持 | image-melt 配置、预算设置、安全常量 | 经设计评审的特殊效果或宿主性能管理 |

十二个形态是**动作词汇，不是十二种控件**。
完整分类只在设计系统入口维护；例如 `press` 是单体，`merge` 是多体。
`LIQUID_FORMS[form].kind` 是分类权威，
`LiquidSurface` 收到 group 形态会警告，不会替你凭空创建兄弟物体。
不要把 `fill` 当作带进度状态和可访问语义的完整进度条；用 `GameProgress`。

默认外观、单体/多体的边界、投影与工程地图见
[设计系统的液体入口](design-system-guide.md#液体从使用者到实现者)。
需要研究图像 Morph / Melt / Bend 才读 [液体原语参考](liquid-primitives.md)。
preview 的 `liquid.html` 展示全部形态；没有这个页面的消费宿主不应照搬相对链接。

## 不要混淆三种“扁平 / 发亮”

`GameButton surface="flat"` 是普通控件表面，不代表“哑光液体”。
`GameButton surface="liquid"` 使用当前命名形态的体积、高光和投影。
2.6 起可选 `liquidFinish="matte" | "glossy"`；省略时保持旧配方。
同一选项也用于液体图标按钮、开关、分段、进度、选择框，以及 LiquidSurface/LiquidGroup。
`LiquidMetalButton` 是另一套金属效果与 CSS/WebGL renderer，不是普通液体的
“高光开关”。[在线目录](https://swimmer-ui-kit.pieaistudio.com/) 已可操作两种 finish；
设计指南是选项和限制的唯一权威说明。[早期调查](liquid-next-stage-research.md) 保留尚未采纳的候选和理由。

## 公开，但不应从这里起步

`resolveDissolveOptions`、`DISSOLVE_DEFAULTS`、`IMAGE_MELT_DEFAULTS` 和
`LIQUID_GOOEY_WAVINESS_MAX_FRACTION` 是高级支持；预算 setter/getter 是宿主策略；
`GameUiPreview` / `GAME_UI_PREVIEW_MESSAGES` 是展厅支持。它们既然已在根入口导出，
就继续受兼容性合同保护，不能因为当前产品没引用就改成私有。

`LIQUID_BLOB_MAX_FRACTION` 与 `liquidGooeyEdgeContrast` 在内部模块导出供实现和
测试使用，**不在 npm 根入口的 272 个名字中**。历史 CHANGELOG 中“exported”
未区分模块导出和包导出；不要从包根 import 它们，也不要 deep-import `src/`。
