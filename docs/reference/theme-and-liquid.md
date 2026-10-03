---
id: REF-DESIGN-SYSTEM-GUIDE
title: Themes and Liquid
type: reference
status: active
canonical: true
owner: h
created: 2026-07-03
last_reviewed: 2026-10-02
domain: ui-components
tags:
  - uikit
  - reference
pinned: true
related:
  - REF-COMPONENT-SELECTION-GUIDE
  - REF-DESIGN-TOKENS
  - REF-MIGRATION-3-0
---

# 主题与液体

## 品牌与边界

Swimmer 的界面有触感、轻快、可靠。能按的东西是水滴，按下只变背景；只用来看的东西也是水滴，但静止不动。液体只给主按钮、液体面板、涟、进度条的液面四处。LiquidFill仍是配色数据，不是额外一种控件。

组件拥有原生交互和外观，产品拥有页面、权限、文案、任务、保存与支付。一次动画结束不能证明业务完成，也不能替用户点击。图标使用继承文字颜色的内联 SVG 线条，不恢复普通按钮的厚底边。

选组件看[选择指南](component-selection-guide.md)，具体值与覆写看[设计 token](design-tokens.md)，升级看[迁移表](migration-3.0.md)。本文是当前外观与液体边界，不再定义第二份发布进度。

## 两条独立的轴

```tsx
<section data-game-ui-theme="dark" data-game-ui-style="pastel">
  <GameButton>查看详情</GameButton>
  <GameButton variant="primary">继续下一步</GameButton>
</section>
```

明暗为 light / dark，省略为 light；风格为 candy、pastel、mist、grey、outline、ink，省略为 pastel。两者可以分开嵌套，局部 light 可恢复浅色。切换属性不重建原生控件，不清空输入、选区或焦点。University 的孩子/大人风格选择属于产品，UIKit 不判断年龄。

| 风格 | 平时 | 选中 | 有含义的颜色 |
| --- | --- | --- | --- |
| candy 彩色 | 纸色和细边 | 明亮色块 | 明亮色块 |
| pastel 淡彩 | 淡色块、无边 | 明亮色块 | 明亮色块 |
| mist 雾色 | 纸色和细边 | 灰调色块 | 灰调色块 |
| grey 灰阶 | 灰块、无边 | 墨色/纸色反转 | 深一档灰 |
| outline 包边 | 普通底色和淡边 | 墨色边、略深的底 | 不带色相 |
| ink 黑白包边 | 普通底色和实边 | 墨色/纸色反转 | 不带色相 |

选中一律加对勾，不鼓起、不扩大；一列选项两端保持对齐。支持 hue 的控件可选 coral、sun、leaf、sky、grape、pink；组件只读取语义变量，不按风格名分叉。

**危险操作是去色规则的唯一例外。** 六套 danger 都保留本风格的平时底色，只用对应明暗的 danger-ink 红字；outline / ink 再加红边，不用危险红底。success 等语气在灰阶和两套包边仍不恢复色相。禁用保持禁用态，不发出可点击邀请。这个取舍来自 Owner 委托 Claude 的 S4 评审补充。

## 平面水滴

[DropletSurface](../../src/controls/DropletSurface/README.md) 是内部的一个绘制原件，不是第二个交互控件。沿圆角矩形法线叠加两组整数频率缓波，再生成闭合三次贝塞尔路径。实际缓波封顶 1.4px，长条行同值；SVG 描边不随缩放变粗。不使用液体阈值或位移滤镜画细边。

按下只改变装饰背景的横纵比例、缓波与相位；文字、原生点击区域和选择状态保持不动。松开回弹后停止更新，没有待机时钟。取消事件、失焦、禁用和卸载都能清理；系统减少动态或 static 时不动。输入框只换边和底色，不跟着按压变形。普通控件没有投影、渐变、高光或底唇。

开关轨道、圆点取自同一风格的语义颜色；开关状态同时通过圆点位置、对勾和 aria-checked 表达，不只依靠颜色。

## 静止展示与有限的进度动效

GameBadge复用同一个路径原件，缓波上限1px，高24px、横向10px、字号12px/600。GameToast、GameCallout和GameTooltip背景缓波上限1.4px，不响应按压，没有入场移动或待机循环。文字布局、提示描述和status/alert语义保留；tone读取现有风格语义，灰阶/两种包边去色，危险红字例外。

GameProgress轨道是10px高的静止水滴，取surface-sunken；液面固定为潮汐。右缘用SVG弯月形路径，数值改变时最多600ms轻晃，然后完全停止绘制。只有数值/尺寸改变才更新，没有液体滤镜、预算租约或待机纹理。减少动态直接到位，隐藏页面停止；无论动画在哪一帧，progressbar报告的都是宿主当前真实数值，不靠动画宣布完成。旧tone和普通矩形填充被删除。

## 唯一主操作

GameButton variant="primary" 自动使用潮汐液体，**一屏最多一个 CTA**。它用于开始、确认、继续、收下或付款，不用来表示某一项被选中；普通动作仍用默认 secondary。表单提交显式写 type="submit"。

CTA、涟与面板共用薄液体重量：blur 5、contrast 18、gloss 1.5、三瓣轮廓 3.5px、贴地阴影与 sheen 0.3。潮汐配色为 #22d3ee 到 #22bb91，文字为深墨色；值的权威来源是 token 与 [材质文件](../../src/liquid/material/weight.ts)，不要在产品复制参数表。

高级原件可显式设置 gloss、stroke、shadow，但没有第二套旧厚材质开关。多体为了桥接距离保留动作对应的 blur；set 可以变硬，其他命名形态只区别姿态和过渡，不创造另一套重量。

## 涟、锚点与内容面板

```tsx
import { LiquidPresence, LiquidReveal, LiquidAnchor } from '@pieai/swimmer-ui-kit/liquid-presence';
import '@pieai/swimmer-ui-kit/styles.css';
import '@pieai/swimmer-ui-kit/liquid-presence.css';

<LiquidPresence target={guide} guideContent={<p>这是你正在编辑的内容。</p>} />
<LiquidReveal source={launcherRef} revealKey={requestId}>
  <textarea aria-label="你的发现" />
</LiquidReveal>
```

target 的 key 代表一次新的人类请求；label 是可读说明，getRect 返回目标当前的真实矩形或 null，contextElement 提供真实滚动/遮挡和原生弹窗上下文。不要用模型猜坐标；换账号、作品、页面时由宿主撤销旧目标。onDismiss 只表示指示撤下，不连接取消任务、保存或付款。

guideContent 使用同一个 LiquidReveal，不是另外画的卡片。未提供时是短标签；提供后读者掌握节奏，不因读得慢而过期。guideSize="expanded" 适合有界的候选比较；编辑器旁可用 dismissOnTargetClick={false}，点回编辑器不丢草稿。互动内容处理自己的 Escape 和输入法组合，外部 Escape 仍可撤下指示。

LiquidReveal 的 source 是真实启动控件 ref；variant 为 content / input；revealKey 只在新请求时改变，不能用流式文字或时间戳反复重播。聚焦时立即保留可编辑内容，定位变化不重新隐藏文字。LiquidAnchor 用现有 Floating UI 定位临时内容，placement 默认 top-end，onBoundsChange 报告矩形或 null。原生 dialog 内保留同一顶层；其他模态遮挡、源消失时不留下不可见的可点内容。

portal 继承来源处的明暗、风格和实际 token，不通过修改整页主题来修补浮层。跨目标保留内容和焦点，已有面板与真实目标参与避让；不能据此声称会自动避开产品里的所有业务控件。宿主负责尺寸、备用位置、结束后的焦点和访问权限。

idleMotion 默认 still；显式 breathe 才有轻柔待机，宿主必须提供暂停。motionSpeed 范围 0.5–1.5、motionIntensity 0.25–1.25，只改变材质，不改变业务进度或指路时长。减少动态、禁用、页面隐藏、不可见或模态遮挡时暂停；恢复不从第一帧重演已交付的指示。

activity 来自真实观察；levelRef 只接已有媒体连接的真实音量，不采集麦克风，不伪造说话或任务状态。错误/未知仍需宿主可读解释。待机最多约 12 次绘制/秒，共用低频唤醒与预算，每次绘制后释放。普通控件没有这个待机循环。

## 高级原件与可选特效

LiquidSurface 画单体，LiquidGroup + LiquidGroup.Item 组合多体；liquidFormItem 提供动作姿态。LiquidFill 是 fill 参数的配色类型（颜色或 top/bottom/sheen 配色），不是另外一个需要挂载的 React 按钮。

SVG 装饰层不接收指针，内容保持真实 DOM。高级 Item 的 x/y/scale 可以同时移动内容和装饰；这与成品按钮“只变背景”不同，勿拿它包装普通导航。Morph 的 contentBlur 是显式的内容效果；需要清晰文字时设为 0，不能把整篇正文加入滤镜。

融化、弯曲与图像接触溶解只从可选入口导入：

```tsx
import { LiquidEffectsGroup } from '@pieai/swimmer-ui-kit/liquid-effects';

<LiquidEffectsGroup>
  <LiquidEffectsGroup.Item effect="melt" melt={{ mix: 1 }}>
    <img alt="第一张色板" src={firstImage} />
  </LiquidEffectsGroup.Item>
  <LiquidEffectsGroup.Item effect="melt" melt={{ mix: 1 }}>
    <img alt="第二张色板" src={secondImage} />
  </LiquidEffectsGroup.Item>
</LiquidEffectsGroup>
```

Melt 只取前两张图构成一对。dissolve 可以是 boolean、数值或选项对象，只给图像上遮罩，卸载必须还原图像；不要意外启用默认的内容模糊。Bend 跟随子内容的已渲染矩形，以速度弯曲边界；它的四个 --lg-bend-* 变量是高级装饰出口。Move 是组的 motion="follow"，不是一个 Item effect。

默认包及 liquid-presence 不含可选特效/展厅实现；四入口共用同一预算。预算默认最多两个活动组、单区域 480,000 CSS 像素，计算包含变形和滤镜外扩。用 setLiquidGooeyBudget 调整宿主策略，不为截图通过临时抬高预算；资源不足保留静态可读结果并释放活动资源。

waviness 是高级液体位移纹理，不用于平面水滴边。其实际量默认受短边 30% 限制并计入面积，观察属性 data-liquid-filter-area / data-liquid-feature-padding 可协助排查。组静止后休眠；图像遮罩卸载、StrictMode 重挂、页面隐藏都有独立回归测试。

完整参数看[公共接口清单](public-api-inventory.md)与其源码链接。上游版本、采纳/拒绝的原因和许可只在 [donor 索引](../../donors-individual.md)、锁文件与 NOTICE 维护，不把外部 checkout 变成运行时依赖。

## Next.js 与消费端边界

根入口、liquid-presence、liquid-effects、preview及其React共享分块的产物都保留use client。App Router的Server Component可以直接挂载GameButton、GameBadge，并把LiquidPopover的客户端组件引用交给宿主Client Component；事件、ref、受控状态和运行时函数仍在客户端编排，不把普通回调从服务端传过去。

styles.css与按需的liquid-presence.css在应用layout导入。纯图标路径入口icon-paths不依赖React，仍可在服务端读取；类型使用import type。不要给纯CSS或声明文件添加客户端指令，也不要为了绕开边界在产品复制一份UIKit导出层。

pnpm check:next-consumer <实际tgz> [证据目录] 会在临时App Router项目安装该包，执行Next构建、启动、真实浏览器水合、原生/Next Link、液体面板焦点与窄屏减少动态检查。它不进普通pnpm test，也不会修改产品仓库；失败回执不会沿用上次的绿色状态。

## 验收入口

pnpm verify 检查类型、代码、格式、API、单元/浏览器/Storybook、样式、十二配色块和构建；pnpm docs:check 检查当前文档。pnpm check:themes 使用真实编译后 CSS 和浏览器计算配色，不只比较一份手写颜色表。普通控件固定点击框、危险红字、开关状态与边缘原件各有浏览器测试。

视觉图和复验日志由[当前工作索引](execution/current-work.md)定位。截图/模拟设备不是实机验收，代码提交不是 npm 发布。
