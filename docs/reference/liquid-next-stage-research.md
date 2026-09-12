---
id: REF-LIQUID-NEXT-STAGE-RESEARCH
title: Liquid Catalog and Finish Research
type: reference
status: active
canonical: true
owner: project
created: 2026-09-11
last_reviewed: 2026-09-12
domain: product
tags:
  - research
  - liquid
  - discovery
  - upstream
pinned: false
related:
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-COMPONENT-SELECTION-GUIDE
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
---

# 下一阶段：液体分类、可见目录与美学升级调查

**生命周期说明（2.6实施阶段补记）：** 下文保留2.5研究时的判断与候选，不是当前
功能清单。用户随后授权实现：统一liquidFinish、六类液体控件、原生GameSelect、
按用途的展厅和共享Storybook示例已进入2.6实现；现行契约只在
[设计指南](design-system-guide.md#两种液体材质与成品控件26)维护。
原生select代替复杂自绘listbox；图像预降采样/接缝优化、通用combobox和Toast队列
仍未实施，不把候选表当作已交付能力。University未修改。

**原始研究状态：** 2.5.0只交付发现性、全宽CTA和资料整理。当时下面均是提案。

## 结论

下一阶段最值得做的不是继续堆物理参数，而是做一个**初学者能指着选的材料与
控件展厅**。先把同一种控件的哑光液体和高光液体并排，再显示交互状态；
按钮、开关、下拉选择是“它做什么”，press、merge 是“它怎样动”。
把这两套分类混在一起，会让十二个形态看起来像十二个成品组件。

建议保留一个液体引擎、两个明确 finish 配方，不维护两套几何/生命周期实现。
这不是对当前美学效果的降级：同一轮廓、同一动作下比较材质，才知道高光是否真的
改善识别，而不是被不同尺寸、颜色或夸张动画蒙混过去。

## 一、把四个维度分开

| 维度 | 回答的问题 | 当前情况 / 下一步建议 |
| --- | --- | --- |
| 控件语义 | 按钮、输入、进度还是选择器？ | 按任务选现成控件，缺完整语义才补控件 |
| 表面材质 | 普通表面、哑光液体还是高光液体？ | 两种液体 finish 尚无统一的公开选择入口；建议建立有名配方 |
| 动作形态 | 按压、跟随、融合还是排空？ | 既有十二形态及 kind；从产品意图选择，不扩张成几十个近义名字 |
| 主题与状态 | day/night、可用/禁用、焦点/按下？ | 同一组件复用主题与状态矩阵，不为每个组合创建新组件 |

**命名提案（未实现）**：未来讨论 `liquidFinish="matte" | "glossy"` 或同等清晰的
语义接口。不要现在把这个属性写进消费方代码；最终位置须评审 GameButton、
LiquidSurface、LiquidGroup 的一致性。现有默认外观必须保留，不能借增加选择项
悄悄让所有旧按钮变哑光。

`surface="flat"` 今天表示普通 GameButton，不是 matte-liquid。
`LiquidMetalButton` 是另一条金属效果路线，不能冒充 glossy-liquid。
高光液体也不必上 WebGL：SVG 的 specular lighting 可以用轮廓 alpha 作为高度信息；
本库已有 typed gloss，先验证当前链，勿再造一个 canvas 引擎。[S4]

## 二、展厅应怎么打开

建议保持一个品牌站入口，明确两个视图：**“我要选组件”** 与 **“我要研究材料”**。
README 仍是路由；设计系统规则只在设计指南；安装、迁移只在 playbook；
Storybook 是可运行的组件状态与代码来源。不要增加第四本同样讲安装和 token 的手册。

组件页第一屏先显示“普通主按钮 / 哑光液体主按钮 / 高光液体主按钮”，每格都能
点击、键盘操作，旁边有适用场景和当前实现状态。默认不展开十几个旋钮。
点开卡片后才显示：最小可复制代码、常见状态、尺寸/主题、限制与高级参数。

材料页保留形态实验，但必须在每个示例上写明“这是材料行为，不是成品控件”。
group 形态直接展示两个参与者与变化前后，不让新人把 merge 放到一个身体上猜。
每张卡有稳定 ID 和可分享链接，便于用户说“高光按钮 pressed 的高光太白”。
中英名称并列；记录反馈时带上组件、finish、主题、状态、尺寸和 reduced-motion，
而不是只发一张脱离环境的截图。

实现优先复用现有 Storybook：用 tags 做用途/成熟度筛选，用 CSF stories、
Autodocs 和 MDX 的 Canvas/Controls/Source 组合展示同一份样例；不要在官网重新
手写一套看似相同的按钮逻辑。[S1][S2] 本仓已装 Storybook，调查不要求升级其版本。
未来重排目录时保留现有 story ID 或给出跳转，否则已有验收链接会断。

### 建议的可见覆盖表

以下为本轮源码审阅下的方向，不代表全部格子已经实现或通过视觉验收。

| 品类 | 当前可用基础 | 下一阶段第一步 | 不应假装已完成 |
| --- | --- | --- | --- |
| 主按钮 / CTA | GameButton 已有 liquid；2.5 增 fullWidth | 两 finish、各语义色、按压/禁用/焦点对照 | 两套 finish 的统一 API |
| 图标按钮 | GameIconButton 普通控件 | 先检验小尺寸轮廓和可访问名称，决定是否值得液体化 | 不是套一个球就完成图标语义 |
| 分段选择 | GameSegmentedControl 已有液体跟随 | 控制跟随强度，比较两个 finish | 不再嵌套第二个 LiquidGroup |
| 进度 / 加载 | GameProgress 已有液体前沿；其他 loading 组件存在 | 确定有限进度与不定加载的不同语义，清楚展示 reduced-motion | `fill` 形态不等于完整进度控件 |
| 开关 / 滑杆 / 勾选 | GameToggle / GameSlider / GameCheckbox | 先补键盘、值、禁用和 day/night 可见状态，再评估液体表面 | 不能只做漂亮但不可操作的开关 |
| 下拉选择 | 本库尚无完整公开 GameSelect / GameCombobox | 简单选择优先原生 select；确需可搜索列表时评估成熟 headless 实现 | 液体外壳不自动获得焦点、键盘、表单语义 |
| 菜单 / Popover | 有局部菜单组件，不是完整通用套件 | 先证明触发、Escape、焦点归还、碰撞定位、滚动和 portal | 不以一个 merge 演示宣称通用下拉完成 |
| 提示 / Toast | 有展示组件 | 明确静态展示和有队列/去重/时序/公告的服务层不同 | July 计划中的 Toast 队列没有被本轮补完 |
| 卡片 / 面板 / 模态 | 现有 GamePanel/WindowPanel/GameModal | 默认保持安静；仅明确状态变化使用局部液体 | 不把长文或整个 modal 背景变成常驻动画 |
| 图像融合 / 拖动 | Morph/Bend/Melt/dissolve 原语 | 单独的效果实验区和成本标签 | 不是面向每一个普通按钮的前置依赖 |

Select 与 Combobox 不是可随意互换的名字。Base UI 官方明确区分：不带过滤输入
的选择使用 Select，选项多且需过滤才使用 Combobox；两者都必须正确命名。[S3]
“成熟包优先”不等于现在静默加依赖。本库的零运行时依赖合同要保住；复杂控件
真的超出原生能力时，先单独决定依赖/可选适配包边界，再采用上游实现，不能为了
表面保持零依赖而复制一大份失去维护关系的状态机。

## 三、两种材质的美学标准

**哑光液体**：轮廓和动作负责“软”；反光少、亮度变化小；投影保持接地感，不靠
一条硬白边伪装厚度。**高光液体**：体积和接触阴影负责“立体”；高光沿同一形体，
不能脱离身体或在按压时把字吃掉。它不是所有颜色上都加同一条白色渐变。

A/B 时固定文字、尺寸、轮廓和动作，只改变 finish。逐一观察米白底、深色底、
主色/次色/危险色、DPR1 与 DPR2；对细进度条的参数不能直接照搬大胶囊。
保持高光、外轮廓、投影的光照方向一致；在静态轮廓都看不清时，增加摇晃不是修复。
字体、字号层级、图标家族、间距与主题要一起检查，不把“美学升级”等同于加阴影。

验收至少分四栏记录：轮廓是否清楚、文字是否清楚、状态是否可辨、材质是否一致。
自动测试能检验结构与规则，不能替代用户对这两个 finish 的审美选择；需要用户
确认同场景 A/B，而不是由开发者拿动效最漂亮的一帧宣布升级成功。

保留真实 DOM 的标签、焦点环和点击区域。触屏按品牌现有标准至少 44px；不要
错误地把 WCAG 2.2 AA 的 24px 最低目标（含例外）说成 44px，44px 对应增强标准。
减少动效、强制配色、200% 文本、长中文和键盘状态必须在展厅能看到。[S5][S6]
本轮桌面按钮约40px与 coarse-pointer 下44px是现有响应式合同，不为了截图整齐
改变默认尺寸。

## 四、donor 还能借鉴什么

### 已核实的边界

只读 checkout 为 `~/PieAI/_donors-individual/for_SwimmerUIKit`，HEAD 与 lock 均是
`422180dd7a5ac646c85deedc65500c4a74339127`；本轮 `git ls-remote origin HEAD` 也返回
同一 SHA。它是这一时刻的快照，不保证未来仍是最新。没有 pull、安装、编辑或改 pin。
包内 `packages/liquid-gooey/LICENSE` 已核实 MIT，署名与 NOTICE 继续保留。[S7]

公开仓库现用 Libraries.dev 名称，展示站把 Gooey、Metal 等分成不同家族；其
“可复制给编码 agent 的安装与配置”和普通 playground / 更深 Studio 的分层，
值得借鉴入口设计，不需要抄它的品牌视觉或商业页面。[S8][S9]
公开 npm 包、商业 Studio、预设或服务不是同一授权对象；本轮没有访问付费内容，
也不把官网写着 MIT 当作所有素材可任意复制的证明。

采纳/未采纳/拒绝的权威账本仍是根目录 `donors-individual.md` 与配套 lock。
下表是**下一轮调查排序**，不是向账本偷偷增加已采纳项目。

| 候选 | 已读证据 | 价值判断与推荐 | 进入产品前的闸门 |
| --- | --- | --- | --- |
| 图像预降采样 `downscaleHref` | donor `observer.ts:518–550`，按显示尺寸约3倍生成图像，失败回原图 | 优先性能实验；面向大图小显示的图像效果，不是所有 CTA 的必需品 | CORS/taint 回退、resize/src/srcset、DPR、解码失败、缓存与内存清理；WebKit真机实测，不引用注释当实测收益 |
| image Melt 的轮廓裁剪 / 接缝 mask | donor `imageMelt.tsx:250–333`，marble 与 mshape 合成、柔化 mask | 优先正确性对照；调查已有本地改写和 donor 哪个在边缘、接缝更稳定 | alpha/luminance 模式、深浅图片、透明图、缩放裁切、减少动效与卸载清理 |
| `blobInset` / `bridgeGrow` | donor `LiquidItem.tsx:54–61`、observer 邻近计算 | 有图片边缘与接触包覆需求再做，不能为了参数齐全而加 | 不遮文字、不吃 hit target、不破滤镜面积预算，组合时无双层外壳 |
| Move/Bend 高级调参、dissolve image surface | donor公开类型/实现与本地账本中的未采纳项 | 先给具体产品场景；普通组件继续命名形态，不暴露全部 raw 参数 | 不能把已删除的无效 `effect="move"` 字面量直接恢复；评审 group/单体语义、成本和兼容路径 |
| donor 展示组织与代码复制 | 公开站家族入口、README 的 normalized knobs / advanced 分层 | 优先借鉴；对初学者价值高于再增加一种滤镜 | 示例必须来自当前包并能编译运行，不输出不存在的 API |

**保留本地方案**：当前预算、空闲休眠、几何轮廓、安全边缘、typed gloss 与测试
已经满足明确的项目约束。不整体搬 donor observer，不恢复不受预算约束的 raw
filter 字符串入口，不加静止时仍搅动的 ambient dissolve。donor 自己也有休眠
机制，不能把选择本地方案的理由编造成“上游永远不休眠”。本地更适合是对本库
合同的判断，不是宣称在所有设备上更快或在所有画面更美。

## 五、建议执行顺序与退出条件

**第一批：看得清。** 统一页面导航、四维词汇、可分享卡片、真实实现状态；
复用既有组件，先展示一组哑光/高光按钮对照供用户确认。没有确认，不全库换皮。

**第二批：补成套。** 先补已有高频控件的状态/主题/两 finish 覆盖，再补明确缺失
的选择类语义。每加一个品类必须有真实操作、源码、失败/禁用状态和测试，不能用
一张静态概念图充数。既有普通 clay、day/night、图标/字体也进入覆盖表，不被液体挤掉。

**第三批：有证据才借更多。** 将图像预降采样与接缝裁剪各做独立、可回滚实验，
固定输入/设备/预算，比较本地基线与 donor 改写。没有收益则保留现状并记录不采纳
理由，不为“用到更多 donor”而增加维护面。

每批都跑 `verify`、文档门、故事交互/axe、构建与消费样例；图库按主题、状态、
窄屏和 reduced-motion 取必要代表，不盲目生成所有笛卡尔组合。只让当前交互的
少数样例动起来，避免为了展示液体同时抢光共享预算。视觉判断与性能测量分开记录。

设计 token 跨工具交换可考虑 DTCG 2025.10，但当前 CSS 是权威，不为此次目录
整理新增编译链。该版本是稳定的 Community Group Report，**不是 W3C Standard**；
不要依据 `/drafts/` 页面建立生产管线。[S10]

## 六、尚未消除的不确定性

尚未做 matte/glossy 新 API 或新控件原型，也没有用户 A/B 审美结论；本轮没有
新做 Safari/Firefox/Android WebView/iOS 真机性能矩阵。downscaleHref 和接缝
裁剪的收益仍是假设，未发布到 kit。其他消费仓和外部引用者未完整扫描；旧教程
消费者版本表为历史。上游商业预设/Studio 与其他效果包不在本轮许可证审计范围。
这些是下一阶段的验证项，不是已经通过的检查。

## 资料来源（2026-09-11 查询；原始源码按 SHA 固定）

- [S1: Storybook tags](https://storybook.js.org/docs/writing-stories/tags)
- [S2: Storybook Doc Blocks](https://storybook.js.org/docs/writing-docs/doc-blocks)
- [S3: Base UI Select](https://base-ui.com/react/components/select) 与 [Combobox](https://base-ui.com/react/components/combobox)
- [S4: MDN feSpecularLighting](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpecularLighting)
- [S5: WCAG 2.2 target-size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [S6: WCAG target-size enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
- [S7: 固定 donor 源码](https://github.com/Jakubantalik/Libraries.dev/tree/422180dd7a5ac646c85deedc65500c4a74339127/packages/liquid-gooey)；本轮实际读取本地同 SHA 的 README、LICENSE、LiquidItem/observer/imageMelt
- [S8: 上游公开仓库](https://github.com/Jakubantalik/Libraries.dev)
- [S9: 上游展示入口](https://libraries.dev/)
- [S10: DTCG 2025.10 已发布规范](https://www.designtokens.org/tr/2025.10/format/)
