---
id: REF-COMPONENT-SELECTION-GUIDE
title: Component Selection Guide
type: reference
status: active
canonical: true
owner: project
created: 2026-09-11
last_reviewed: 2026-10-10
domain: product
tags:
  - components
  - discovery
  - liquid
pinned: true
related:
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-MIGRATION-3-0
  - REF-PUBLIC-API-INVENTORY
---

# 我该用哪个组件？

本指南对应 4.0.0-alpha.3 的当前包契约；版本与发布事实以[当前工作](execution/current-work.md)为准，不是发布成功公告。升级产品前先读[逐项迁移表](migration-3.0.md)，显式选择精确版本；不让现有产品自动跟随 main，也不把 `next` 当成稳定 `latest`。

## 先按任务选择

| 要完成什么 | 使用什么 | 边界 |
| --- | --- | --- |
| 开始、保存、继续、确认 | Button | 主操作 variant="primary"；提交表单明确写 type="submit"，默认只是按钮。 |
| 只有图标的动作 | IconButton | label 是可访问名称，不能只靠提示框。 |
| 单行、长文、勾选、固定下拉 | Field + Input / TextArea / Checkbox / Select | 保持原生输入、表单重置和焦点语义；Select 不是搜索框。 |
| 开关、数值、分段与页签 | Toggle / Slider / SegmentedControl / Tabs | 产品拥有值；Tabs 由产品连到相应 tabpanel。 |
| 验证码、独立列表动作 | OtpInput / ListRow | 验证请求由 AuthKit/产品拥有；列表右侧动作与选择是兄弟按钮。 |
| 一块信息、折叠信息、阻断背景的对话框 | Panel / CollapsiblePanel / Modal | Dialog 是内联对话内容，不是模态框；编辑表单跨关闭保留时用 keepMounted。 |
| 空状态、通知、进度、简短解释 | EmptyState / Toast / Callout / Progress / HelpTip | 进度必须真实；Toast 不是队列服务，必要错误不能藏进 HelpTip。 |
| 解释一个操作，需要标题、短句或一段演示 | HelpCard | 悬停、聚焦或点按后出现；可省略。必要信息、错误和价格不放进卡片，见下节。 |
| 工具窗口壳和六页页面骨架 | Shell + PageSurface | Shell 只提供平台/响应式槽位；PageSurface 只提供标题、内容和动作槽，不包含路由、数据或业务状态。 |
| 游戏外壳和 HUD 槽位 | Shell / HudActions / FactList | 不包含场景、持久化、资产业务和建造队列。 |
| 头像、配色、收集卡、开屏 | Avatar / MaterialSwatches / CollectibleCard / Splash | 产品负责内容、稀有度、加载状态；配色色块也用于头像，不依赖地形工具。 |
| 账号菜单 | AccountMenu | 产品提供用户、产品列表和本站内容；登录、退出由产品或 AuthKit 执行，组件不联网。从 **@pieai/swimmer-ui-kit/liquid-presence** 导入，并同时引入 liquid-presence.css。 |
| 图标 | Icon / GAME_ICON_NAMES | 内联线条，跟随文字颜色，不复制素材或初始化路径。 |

## 帮助提示怎么选

帮助分四级，由轻到重，按需要逐级升级。UIKit 提供位置、动效、触摸、键盘、减少动态与无障碍的框架；产品提供文字和演示。

| 级别 | 组件 | 什么时候用 |
| --- | --- | --- |
| 1 | `Tooltip` | 一行补充名称或说明，触发器本身已经可聚焦。 |
| 2 | `HelpCard` | 解释一个操作：悬停、聚焦或点按后出现一个标题、一到三行正文，可选一段短演示和“完整指南”链接。 |
| 3 | `FirstSessionOnboarding` | 首次进入的有限引导；是否出现、何时关闭和是否记录由宿主决定。 |
| 4 | 产品自己的指南页 | 完整教程、长流程和检索，不在 UIKit 内。 |

不要用帮助卡承载下列内容：必要信息、错误、费用和价格必须常驻可见；需要填写、确认或付款的操作不放进卡片；卡片不是某件事的唯一说明来源。

## 液体、可选特效和预览的入口

普通界面从 @pieai/swimmer-ui-kit 导入成品控件，样式在应用入口只引一次 styles.css。
3.0 的普通控件共用二维水滴，只有 Button variant="primary" 是潮汐液体 CTA。**一屏最多一个 CTA**：它只用于开始、确定、下一步、收下或付款。不要把 primary 当成选中态；选中用对应选择控件或 aria-pressed，显示对勾且不扩大。

单体装饰用 LiquidSurface，多体关系用 LiquidGroup + liquidFormItem。它们不替代真实 DOM 控件。
宿主预算只通过 setLiquidGooeyBudget 设置，不依赖内部计数器、默认常量或整张配方表。

4.0.0-alpha.3 不发布高级图像特效 JS leaf；本仓库仍保留相关源码供内部故事和测试，但产品不能把这些实现当成当前包依赖。普通液体只使用根入口公开的 `LiquidSurface` / `LiquidGroup`，测量、时钟、预算与减少动态仍由同一引擎负责。

涟与它的面板、锚点继续从 **@pieai/swimmer-ui-kit/liquid-presence** 导入；还需显式引入 liquid-presence.css。账号菜单 AccountMenu 不在根入口：它的面板是 LiquidPopover，与涟同属这一入口，也要引入同一份 liquid-presence.css。
它只画身体与手势，不调用模型，不开启麦克风，不替用户点击目标。

4.0.0-alpha.3 不发布展厅 JS leaf；`preview.css` 因仍有外部消费者继续保留，但它不是可运行的组件入口。默认控件包和涟的入口都不会带上展厅或高级图像特效代码。

## 深色主题与迁移

风格与明暗独立：data-game-ui-style 可为 candy、pastel、mist、grey、outline、ink，省略默认 pastel；data-game-ui-theme 为 light 或 dark。支持 hue 的控件接受 coral、sun、leaf、sky、grape、pink，组件不按风格分支。输入框只换边与底色，不做按压形变。产品源码与样式可运行 swimmer-ui-check 发现旧取值；检查报错不会提供兼容渲染。
拆分、删除和改名逐条见 [迁移表](migration-3.0.md)。完整的当前名字与源码链接在 [公开接口清单](public-api-inventory.md)，以它为准，不从旧示例猜哪些内部名字仍然公开。

常规布局、原生语义和工程边界在 [设计系统指南](theme-and-liquid.md)；详细的材质、按压和主题边界只在设计指南维护，不在产品仓库复制一套控件。

## 使用时最容易弄错的边界

OtpInput 只接受数字验证码，全角数字会规范化；受控 value / onChange，填满后 onComplete 不代表验证成功。初始值、宿主重置、重复完整粘贴不重复提交，输入法组合期间不触发完成。宿主负责发送、验证、限流与错误信息；字母恢复码用普通输入。详细参数看 [OtpInput](../../src/controls/OtpInput/README.md)。

Tabs 用 id 与每项 panelId 关联真实 tabpanel。横向处理左右键，vertical 只处理上下键，Home/End 跳首尾；产品负责窄屏切换布局。ListRow 左侧只放展示内容，交互放 actions，选择与右侧操作是兄弟按钮；危险确认仍归宿主。

Modal 是原生 dialog，可用 position="bottom" 做底部面板；Dialog 只是内联内容，不提供模态阻断。HelpTip 用于可省略的短解释，支持触摸、焦点与 Escape，不把必须知道的错误/费用藏进去，也不放交互表单。Tooltip 的直接孩子须可聚焦，重要信息不能只靠悬停看到；靠近视口边缘时用 `align="start"` 或 `"end"` 让气泡向有空间的一侧展开，`placement="bottom"` 放到下方。

CollectibleCard 处理翻面、指针倾斜与减少动态；CollectibleCardSlot 是空位。一个卡册只创建一个 useGameCardOrientation，用户直接交互后调用 enable，tilt 只传给当前卡；关闭/卸载停止输入。enabled 不证明硬件已经给出样本，保留键盘与触摸后备操作。权限面板与实机表现由产品验证，不用模拟样本冒充。

Avatar 的 surface="plaque" 只表示静态头像相框，不用于普通按钮。MaterialSwatches 保留为头像/通用配色选择，不拥有地形数据。Shell 的 sidebar、windowBar、mobileNav、hud、sidePanel、movementPad、bottomBar、overlay、assetLibrary 都是宿主提供的槽，不是资源服务；PageSurface 的 aside、primaryAction、footer 也不拥有业务状态。

声音默认关闭。Button 的 sound 是显式选择；playGameInteractionSound、playGameCardRevealSound 只在已允许的用户交互里发声，音量、暂停和偏好由宿主负责。共享上下文适配用 playGameInteractionSoundForContext，不复制音频引擎。

## 全部公开值：用途与边界

这里每个名字都有一条用途说明；参数类型以生成的接口清单为准。自动检查会拒绝缺行，不用在名字表里猜用法。

| 公开值 | 什么时候用，什么时候不用 |
| --- | --- |
| `Button` | 有文字的动作；primary 只给唯一下一步，表单提交明确写 type。 |
| `Checkbox` | 可独立勾选的原生表单项，不冒充互斥页签。 |
| `Field` | 给输入组织标签、说明和错误；验证规则仍由宿主负责。 |
| `IconButton` | 只有图标的动作，必须提供 label；图案不能代替名称。 |
| `Input` | 单行原生输入，保留输入法、焦点与表单语义。 |
| `LanguageMenu` | 展示宿主提供的语言选项，只报告选择，不安装语言引擎。 |
| `ListRow` | 列表选择与右侧独立动作；不要在左侧内容内嵌套按钮。 |
| `OtpInput` | 数字验证码输入，不处理发送、认证和限流。 |
| `SegmentedControl` | 少量互斥选项，值归宿主管理。 |
| `Select` | 原生下拉选项，不提供异步搜索。 |
| `Slider` | 有边界的连续数值输入，宿主给清楚单位。 |
| `Tabs` | 切换内容页签，宿主连好真实 tabpanel。 |
| `TextArea` | 多行原生编辑，不因换主题或语言重建。 |
| `Toggle` | 即时开关，同步 checked 和对应功能状态。 |
| `MaterialSwatches` | 通用颜色或图案选择，不绑定地形、资产或头像数据。 |
| `Badge` | 简短状态或标记，不是可点击按钮。 |
| `Callout` | 正文旁的可读提醒，重要错误应持续可见。 |
| `EmptyState` | 解释当前没有内容的原因，并提供宿主动作。 |
| `HelpTip` | 可省略的短解释，不放必要费用或交互表单。 |
| `HelpCard` | 悬停、聚焦或点按后打开的小卡片：一个标题、一到三行正文、可选循环短演示（减少动态时不自动播放）和完整指南链接；必要信息、错误和价格不放进去，需要操作的内容也不放进去。 |
| `LoadingState` | 表示真实加载中，不承诺完成时间。 |
| `Progress` | 10px水滴轨道与潮汐液面；数值变化晃动600ms后静止，不占滤镜预算。保留原生progressbar语义，不伪造业务完成。 |
| `Prompt` | 短操作提示，不代替实际输入控件。 |
| `Toast` | 单条短通知；排队、持久化和重要错误归宿主。 |
| `Tooltip` | 可聚焦目标的补充说明，不作为唯一可访问名称；`align`（center / start / end）与 `placement`（top / bottom）调整位置，标签中的换行保留。 |
| `playGameCardRevealSound` | 明确允许的揭卡交互音效，默认不自动发声。 |
| `playGameInteractionSound` | 主动交互中的提示音，偏好与音量由产品决定。 |
| `playGameInteractionSoundForContext` | 接宿主已有音频上下文，不另起音频引擎。 |
| `CollapsiblePanel` | 收起一块信息；需要持久编辑时保持内容身份。 |
| `Dialog` | 内联对话内容，不会阻断背景或创建模态层。 |
| `HistoryPanel` | 展示宿主提供的历史，不是历史存储服务。 |
| `HudActions` | 排列游戏界面工具按钮，不拥有场景和快捷键逻辑。 |
| `Modal` | 原生模态 dialog；编辑跨关闭保留用 keepMounted。 |
| `Panel` | 组织一块信息与标题，不加业务控制器。 |
| `PageSurface` | 工具页的无状态骨架：标题区、主动作、内容、可选侧栏和底部槽；宿主提供路由、数据和文案。 |
| `Shell` | 安排场景或工具页，以及侧栏、窗口栏、移动导航和 HUD 槽位；平台语气与减少动态必须显式传入。 |
| `FirstSessionOnboarding` | 首次进入的有限引导；是否出现和持久记录由宿主决定。 |
| `Avatar` | 展示头像；静态 plaque 相框不用于普通控件。 |
| `CollectibleCard` | 收藏卡片翻面与倾斜，不决定获得规则和稀有度。 |
| `useGameCardOrientation` | 卡册共享的显式设备倾斜输入，不把 enabled 当成已收到硬件样本。 |
| `CollectibleCardSlot` | 收藏卡空位，不表示已经获得奖励。 |
| `FactList` | 显示简短事实和值，数据由宿主提供。 |
| `MovementPad` | 提供方向输入界面，位移和碰撞仍归游戏。 |
| `RadialMenu` | 少量空间动作入口，选择不等于授权执行。 |
| `Splash` | 显示真实启动阶段，关闭时机不用假计时器冒充加载完成。 |
| `StageTile` | 展示关卡入口及选择，进度与解锁归产品。 |
| `setLiquidGooeyBudget` | 配置宿主液体资源上限，不为测试通过临时抬高预算。 |
| `liquidFormItem` | 为高级液体组合提供动作姿态，不导出整套内部配方表。 |
| `LiquidGroup` | 多体装饰的共同几何和预算，不代替真实 DOM 控件。 |
| `LiquidSurface` | 单体装饰，不包裹每个普通导航制造液体按钮。 |
| `GAME_UI_TARGETS` | 引用品牌触控目标尺寸约定，实际触达仍需产品验收。 |
| `GAME_UI_THEME_CONTRACT` | 查明主题公开属性和值，不创建第二套主题系统。 |
| `GAME_UI_TOKENS` | 在跨栈代码引用语义 CSS 变量，不复制颜色原值。 |
| `GAME_UI_STYLES` | 枚举官方六种风格，具体配色仍由 token 块决定。 |
| `GAME_UI_DEFAULT_STYLE` | 引用缺省风格，不在每个产品写另一份默认值。 |

| `Icon` | 内联 SVG 图标；label 表示可朗读含义，省略时作为装饰。默认 md20，另有 sm16、lg24。 |
| `GAME_ICON_NAMES` | 展厅或动态菜单需要的名称清单，不是第二套组件。 |

独立具名路径 JS leaf 在 4.0.0-alpha.3 不再公开；用字符串名的 `Icon` 继续使用本包的小型名称表。图标来源与许可证见 [donor 索引](../../donors-individual.md) 和 `NOTICE`。

## 链接、小号与液体弹出面板

Button / IconButton 有 href 时输出真正的链接；target、rel、download 保留原生行为。
路由集成用 linkComponent，它接收 href、className、children 和原生 anchor ref。禁用链接没有 href，不参与聚焦或激活；不渲染路由组件，不用假地址代替禁用。
链接型 primary 仍受“一屏最多一个 CTA”约束，只用于开始、收下类主操作，不把全部导航变成液体。默认 md 至少44px；显式 sm 高32px、文字14px、横向12px；图标sm是32×32，产品需为触屏保留足够可点空间。

LiquidPopover 从 liquid-presence 入口导入；open/onOpenChange受控、source为真实启动ref、title提供名称。默认440px/bottom-end；窄屏优先top、两侧各12px。打开聚焦标题，Esc/外点关闭后回到启动控件；它不是模态框，不阻断背景。每次打开有新revealKey，内容更新不重播；超预算静态显示。面板内使用secondary，因为面板本身已经是液体。

## 无障碍基线

保留可访问名字、原生焦点环、禁用语义与表单重置。默认触控目标至少 44px；compact 是显式密度选择，产品仍需验收其触达性。选中不仅靠颜色，强制配色使用系统边和状态；减少动态不取消正常操作。换语言/风格不重新挂载编辑内容。

Storybook 的无障碍测试直接报错；只有明确的示例结构例外才做最小范围说明，不能关闭整套测试。视觉和真实交互还需看运行结果；测试通过不等于产品接入或发布完成。
