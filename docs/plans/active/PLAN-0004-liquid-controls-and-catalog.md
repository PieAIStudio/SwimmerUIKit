---
id: PLAN-0004
title: Liquid Controls and Beginner Catalog
type: plan
status: active
canonical: true
owner: project
created: 2026-09-12
last_reviewed: 2026-09-12
domain: product
tags:
  - liquid
  - catalog
  - accessibility
related:
  - REF-LIQUID-NEXT-STAGE-RESEARCH
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-USAGE-AND-UPGRADE-PLAYBOOK
---

# 液体控件与初学者展厅

## Frame 与授权

用户在 2.5.0 收尾后明确授权继续完成上一阶段调查指出的必要缺口，而非继续只交建议。
让下一次正确改动更容易：先选成品控件，直接比较哑光/高光、操作和复制代码；
实现者只有一个材质映射和一套几何/预算/时钟，不在每个产品重调液体。

本轮是单独命名的增量功能与展示改进，不伪称纯行为保持重构。
版本基线 main `4440e42`；接续时保留前一轮已写入但未提交的 2.6 改动，没有 reset。
只修改 SwimmerUIKit，不修改 University 或 donor。
保留根公开名字、包路径、旧默认值、十二形态和历史证据；不重构整个引擎。

## 本轮完成边界

- 一个可选 `liquidFinish` 词汇贯穿 LiquidGroup/LiquidSurface 和成品控件；
  哑光与高光复用现有 SVG 灯光，不换引擎、不添加环境动画，省略时保持旧外观。
- 液体主按钮、图标按钮、开关、分段选择、进度与原生选择器形成可用配套。
  补真实缺少的 GameSelect；补 slider 的 disabled/step/name 原生能力；
  普通文本、复选、反馈、模态等保持安静，不为数量把所有控件液体化。
- 首屏按任务选的可交互展厅：材料、主题、状态、中文与代码、分享定位；
  仅挂载所选示例，不让全站同时运行几十个液体实例。原全量参考页和液体形态页保留可达。
- Storybook 与展厅复用可运行示例；保留现有 story IDs。完整构建、类型、交互、无障碍、
  375px/明暗/减少动效/强制配色、兼容对照与实际 npm/站点发布。

## 选择与否决

原生 select 拥有键盘、表单、禁用、reset、optgroup 和手机系统菜单；只装配品牌表面。
不复制 headless 状态机，不把一个漂亮 div 称为完整 dropdown。
弹出的选项仍是系统菜单；搜索 combobox/虚拟列表没有真实场景，本轮不预装新依赖。
参考 React select、MDN select、WAI switch 与现有 Storybook Controls 文档。
来源与取舍在最终设计指南/调查记录中收敛。

donor 更多图像能力需要独立真实图片/设备收益证据。此轮不为“借得多”搬大图缓存、
observer 或付费预设；本地高光、几何、预算已有可复用实现。

## 验证与发布

基线 verify → 功能单测/浏览器回归 → 文档与导出检查 → 全量 verify、构建与包检查 →
真实展厅截图与操作 → 本仓提交、推送、Trusted Publishing → registry tarball 与线上页面核验。
修复故障，不通过跳过测试/改预算/关闭 a11y 让结果变绿。

## 状态

实现与本地验收完成，等待本仓提交、发布和线上核验。不能把 package.json 的 2.6.0
当作 npm 发布证明；发布完成后本记录移入 completed。

## 已完成的变更与契约

完成两种 finish、六类液体控件、12组真实示例、27个共享配方故事及组件目录。
普通输入/长文/复选/滑杆/反馈/模态不为数量液体化。GameSelect 的选项仍是原生菜单，
不是一个没有完整语义的自绘 dropdown。模板代码逐组合以真实 TypeScript API 编译。

首屏先看能操作的例子，再调参数；375px 使用同一目录的水平选择栏，不把12张导航卡
排在例子之前。Storybook Docs 只挂载一张可控 Canvas，所有命名故事仍可单独打开；
默认的 Stories 全量画布会同时占预算，因此未采用。两个材质共用灯光与几何，
不是复制两套组件。旧完整参考视图、hash 入口、十二形态和 story IDs 保留。

公共入口保留原272个名字，只增加 GameSelect、GameSelectProps、LiquidFinish，
合计275（122值/153类型）；原 exports map、ESM-only、零运行时依赖不变。
这是增量 minor，不是 public-contract 入口重构。默认普通/液体选择不随升级改变。

有意修复：液体真实按钮不再继承通用 CSS scale/hover 位移；static、右键、重复按键、
取消/丢失捕获的边缘；进度的无效数值与 ARIA 不一致；输入错误属性；禁用状态和
fieldset 继承禁用的装饰降级。WebKit 实测 pointerdown 后会让已键盘聚焦的按钮 blur，
不能把这一次失焦当作放开指针；窗口真正失活仍取消，不用强制 focus 掩盖差异。

## 本地证据与闸门

- 最终功能门 `pnpm verify`：51个测试文件、353项测试通过；含27个新增配方故事、
  8项选择/跨浏览器事件/禁用边缘回归，计数是当前总数，不累加历史结果。
- `pnpm build-storybook`、`pnpm build:site`、publint、attw 的 ESM-only profile通过。
  CSS构建零warning；API Extractor 的 TS5.9.3/项目TS6.0.3版本提示、Storybook大chunk
  与无MDX提示仍是工具链已知信息，不冒称全命令零warning。
- `pnpm check:catalog <origin> [chromium|firefox|webkit]` 是可重跑的验收入口。
  最终本地结果：Chromium31组、Firefox31组、WebKit29组；WebKit未运行forced-colors
  模拟，非Chromium未宣称系统剪贴板roundtrip。数字是各引擎场景数，不与353项测试相加。
  三引擎分别执行12组桌面与375px/夜间真实交互，检查首屏可见、宽度、材质切换、
  禁用、进度、表单值/重置、checkbox、键盘按钮、原生dialog的键盘打开/焦点归还。
  macOS不保证鼠标点击按钮获得焦点，因此没有用该假设断言 dialog 回到鼠标按钮。
- 主目录和材料实验页无预算不足警告，最多2组。复制成功与拒绝回退均有测试；
  WebKit/Firefox只验证拒绝回退，系统剪贴板roundtrip在Chromium验证。
  代表页面的200%根字号无横向溢出；这不冒充全部浏览器缩放/屏幕阅读器认证。
- 本地打包后的 Storybook Docs 实际打开，只有1张Canvas/1组液体，无pageerror或预算警告。
  localStorage被拒绝时仍能切换主题并将真实主题写入分享URL。
- 2.5.0 npm包与2.6源码在同坐标/同字体的普通/液体×明/暗四组静止截图做兼容对照；
  四组均逐字节相同；全部269张历史PNG也逐项与4440e42核对，路径和字节保持。
  按压行为属于已明确的修复，不要求错误的旧缩放继续像素相同。

详细日志与真实截图保存在 `.devspace-visual/liquid-2.6/` 和按浏览器/时间命名的
`liquid-catalog-*` 目录。旧失败结果没有被提升为通过，最终结果以本次脚本输出为准。
旧PNG、donor账本、theme及引擎数学/预算/十二形态未为了本轮清理或视觉数量重写。

## 选择边界、回滚与剩余不确定性

不预装搜索combobox、虚拟列表、Toast队列或上游图像优化：没有已验证的当前需求
或设备收益，增加它们不等于当前控件更完整。复杂选择出现真实场景时先评审成熟
headless包的依赖边界，不复制一整套状态机来维持表面零依赖。donor的商业预设与
通用observer不在此轮采纳范围，本地已有几何、预算、休眠与受控gloss继续作为实现。

已确认：原公开名字与包路径、核心数学/预算/形态、真实原生控件、三个引擎的上述
浏览器验收。仍未确认：真实iPhone/Android WebView、辅助技术朗读、所有系统原生
选择弹窗的键盘/手势流程和性能FPS。Mac headless 下 Down/Enter 没有成功选择原生
popup，记录为工具验证缺口，不用 selectOption 成功冒充它；后者只证明值/change/表单。
axe对叠在SVG上的两颗液体按钮报对比度 incomplete 而非 violation，配合现有token
对比度守卫和截图检查；没有据此宣布完整WCAG认证。未改University，产品自己的
路由过渡、状态和三包升级回归仍由消费方拥有。外部人工证据引用者未完整枚举，旧图保留。

回滚使用正常 revert，不覆写已发布版本；消费方先撤销新API采用，再同步回退各manifest
与lockfile到2.5.0。旧入口与默认样式保留，故不需要强制迁移才能升级。

Learning skipped -> WebKit事件教训已进入设计指南、实现注释和回归测试，避免再建重复权威。
