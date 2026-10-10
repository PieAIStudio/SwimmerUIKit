---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-10-10
domain: ui-components
tags:
  - uikit
  - reference
pinned: true
related:
  - PLAN-UIKIT-3-RESTRUCTURE
  - REF-MIGRATION-3-0
---

# 当前工作

## 当前：3.2.1 本地候选（待 Claude 发布到 latest）

2026-10-10，任务单要求修正 3.2.0 的两个问题：（1）Server Component 构造的触发器以惰性元素传入 `GameHelpCard` 或 `GameTooltip` 时，服务端渲染与生产预渲染失败，报 `TypeError: Cannot read properties of undefined (reading 'ref')`；（2）`GameHelpCard` 的中文 `懒人包 / 设定图 / 选角单` 与英文 `Starter pack / Sheet / Cast` 在 340 像素卡片内换成两行。

惰性触发器的处理：有效元素仍走原来的克隆路径；其他子元素放入不占布局的 `game-ui-trigger-slot`，挂载后把 `aria-expanded` 与 `aria-controls`（卡片）或 `aria-describedby`（提示）加到第一个可聚焦元素上，卸载时移除。触摸的第一次点按在捕获阶段处理，内层链接不会因此跳转。`GameTooltip` 此前不崩溃，但惰性触发器缺少 `aria-describedby`，已补上。惰性路径每个组件打印一次 `console.warn`，没有按构建模式关闭（理由见 `scripts/check-warnings-survive-build.mjs`）。

页签一行：`GameHelpCard` 与 `GameAccountMenu` 共用一条组合选择器（写在 `GameTabs` 的样式中）；帮助卡的页签按内容定宽，并用账号菜单的紧凑间距，因为 `GameTabs` 没有紧凑尺寸。账号菜单的等宽页签不变。

源码提交：`e2018e6`（惰性触发器与 Next 消费检查）、`7fa6b25`（页签一行）、`13e37b1`（版本 3.2.1、更新日志与 README 状态）、`30c1310`（惰性触发器只在元素变化时更新）、`d810572`（页签测试在恢复视口前卸载卡片）。候选源码为 `d810572`。没有发布 npm，没有运行 `npm publish`、`npm dist-tag` 或 `npm trust`，没有触发任何 workflow。

门禁（源码 `d810572`）：`pnpm verify` 通过（103 个测试文件、700 项测试，退出码 0；`act` 警告 6 条，均为既有的 `LiquidReveal`，与 3.2.0 相同）；`pnpm docs:check` 通过（57 份文档，0 警告）；`pnpm build-storybook` 通过；`check:packed` 通过（回执源提交 `d810572`，工作树干净）；`check:next-consumer` 通过（3.2.1，SHA-256 与候选一致，控制台与网络错误为零，包含服务端触发器用例）。3.2.0 候选在同一用例上失败：静态预渲染报同样的 `TypeError`，动态渲染返回 500。

入口体积：根入口 `index.js` 从 3.2.0 的 159,459 字节（gzip 46,558）增至 161,753 字节（gzip 47,366），相对 3.2.0 增加 2,294 字节。相对 3.1.0（153,482）增加 8,271 字节，超过 3.2.0 候选记录的 6 KB 上限约 2.1 KB，需 Claude 决定接受或精简。

本地候选为 `.scratch/release-3.2.1/swimmer-ui-kit-3.2.1.tgz`，23,977,391 字节，SHA-256 `b0c803c7d50738be6eeca68c07f43717a34f6a23d6ed7b100bfd3c01b9589577`。证据见同目录 `result.json`。截图在 `.scratch/release-3.2.1/shots/`：两个页签故事（中文、英文）各三个页签、1280 与 360 像素、浅色与深色，共 24 张，三个页签均在同一行、无截断、无换行；账号菜单 1280 与 360 像素的截图与 3.2.0 字节一致。

开放事项：（1）入口体积超出记录上限，见上。（2）任务单要求惰性路径仅在开发环境告警；按仓库已有的 `check-warnings-survive-build` 规则，构建模式判断会在发布时被删除，故未加门控，告警只打印一次。（3）任务单写 `aria-haspopup`，但 3.2.0 的克隆路径没有设置它，两条路径保持一致，未加。（4）`docs/reference/theme-and-liquid.md` 是固定文档（REF-DESIGN-SYSTEM-GUIDE），其“适用版本”行仍写“3.2.0 候选”，3.2.0 发布后未更新；本次未改，需要 Owner 或 Claude 决定是否用 `Pinned-Override` 更新。（5）账号菜单的选中页签“小鱼的作品”在 360 像素下被截为“小鱼...”，3.2.0 即如此，本次按要求保持外观不变。

## 当前：3.2.0 已发布到 latest

2026-10-10 18:32 +08 由 Claude 用 Owner 的 npm 登录从 `.scratch/release-3.2.0/swimmer-ui-kit-3.2.0.tgz`（SHA-256 `06853f1b81bed64838d5a3c37cc7b4482b1aa39a59a113640406dd5740388191`）发布；`latest` = 3.2.0，`next` 仍为 3.0.0-rc.3。以下为发布前的候选记录。

2026-10-10，Owner 决定：帮助属于 UIKit 的同一个 help 家族，四级由轻到重（GameTooltip、GameHelpCard、FirstSessionOnboarding、产品自己的指南页），UIKit 提供位置、动效、触摸、键盘、减少动态与无障碍的框架，产品提供文字与短演示。Claude 据此委托实现 `GameHelpCard`，并在候选中补充两项 GameAccountMenu 修正：360 像素面板的页签保持一行，选中页签文字的对比度加以守护。

`GameHelpCard` 与其三个类型从根入口导出。悬停经过 `openDelay`（默认 200 毫秒）打开，离开约 150 毫秒后关闭；键盘聚焦打开但不抢焦点，Tab 进入卡片，Escape 回到触发器；触摸第一次点按只打开、第二次才执行动作。一到四个主题用 GameTabs 切换。媒体在第一次打开并选中主题后才请求，视频静音循环、只在可见时播放，减少动态时不自动播放并显示 poster。卡片经门户离开主题子树后，通过一个带主题与风格属性的外框镜像触发器的主题（测试覆盖深色与风格）。演示素材 23 KB，由脚本生成，放在 `src/feedback/GameHelpCard/assets/`。

源码提交：`46d644b`（GameHelpCard）、`3befbb7`（账号页签一行与对比度守护）、`7e91c62`（选择指南、主题说明与接口清单）、`378711f`（3.2.0 版本号、更新日志与 README 状态）。没有发布 npm，没有运行 `npm dist-tag` 或 `npm trust`，没有触发任何 workflow；所有 workflow 都是 `workflow_dispatch`，推送不会触发它们，Vercel 的 git 部署在 `vercel.json` 中已关闭。

门禁（源码 `378711f`）：`pnpm verify` 通过（103 个测试文件、683 项测试）；`pnpm docs:check` 通过（57 份文档，0 警告）；`pnpm build-storybook`、真实打包检查 `check:packed`（回执的源提交为 `378711f`，工作树干净）与真实 Next 消费检查 `check:next-consumer` 均通过。

入口体积：根入口 `index.js` 从 153,482 字节（gzip 44,908）增至 159,459 字节（gzip 46,558），增加 5,977 字节（minified，低于 6 KB 上限，余量较小）。根入口公开名字从 129 增至 133（56 个值、77 个类型）；迁移表与接口清单由生成器更新。

本地候选为 `.scratch/release-3.2.0/swimmer-ui-kit-3.2.0.tgz`，23,975,862 字节，SHA-256 `06853f1b81bed64838d5a3c37cc7b4482b1aa39a59a113640406dd5740388191`。证据见同目录 `result.json`。截图在 `.scratch/release-3.2.0/shots/`：GameHelpCard 七个故事，各含 1280 与 390 像素、浅色与深色、关闭与打开，共 56 张；另有 GameAccountMenu 灰色风格的页签截图 3 张。56 张无页面错误，无横向滚动，每个打开状态都有对话框。

账号页签：360 像素下三个页签等宽、同一行（测量顶边相同），标签单行并省略，未选中页签不为隐藏的对勾预留宽度。选中页签文字在六种风格与两种明暗下的对比度均不低于 6.8:1（测试以 4.5:1 为下限守护）。开放事项：本仓库的故事与浏览器检查没有复现“选中页签文字不可见”，悬停与焦点状态也没有变化；若产品仍遇到，需要提供风格、明暗与 DOM 结构，本次不做产品覆写。

开放事项：（1）3.1.0 的账号菜单入口闭包约 83 KB 的问题仍待 Claude 决定（见下节）。（2）GameHelpTip 也经门户渲染，但未做主题镜像，它在深色下是否出错未核实，留作后续检查。（3）`documentation-map.md` 中关于 3.0.0 的既有过时句子不在本次范围，未改。

## 前序：3.1.0（已发布到 npm latest，2026-10-10 16:19 +08）

2026-10-10，Owner 委托新增共享账号菜单。Claude 审核后定为：`GameAccountMenu` 与其三个类型只从 `@pieai/swimmer-ui-kit/liquid-presence` 导出，并需同时引入 `liquid-presence.css`，不进入根入口。头像与名字的 sm 次要按钮打开同一个液体面板（站内内容、全部产品、账号页签）；产品拥有数据、产品列表和登录/退出，组件不联网、不存储。`GameTooltip` 新增可选 `align`（center / start / end）与 `placement`（top / bottom），默认外观不变。

源码提交：`f183446`（GameAccountMenu）、`2c985e3`（GameTooltip）、`efa7936`（选择指南与接口清单）、`c5fc480`（3.1.0 版本号、更新日志与 README 状态）、`9f711ae`（3.0.0 发布记录）、`32b91e2`（账号菜单移入 liquid-presence 入口）、`d458717`（入口相关文档与生成清单）。`pnpm verify` 通过（100 个测试文件、659 项测试）；`pnpm docs:check` 通过（57 份文档，0 警告）；`pnpm build-storybook`、`check:packed` 与 `check:next-consumer` 通过。

本地候选为 `.scratch/release-3.1.0/swimmer-ui-kit-3.1.0.tgz`，源码 `d458717`（工作树干净），SHA-256 `1954dd118ce94caba0d07aeed656dd48e668a5036894b0133e726af5cb9bdd28`。它取代入口移动前的候选 `9afc973c…b887e`（菜单在根入口，未发布，已覆盖）。证据见同目录 `result.json`；截图 64 张在 `.scratch/release-3.1.0/shots/`，取自本候选的 storybook 构建，覆盖展开与收起、1280 与 390 像素、浅色与深色；390 像素无横向滚动，无页面错误。

入口体积。方法：沿打包产物的导入图累计各入口的块字节（与 `check:packed` 的 rootRuntimeBytes 同一规则；3.0.0 得到 153,332，与已记录一致）。

- 根入口 index.js：3.0.0 为 153,332 字节（gzip 44,709）；移动入口前的 3.1.0 为 179,195（gzip 52,975）；移动后为 153,482（gzip 44,908），与 3.0.0 相差 150 字节，来自 GameTooltip 的新参数。
- liquid-presence 入口：3.0.0 为 57,052 字节（gzip 17,629，2 块）；移动入口前为 57,764（gzip 19,229）；移动后为 140,187（gzip 41,130，3 块）。增量约 83 KB，来自账号菜单使用的 GameButton（所在共享块 `GameAvatar-*.js`，26 KB）及液体引擎共享块 `LiquidGroup-*.js`（66 KB）。这两块与根入口是同一份文件，没有重复代码；液体预算的定义只出现在一处。消费端是否裁掉未使用的菜单代码，取决于其打包器的摇树，本次未实测。

根入口公开名字为 129 个（55 值、74 类型），与 3.0.0 相同；迁移表与接口清单由生成器重新生成，数字照生成器算出的结果保留。

开放事项：（1）账号菜单的入口闭包比上一候选的 liquid-presence 多约 83 KB，原因是它依赖 GameButton。若 Claude 认为 liquid-presence 的专用产品承担不起，需要决定是否改用不依赖 GameButton 的结构，或接受现状。（2）账号菜单自身的样式仍在 `styles.css`，因为既有的 CSS 归属检查要求 game/ 下的组件样式进入主样式表；面板的液体样式仍在 `liquid-presence.css`。

3.1.0 已于 2026-10-10 16:19（+08）由 Claude 发布到 npm `latest`，发布的 tarball 为上面的本地候选 `.scratch/release-3.1.0/swimmer-ui-kit-3.1.0.tgz`，SHA-256 `1954dd118ce94caba0d07aeed656dd48e668a5036894b0133e726af5cb9bdd28`。只读核对：registry 的 `dist.integrity`（sha512）与该候选一致；`latest` 为 3.1.0，`next` 为 3.0.0-rc.3。发布前的 `latest` 为 3.0.0。

## 前序：3.0.0 稳定版（已发布到 npm latest，2026-10-10）

2026-10-10，Owner 决定发布稳定版 3.0.0：源码与 3.0.0-rc.3 完全相同（基于提交 `c058b9f`），只把版本号改为 3.0.0，并更新 README 安装命令、更新日志与迁移说明。`pnpm verify` 通过（95 个测试文件、624 项测试，与 rc.3 相同）；`pnpm docs:check` 通过（57 份文档，0 警告）；`pnpm build-storybook`、真实打包检查 `check:packed` 与真实 Next 消费检查 `check:next-consumer` 均通过。

本地候选为 `.scratch/stable-3.0.0/swimmer-ui-kit-3.0.0.tgz`，SHA-256 `eb6cdfe9e8cdd804d10078e69acd224ba349d30fb457f9c681220b7d3a98561d`，证据见同目录 `result.json`。与 rc.3 tarball 对比：文件列表 500 项完全相同；除 `package.json`、`README.md`、`CHANGELOG.md` 三个文件外，所有文件字节一致。

3.0.0-rc.3（SHA-256 `004669ec…356`）已于 2026-10-10 发布到 npm `next`。3.0.0 已于 2026-10-10 04:48:31 UTC 由 Claude 发布到 npm `latest`，发布的 tarball SHA-256 与上述候选一致（`eb6cdfe9…`，发布后用 npm 只读下载核对）。发布后只读查询：`latest` 为 3.0.0，`next` 为 3.0.0-rc.3。下游产品仍按各自精确版本锁定，不因此自动升级。`.scratch/stable-3.0.0/result.json` 保留的是发布前记录（`published: false`），不作修改。

npm 访问：Owner 的 npm 登录（账号 `pieai`，组织 owner）现可在本机使用，下文 rc.2 节记录的“等待权限核对”阻断已解除。GitHub `npm-publish` 工作流的可信发布配置仍未核实，保留为开放事项；本次没有触发任何 GitHub 工作流。

## 前序：3.0.0-rc.3 候选（按压与待定，已发布到 next）

2026-10-10，Owner 反馈液体按压几乎不可见。本地提交依次为 `9e52771`（按压至少保持 140 毫秒）、`6c34140`（CTA 压扁 1.06 / 0.87 / 3，平面水滴压扁 1.09 / 0.80）、`b60d8cc`（GameButton `pending`）、`0b17020`（文档）与 `8d3cf78`（版本 3.0.0-rc.3 与更新日志）。`pnpm verify` 通过 95 个测试文件、624 项测试；storybook、docs、真实打包、packed 检查与真实 Next 消费均通过。

本地候选为 `.scratch/jelly-rc3/swimmer-ui-kit-3.0.0-rc.3.tgz`，SHA-256 `004669ec5b6dfbdaba4af3a746c8b5abd1e727c44b2147145efc3b3e0e36356b`；证据见同目录 `result.json`。本次只推送源码，没有 npm 发布，也没有触发 `npm-publish` 或其他 GitHub workflow。rc.2 候选文件保持原样，芽族仍按其哈希锁定使用；rc.3 不覆盖 rc.2。下游接入或正式发布都需要 Owner 另行授权。

2026-10-10 后续：Owner 决定后，Claude 使用 Owner 的本机 npm 登录，把上述 tarball 发布到 npm `next`（SHA-256 不变，未经 GitHub 工作流）。`latest` 未变。3.0.0 稳定版见上节。

## 前序：芽族使用本地 3.0.0-rc.2 候选，发布暂缓

2026-10-10 更新：Owner 的 npm 登录现可在本机使用，下文“权限核对”的访问阻断已解除；rc.2 发布失败的原始记录保留不变。GitHub `npm-publish` 的可信发布配置仍未核实，见上节。

2026-10-08续接确认 Owner K3：芽族先使用下方哈希锁定的本地候选完成修正与验收，分阶段本地提交；推送与 npm 发布留待后面一起处理。无需为了本地开发重新登录 npm。包本身仍未发布，下面的失败记录继续有效，但不再阻塞芽族的本地工作；不要重复触发发布。候选文件仍原样保留，修改 Kit 源码后必须另做新候选并重新验收，不静默覆盖已经验证的 tarball。

Owner 在芽族 `PLAN-YAZU-PLATFORM-RENEWAL-V1` §1 K2／§2 已授权根修、验证、普通推送并通过本仓库可信工作流发布下一候选版。本轮不动其他产品或其工作区。原生按钮 props 整包注入的编译回归在 rc.1 为红；修正共用 NativeAction 的 `rel` 类型，不在芽族打兼容补丁。证据保留 `.scratch/yazu-renewal-rc2/`。最终本地 verify 同次114.789s、94测试文件/601例全过；Storybook7.492s、docs4.214s、打包检查3.115s与真实Next消费58.091s通过，1275份输入未变。候选SHA-256 `cf6a772f09588fd4cea782649369a4bed5054c9f1fa869e9a41e1801e99a0d94`；芽族使用这个实际tgz后类型/内容检查、8项语言与账号边界测试及构建通过，不丢弃原生按钮属性。证据见该目录的 `final-validation/result.json`。2026-10-07 Owner 续接授权后普通推送成功，本地/远端实现均为 `39e3277f16b01a8d2e439aa78e91762837476de8`；发布状态见下段，不能把候选包当作已发布。

本次只触发一次 `npm-publish`：运行 `37644318828`（run attempt 1）完成全部发布前门禁，包括云端601项测试、Storybook、文档、真实打包、publint、类型消费及Next验收；2026-10-07T15:33:53Z 在 npm PUT 发布请求处返回 E404，未通过发布。完整日志及结构化结果为 `.scratch/yazu-renewal-rc2/publish-37644318828.{log,json}`。独立注册表回读仍是 next=3.0.0-rc.1、latest=2.14.0，rc.2未可见；没有重复发布或改标签。

已按中央 `.secrets/README.md` 与 cloud-platform-access 规则核对既有方式。官方 `npm trust list @pieai/swimmer-ui-kit --json --registry=https://registry.npmjs.org` 返回 E401，当前本机登录不能读取此包的可信发布配置。发布E404本身不能唯一确定根因；需要Owner恢复有此包管理权限的npm登录，再核对 GitHub组织 `PieAIStudio`、仓库 `SwimmerUIKit`、工作流文件 `npm-publish.yml`、环境条件与 `npm publish` 权限。不要获取/输出密钥、降低2FA或用私包GitHub令牌替代npm权限，也不要在缺少新证据时重跑发布。此处满足芽族计划§3.1的访问阻断，后续等待权限核对。

## 已发布基线：3.0.0-rc.1

S0–S14与本次预发布均已完成，计划已归档：[结构重整](../../plans/completed/PLAN-UIKIT-3-RESTRUCTURE.md)、[发布前补齐](../../plans/completed/PLAN-UIKIT-3-COMPLETION.md)。发布源提交79d1649a37f7f42d1ad89ab66f6ec844f6d678fa；工作流37173677049成功，npm独立核对next=3.0.0-rc.1、latest=2.14.0。本次新增授权只触发一次，run_attempt=1。后续文档收口提交不改变已发布包。

| 阶段 | 进度与提交 | 证据 |
| --- | --- | --- |
| S0 | 完成，c9aed8b；66 源码文件 / 20,069 行，295 名字，482 测试 | .scratch/baseline/：原始构建、288 张浅深色 DPR 1 图、metrics.json |
| S1 | 完成，1e720ba；只拆分归位，492 测试，295 名字不变 | .scratch/s1/consistent-v9/ 与保存的 S0 重拍：288 张逐字节一致 |
| S2 | 完成，38ca91c；组件样式归位，496 测试 | .scratch/s2/：993 条编译后原子规则等价、288 张截图一致 |
| S3 | 完成，6cde281、f18fe32；移除专用业务、分离特效和展厅，dark 断代，460 测试 | .scratch/s3/visuals-final/：保留 238 图一致；删除故事有清单 |
| S4 | 完成，8442b1a；Claude 通过，危险红字、普通底色、两套红边，开关语义色；489 测试 | 原评审 .scratch/s4/review/；补充 .scratch/s4/claude-amendment/，三引擎各 360 色对最低 5.036:1 |
| S5 | 完成，47d2cef：现行说明收敛为七个入口，旧业务/研究/发布回执归档；493 测试及文档、Storybook 门禁通过 | .scratch/s5/；276 个历史工件归档，非 Markdown 字节逐一一致；351 个公开素材路径与内容不变 |
| S6 | 历史3.0.0本地候选（由rc.1接替，不再单独发布）；493 测试、文档、Storybook、实际 tarball、publint 严格检查和四入口 ESM 类型消费通过 | .scratch/s6/final/；package-check/receipt.json 记录源提交、包体校验值、351 个素材、四入口和共享块体积 |

**发布前补齐（S7–S14）**：Owner 2026-10-03 决定发布前一次解决产品接入暴露的 11 个问题，不兼容旧写法；黏土图标退场、中文默认字体用资源圆体；完成后以 `3.0.0-rc.1` 发布到 npm `next` 标签（`latest` 保持 2.14.0）。已完成任务书：[PLAN-UIKIT-3-COMPLETION](../../plans/completed/PLAN-UIKIT-3-COMPLETION.md)。下文 S6 的 `3.0.0` 本地候选由该计划的 rc.1 取代。

| 阶段 | 进度与证据 |
| --- | --- |
| S7 | 本地提交0354542；移除五个未公开组件及所有关联代码；指南逐项覆盖全部公开值，缺行反例检查接入 verify。门禁记录：.devspace-reports/uikit-3-completion/S7/。 |
| S8 | 351个图片素材及复制工具退场，48个线条图标和逐图快照；独立路径子入口可裁剪，来源与许可证已登记。门禁和浅深色总览：.devspace-reports/uikit-3-completion/S8/。 |
| S9 | 资源圆体OFL1.1允许切分，保留版权并改内部名称；四字重464块按需加载。确定性、实际字体和纯英文零中文请求的证据：.devspace-reports/uikit-3-completion/S9/。 |
| S10 | 四个层级与一个浮层阴影归位，旧panel别名删除；12风格控件配方不变，首页有真实层级示例。证据：.devspace-reports/uikit-3-completion/S10/。 |
| S11 | 原生/路由链接、32px小号与受控LiquidPopover；新10个浏览器用例覆盖真实ref、禁用、键盘、焦点与静态预算。阶段门禁与桌面/窄屏截图：.devspace-reports/uikit-3-completion/S11/。 |
| S12 | 完成，本地提交45bdc12；展示组件静止水滴，进度条变值600ms后休眠、不占滤镜预算。十二组合与0→100记录在S12/；本次复验569测试、样式、字体与文档通过，日志在S12/resume/。 |
| S13 | 完成，本地提交e3a96a7；完整verify与docs通过。React入口及共享分块client boundary；真实tarball通过Next16.3.8构建、启动、Server直接导入、Client液体交互、Next Link、390px减少动态与零浏览器错误检查。证据：.devspace-reports/uikit-3-completion/S13/next-consumer/；完整包体检查：.scratch/uikit-3-completion/S13/packed/。 |

S14首轮工作流37141176655在registry结构校验处失败并停止，实际发布未执行；证据保留在`.devspace-reports/uikit-3-completion/S14/`。Owner随后新增的一次授权已成功完成，证据在同级`S14-reauthorized/`：真实npm12.2.0返回夹具、29项发布保护专项、本地/云端598测试、真实包与Next门禁、推送、workflow及独立npm校验。

本轮迁移唯一入口：[migration-3.0](../migration-3.0.md)，包含 University 的主题、风格、CTA、AuthKit 验证码判断与候选验收事项。接口明细由 pnpm api:inventory 生成，数字随源更新，不从历史版本推断。

S14 当时的安装版本为精确版本`@pieai/swimmer-ui-kit@3.0.0-rc.1`（历史记录；当前稳定版见上文 3.0.0 节）。本地候选在`.scratch/uikit-3-completion/S14-reauthorized/swimmer-ui-kit-3.0.0-rc.1.tgz`；npm下载包与CI核对SHA-256为`80f3f59353ad70516e1442284793a7949007d943f0b3df3f42ed42f8b8c57681`，证据`S14-reauthorized/published-artifact.json`。本地候选哈希与云端归档哈希不同，回执明确分开；S6/S13包只作历史证据。

下一步只剩各产品自己的主动接入验收；本任务未修改任何其他仓库。正式3.0.0已由Owner于2026-10-10授权（见上文）；其他版本、再次发布或产品部署仍需新的明确授权。发布成功后短暂E404的原始观察也已保留，最终以版本和标签实际可见为准，不以publish步骤绿色代替。完整报告：`.devspace-reports/uikit-3-completion/REPORT.md`。

## 历史与边界

2.14.0 及以前已发布回执已移到[历史记录](../../archive/releases/through-2.14.0.md)，不再当作当前待办。S0 原图不覆盖，S4 原评审图与补充复验分开；历史证据归档保留字节，不算当前产品验收。

源仓库、提交/推送、npm 发布、消费产品验收是四件事。保存代码不触发 Actions 或 Vercel；不要把新版本号、tarball 或绿色测试说成已经上线。
