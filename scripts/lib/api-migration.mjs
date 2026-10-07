import { readFileSync } from 'node:fs';

const mappedNames = {
  GameAssetIcon:
    '改用 GameIcon；图标语义名字保留，变为 currentColor 的内联线条。size 只支持 sm16 / md20 / lg24；需要彩色插画的产品先自行保存其旧图，不依赖品牌包。',
  GameAssetIconProps: '改用 GameIconProps，删除资源路径与 game/line 表面选择参数。',
  ClayIconName: '改用 GameIconName；原清单的35个实际名字保留，新增13个常用名字。',
  CLAY_ICON_NAMES: '改用 GAME_ICON_NAMES；全部48个名字对应一套内联 SVG 线条。',
  getClayIconPath: '删除图片路径解析；用 GameIcon 或 icon-paths 子入口的独立路径数据。',
  setClayAssetMode: '删除，无须替代；内联 SVG 没有资源模式初始化。',
  getClayAssetMode: '删除，无须替代；不再存在资源模式。',
  setClayAssetBasePath: '删除，无须替代；不再存在可配置图片根。',
  GameButtonSurface:
    '删除独立皮肤轴。GameButton 的 primary 固定为潮汐液体 CTA，其余变为二维水滴；GameIconButton 固定二维水滴。不保留 flat/liquid/plaque 按钮兼容开关。GameAvatar 的独立静态铜牌相框仍保留。',
  LiquidFinish:
    '删除 matte/glossy 材质开关；CTA、涟与面板共享同一套薄液体重量。高级 LiquidGroup / LiquidSurface 数值原件仍可显式调整 gloss，不保留旧厚配方。',
  GameStatList: '改用 GameFactList；删除重复别名。',
  GameStatListProps: '改用 GameFactListProps；删除重复别名。',
  GameSceneHudLayout: '改用 GameShell；删除重复别名。',
  GameSceneHudLayoutProps: '改用 GameShellProps；删除重复别名。',
  GameTerrainMaterialSwatch: '改用 GameMaterialSwatch；通用配色选择不再依赖地形模型。',
  GameTerrainMaterialPattern: '改用 GameMaterialPattern；通用配色选择不再依赖地形模型。',
  GameTerrainBuildVariant: '配色色块改用 GameMaterialLayout；其余建造专用界面由产品自己拥有。',
  GameUiPreview: '从 @pieai/swimmer-ui-kit/preview 导入同名组件；展厅不进入默认包。',
  GameUiPreviewProps: '从 @pieai/swimmer-ui-kit/preview 导入同名类型。',
  GAME_UI_PREVIEW_MESSAGES: '从 @pieai/swimmer-ui-kit/preview 导入同名示例数据；不是产品消息状态。',
  BendTuning:
    '从 @pieai/swimmer-ui-kit/liquid-effects 导入同名类型；搭配 LiquidEffectsGroup.Item。',
  ImageMeltOptions: '从 @pieai/swimmer-ui-kit/liquid-effects 导入同名类型。',
  DissolveOptions: '从 @pieai/swimmer-ui-kit/liquid-effects 导入同名类型。',
  DissolveValue: '使用 LiquidEffectsItemProps["dissolve"]；只在 ./liquid-effects 支持。',
  LiquidItem:
    '使用 LiquidGroup.Item；需要融化、弯曲或图像溶解时改用独立入口的 LiquidEffectsGroup.Item。',
  LiquidFormItem: '使用 ReturnType<typeof liquidFormItem>，避免重复公开内部配方结构。',
  LiquidFormGroup: '自定义组合用 LiquidGroupProps；内部命名配方不再公开。',
  LiquidFormKind: '动作类别是实现细节；成品单体用 LiquidSurface，多体由 LiquidGroup 显式组合。',
  LiquidFormSpec: '内部完整配方表不再公开；使用 LiquidSurfaceProps 或 LiquidGroupProps。',
  LIQUID_FORMS: '删除内部配方表；成品单体用 LiquidSurface，自定义姿态用 liquidFormItem。',
  LIQUID_FORM_NAMES: '删除内部遍历表；产品按实际需要选择 LiquidForm，不将整张演示表当产品菜单。',
  liquidFormGroup: '删除内部组配方；使用 LiquidGroupProps 显式定义多体关系。',
  liquidFormSummary: '删除预览说明帮助函数；从组件选择指南选择组件。',
  getLiquidGooeyBudget:
    '删除运行时预算快照读取；宿主用 setLiquidGooeyBudget 设置策略，内部自行计数。',
  GAME_UI_LIQUID_METAL_TOKENS: '删除零使用金属按钮及其 token；主操作用 GameButton。',
  useGameSplashDelay:
    '删除未被产品使用的计时帮助函数；产品根据真实加载状态决定何时显示 GameSplash。',
  getClayCatalogPaths: '删除展厅素材表访问；图标用 GameIcon。',
};

export function migrationRows(current) {
  const before = JSON.parse(readFileSync('tests/fixtures/api-2.14.0.json', 'utf8')).exports;
  const retained = new Map(current.map((item) => [item.name, item.kind]));
  return before
    .filter((item) => retained.get(item.name) !== item.kind)
    .map((item) => {
      let action = mappedNames[item.name];
      if (
        /\/GameActionGrid\/|\/GameCardFan\/|\/GameHud\/|\/GameOrientationGate\/|\/FirstSessionHud\//.test(
          item.module,
        )
      )
        action =
          'S7 删除未公开且无产品调用的整个组件、样式、故事和展厅片段；一般工具栏使用 GameHudActions，收藏展示使用 GameCollectibleCard，首次引导使用 FirstSessionOnboarding。';
      if (!action && /\.\/game\/(?:construction|terrain|assets|placement)\//.test(item.module))
        action =
          '删除 OwnMySpace 建造、施工或资产业务界面；产品继续锁定旧版，升级时迁移到产品自身的业务模块，不在品牌包保留兼容层。';
      if (!action && /LiquidMetal|LIQUID_METAL/.test(item.name))
        action = '删除零使用金属按钮及 WebGL 预算；主操作使用 GameButton。';
      if (!action && /^CLAY_.*_TOKENS$|^ClayTokenCategory$/.test(item.name))
        action =
          '删除旧黏土 token 镜像；主题事实只在 CSS 语义变量中，跨栈常用引用由 GAME_UI_TOKENS 提供，不保留旧别名。';
      if (!action && /DEFAULT|resolveDissolveOptions/.test(item.name))
        action = '删除内部默认值或解析帮助函数；传入公开组件参数，由实现负责默认值和校验。';
      if (!action && /AudioParam|GainNode|OscillatorNode/.test(item.name))
        action = '删除独立内部音频结构类型；宿主音频适配使用 GameInteractionAudioContext。';
      if (!action && item.name === 'playGameCardRevealSoundForContext')
        action = '删除未使用的独立揭卡音频帮助入口；使用 playGameCardRevealSound。';
      if (!action && /^(?:CLAY_|Clay|acknowledgeClay|getClay)/.test(item.name))
        action =
          '删除素材目录、解析、路径和表面帮助入口；用 GameIcon / GAME_ICON_NAMES，不再有资源初始化或公开图片目录。';
      if (!action && /TOKENS$|GAME_UI_OVERLAY|WAVINESS/.test(item.name))
        action =
          '删除内部 token 分类或渲染安全常量；组件自行读取语义变量，宿主常用引用使用 GAME_UI_TOKENS。';
      action ??=
        '移出根入口：此组件、组合或支持类型没有已确认的产品调用，保留内部预览用途，不再构成公开接口。按组件选择指南使用对应基础组件。';
      return { ...item, action };
    });
}

export function renderMigration(current) {
  const rows = migrationRows(current);
  const propertyRows = JSON.parse(readFileSync('scripts/migration-3.0-changes.json', 'utf8'));
  const icons = JSON.parse(readFileSync('scripts/game-icons-source.json', 'utf8')).icons;
  return `---
id: REF-MIGRATION-3-0
title: UIKit 3.0 Migration
type: reference
status: active
canonical: true
owner: project
created: 2026-10-02
last_reviewed: 2026-10-07
domain: ui-components
tags:
  - migration
  - breaking-change
pinned: false
related:
  - PLAN-UIKIT-3-RESTRUCTURE
  - REF-PUBLIC-API-INVENTORY
---

# 升级到 UIKit 3.0

本页对应3.0.0-rc.1及之后候选版的主动升级，不是发布成功公告。预发布通道next，稳定latest保持2.14.0；以npm标签及最终回执确认可用性。产品保持原有精确版本时不受影响。
不保留兼容层；先迁移源码和样式，再升级产品依赖。本仓库不替产品改代码。

3.0.0-rc.2 修正原生按钮属性转发：ComponentProps<'button'> 可传给 GameButton / GameIconButton，显式提供 children、游戏含义与 ref。无需在应用侧丢弃 React 的 rel 元数据或用类型断言绕过；只有 href 才生成链接，target / download 仍不能单独附在按钮上。已有页面不需要改变外观或液体配置。

<!-- Generated by pnpm api:inventory. Edit scripts/lib/api-migration.mjs and scripts/migration-3.0-changes.json, not these rows. -->

根入口从 295 个名字收窄到 ${current.length} 个；下表逐一覆盖 ${rows.length} 个删除、改名或移往子入口的名字。
参数、主题和样式另有 ${propertyRows.length} 条，合计 ${rows.length + propertyRows.length} 条。仍保留的名字不代表所有参数保持不变，务必同时检查第二张表。

## 公开名字的逐项变化

| 旧名字 | 原种类 | 迁移方法与原因 |
| --- | --- | --- |
${rows.map((row) => `| \`${row.name}\` | ${row.kind} | ${row.action} |`).join('\n')}

## 参数、主题与样式

| 旧用法 | 新用法与边界 |
| --- | --- |
${propertyRows.map((row) => `| ${row.before} | ${row.after} |`).join('\n')}

## 图标对应与新增名字

计划中标为41的旧名字逐项清单实际为35个；完整保留该清单，加13个名字，共48个，没有增加未约定图标。全部改成内联线条。需要彩色黏土插图的产品，升级前自行从旧版本把需要的图片复制到产品仓库；UIKit不再保留图片路径、复制工具或资源初始化兼容层。独立路径通过 icon-paths 子入口具名导入，只有名称查询组件需要完整的小型名称表。

| 图标名 | 新写法 | 独立数据导出 | Lucide 1.51.0 来源 |
| --- | --- | --- | --- |
${icons.map((icon) => '| ' + icon.name + ' | GameIcon icon="' + icon.name + '" | ' + icon.name.toUpperCase().replaceAll('-', '_') + '_ICON | ' + icon.upstream + ' |').join('\n')}

## 已知需要改深色判断的产品

University、Directing、FlowToFeel、SwimmerParty-Website、SwimmerAuthKit。
其中 SwimmerAuthKit 的 auth-captcha 使用 closest('[data-game-ui-theme="night"]') 判断深色，升级时必须改成 dark；否则品牌界面虽是深色，验证码仍会误判为浅色。
这是 Owner 提供的已知名单，不代表所有未知调用均已发现。运行包内 swimmer-ui-check 检查产品源码与样式，它会直接报告旧取值，不会替旧取值提供任何渲染支持。

## 特效与展厅

一般界面继续从包根导入。融化、弯曲与图像溶解改从 ./liquid-effects 导入 LiquidEffectsGroup，子项使用它的 Item；原有几何、共享预算、减弱动态和清理规则保持。
预览从 ./preview 导入，并显式加载 preview.css。默认入口和 ./liquid-presence 均不包含这两个可选部分的实现。

GameMaterialSwatches 已被 University 的 AvatarLab 用于头像配色，不是 OwnMySpace 独占功能；保留为通用控件，类型去掉地形命名。其余建造、施工和资产业务组件按 D1 删除。

## University 接入清单（由 Claude 在产品仓库实施）

1. University任务16改为接入3.0.0-rc.1。先在隔离环境安装经过SHA-256核对的候选包；npm发布回执成功后也可显式锁定该精确版本，不直接改生产版本。升级前复制仍需要的彩色插图，移除setClayAssetMode，成就页crown / trophy / medal改用对应GameIcon。
2. 明暗只用 light / dark。替换旧属性、CSS 选择器、dataset 和 closest 深色判断；同时核对 AuthKit 的 auth-captcha，不能只改页面的属性。
3. 学习者风格由产品选择：孩子用 pastel，大人用 grey；通过独立的 data-game-ui-style 设置，不把换风格做成重建编辑器或清空学习进度。
4. 主线下一步使用 GameButton variant="primary"，一屏最多一个潮汐 CTA；删除旧 surface / liquidFinish 参数，普通操作保持平面水滴。危险操作使用 danger，不用产品自绘红底覆盖。
5. 对照上面两张迁移表处理全部现有调用和类型，包括 AvatarLab 配色色块类型；按需加载液体存在、特效和展厅子入口，不再从主入口获取内部配方。
6. 跑产品完整门禁和实际课程/账号/编辑流程：主题与风格切换不丢输入、焦点、选区、选择和学习状态；检查验证码、375/390窄屏、禁用、键盘与减少动态。记录候选校验值、安装结果和失败项，交Owner决定产品是否上线；UIKit发布不代表University已验收。

## 其他已知受影响产品（只列迁移，不改产品仓库）

以下版本是任务书提供的影响基线，不表示本轮读取或验证了这些仓库的最新状态。

- Directing：任务书基线锁在2.13；升级时移除setClayAssetMode / setClayAssetBasePath，并按需要先复制旧彩色插图。
- SwimmerAuthKit 0.8.0-rc.0、SwimmerNerveKit 0.8.0：由各自负责人对rc.1重跑UIKit-3接入测试。>=2.6.1 <4这类peer范围默认不包含预发布，不能把安装警告当成已兼容。若已按Owner规则解耦UIKit，则在App注入的适配层验收，不为兼容rc重新增加Kit之间的依赖。
- SwimmerParty-Website：使用四个表面token、现成client入口、LiquidPopover及路由注入按钮；确认等价后删除产品重复的表面色、客户端导出层、自拼液体面板与跳转按钮。

本仓库只证明候选包级门禁与隔离Next消费。真实账号、作品、课程、编辑器及部署验收仍由各产品负责。
`;
}
