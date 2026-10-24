---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-10-23
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

## 当前：4.0.0-alpha.1 已于 2026-10-24 通过 trusted Actions 发布为 npm next

B1 按 `BRIEF.md` 完成：计划收窄提交 `51e7088`，B1 提交 `7ef18ef`，均已正常推送 `main`。B1 移除未使用的 `./liquid-effects`、`./preview`、`./icon-paths` JavaScript package leaves，保留仍有消费者的 `preview.css`；根入口与 `liquid-presence` 的发布、packed、API、类型和构建边界已同步。液体外圈与进度轨道不再使用 React `useId` 分配顺序作为几何种子；无调用方身份时使用固定可读种子。

仅手动触发 `npm-publish.yml`：run **40096094967**／attempt 1 成功，head `7ef18ef`。云端完整 `pnpm verify`、Storybook、文档、真实包、publint、ESM-only attw、类型消费和 Next 真包消费全部通过；Next consumer 与发布候选 SHA-256 为 **`0db5567a3b55983b6befbe65b1e1f0677cc21537c17bee2a58c3e4322110a408`**。workflow 的传播读回先短暂得到精确版本 E404，随后同一 attempt 内成功确认版本和标签；没有重发或重跑。

官方独立回读：`@pieai/swimmer-ui-kit@4.0.0-alpha.1` 存在，`next=4.0.0-alpha.1`，`latest=3.2.5`，registry `dist.integrity=sha512-4v1jWGmz/ovhVeo1OzL/Q7kE6t2SaKfjYGuGMSIuFfK7A6rosGpOfA+KVmEMvks7X7fPJAJf7as3XbJuRcxoYg==`；新下载归档与 workflow 候选 SHA-256 一致。4.0 alpha 只发布到 `next`，不代表任何产品已升级或验收。

## 稳定基线：3.2.5 已于 2026-10-23 通过 Actions 发布为 npm latest

Owner 接续⑫授权的最小补丁已在 `3701eaa` 推至 main：`AccountMenu` 可选 `triggerId` 原样透传到内部 `Button.id`，产品 +4 行（含注释），不改种子算法，未传时保留原行为与参考图。新增两次挂载回归修前在路径相等断言失败，修后依赖自动选中的 4 文件／26 项全过；类型、lint、格式、API、构建与文档通过。默认无 id 时改用稳定种子的建议留在组件 README，本次不实施。

仅手动触发 `npm-publish.yml`：运行 `39951527996`／attempt 1 成功，完整 105 文件／711 项、Storybook、文档、真实包、publint、类型消费和 Next 消费全部通过；由该工作流发布原包，本机没有 `npm publish`。CI 包 SHA-256 为 `c97ddc9f0b17452af9e8a3aecbcfdfe4bc6e070fee5f5061a402dd8db3c37bed`；官方精确 `npm view` 于 20:25 +08 返回 **3.2.5**，工作流确认 `latest=3.2.5`、`next=3.0.0-rc.3`。发布后只读传播等待中的 E404 原日志保留，没有重发。两仓收据与 registry integrity 统一在 Directing 的 `.reports/2026-10-23-uikit-trigger-id/PI-RESULT.md`；消费端发布另行验收。

## 前次：3.2.4 已于 2026-10-23 发布为 npm latest

2026-10-23 总指挥授权修复并发补丁；前份任务书的私有发布要求已由 08:0x 更正撤回，UIKit 仍发布到公开 npm 的 `@pieai/swimmer-ui-kit`，不改包名或恢复旧 scope。`LiquidGroup` 的 SVG portal `<g>` 因 React 注册焦点事件而在 Chromium 占用 Tab；只在该装饰容器设置 `tabIndex={-1}`，保留已有的 `aria-hidden`／`focusable`，不改变真实子控件顺序。`LiquidEffectsGroup` 共用根组件一并修复；两项真实 Tab 反例在旧实现均失败。依赖自动选检通过 57 个文件／390 项（12 个单元文件、28 个 Storybook 文件、17 个 Chromium 文件），零重试；类型、lint、格式、API、构建和文档通过。修复原始证据保留在 `.reports/2026-10-23-liquid-focus/`。

公开发布候选包源码仍为 `a139bc51c74a550b70a931c843f0dd3dd0be1d3e`；09:0x 续接检查时本地／远端 main 为 `0a49bc2`，仅状态文档不同，工作区干净。总指挥新增授权对同一候选的网络失败重跑完整门禁一次，安装网络错误最多 3 次尝试；本轮冻结安装和 Next 安装均一次成功，额外重试 **0 次**，没有重跑测试。09:09:37–09:12:40 +08 的完整 `pnpm verify` 通过 **105 文件／710 项**；Storybook、文档 57 份／195 链接、真实包检查、publint 严格模式、仓库既定 ESM-only 类型消费，以及 **Next 16.3.8 构建／水合／链接／焦点／390 窄屏减少动态浏览器验收全部通过**，Next 浏览器错误为零。三张实际消费截图已目视复核。

本轮 tarball 为 `.scratch/release-3.2.4-network-retry/pieai-swimmer-ui-kit-3.2.4.tgz`，**23977825 字节／500 文件**，SHA-256 **`7a52b7606ab787ec302e30a400f5208bb62cbdbe6bf81372aeb545cf8465eee9`**，与前轮 `.scratch/release-3.2.4/pieai-swimmer-ui-kit-3.2.4.tgz` **逐字节一致**；两包均只读保留。前轮 08:15:35 +08 的 Next 安装 `ECONNRESET` 及未执行的构建／浏览器回执继续原样保留在 `.reports/2026-10-23-release-3.2.4/`，本轮成功证据不覆盖首红。

**3.2.4 已发布为 npm latest（2026-10-23，Owner 本机发布）。** registry tarball 与冻结候选逐字节一致：SHA-256 **`7a52b7606ab787ec302e30a400f5208bb62cbdbe6bf81372aeb545cf8465eee9`**，registry integrity（sha512）与本地候选相同。下方 EOTP 停止过程和 12:51 读回是发布前的历史记录，不代表当前状态。此前：Owner 本人恢复登录后，总指挥于 2026-10-23 12:5x 授权仅发布上述已验原包。当前 npm 12.2.0 的 `npm whoami --registry=https://registry.npmjs.org/` 两次返回 `pieai`；本地／远端 main=`c4ec96c`，相对 a139bc5 只有状态文档差异，源码与依赖锁不变，已安装依赖锁逐字相符，Node 24.19.0／pnpm 11.22.0／npm 12.2.0 与上一轮一致，冻结包哈希及原始门禁证据仍有效。因此复用 105 文件／710 项及真实包／Next 门禁，未重打包或重跑已绿全套。发布保护确认包存在、`latest=3.2.3`、无 3.2.4 后，12:50:58–12:51:06 +08 唯一一次 `npm publish <上述 tgz> --tag latest --registry=https://registry.npmjs.org/` 按 `publishConfig` 的 public access 执行，返回 **EOTP：This operation requires a one-time password**（退出 1）。按本轮指令停止；未打开验证链接、输入 OTP、换认证方式或重试发布。

12:51 +08 独立读回仍为 `latest=3.2.3`、`next=3.0.0-rc.3`，版本列表无 3.2.4；新缓存精确查询 `version dist.integrity` 返回 `No match found for version 3.2.4`。因此**没有发布时间、registry integrity 或已发布 tarball 可供下载比对**，未创建 v3.2.4 tag 或 GitHub release，Directing 暂不能升级。Owner 须本人完成供应商要求的一次性验证；续接时先独立读回是否已发布，不能自动重复 publish。本轮证据为 `.reports/2026-10-23-release-3.2.4-publish/release-receipt.json` 与同目录命令／日志／退出码；上一轮 E401、首轮 ECONNRESET 和原包均原样保留。交接见根目录 `PI-RESULT.md`，未改消费者、Actions 或 Vercel。

## 前次：3.2.3 已发布，独立核对与验收原包一致

2026-10-13 Directing 的同一 `3160887`、390 窄屏原用例连续三次诊断为两过一败，但五个铜牌控件每次都得到不同 SVG 路径；每轮内等待 600ms 路径不变。字体均已加载、DPR=1、画布 390×844、CSS 点击框一致。用本包未改的几何函数和实际 React `useId` 重算，15/15 路径逐字节吻合；不是截图前多等一会儿或画布取整可以解决的问题。

最小共享修正：`Button` 仅在调用方已提供原生 `id` 时，将它传给内部 `DropletSurface` 作为稳定种子。自动编号仍用于未指定身份的控件；1.4px 上限、曲线数学、按压与减少动态保持原样。产品负责选择稳定唯一的语义 ID，不复制绘图器，也不挑选自动编号匹配参考图。新增三项真实浏览器反例在旧实现全部失败，修正后全部通过；新增按压回归按原弹簧测试的 180 帧范围观察恢复，不改产品或原门禁时限。本轮完整 `pnpm verify` 已通过 **105 文件 / 708 项测试**，类型、lint、格式、公开接口、指南、样式/主题、构建与字体检查通过；文档 **57 份 / 195 链接**、Storybook 构建通过。源修复 `d175e8c` 已推送；实际 tarball 检查和 Next 16.3.8 消费也已通过，发布包 `.scratch/contour-identity/packed-candidate/pieai-swimmer-ui-kit-3.2.3.tgz` 共 **23977373 字节**，SHA-256 **`25ff96c69fa721deeaeda2ac05f6c7b9db995500d8383ded765417b52724bf77`**。该包的生产导入、原生链接、窄屏与减少动态验收无浏览器错误。发布前曾受阻：2026-10-13 17:37 官方 registry 身份检查返回 **E401**，当时精确版本查询仍无 3.2.3；此失败记录原样保留，不代表下方独立回读后的当前状态。原始过程在 `.scratch/contour-identity/`，第一次候选的可选类型声明错误已修正，首次新增按压测试误用默认 1 秒观察范围的失败也单独保留。

Directing 三次原始观察、输入哈希与 15 条路径归因保存在该产品现有 SSO 证据目录的 `resume-contour-rootcause-20261013/`。Directing 使用这一精确 tarball 的候选检查已通过类型、lint、双构建与三种冷重载；三轮完整 World 的六种画面 **18 组轮廓、位置、尺寸及变换全部一致**，整图按原容差两两比较 **12/12 通过**。这不替代产品参考图审批：原 World 三轮各 **8/11**，固定三张窄屏图与旧参考不同，其中 390 窄屏超出 Owner 原先只准更新两图的范围，待新的固定结果审阅。本轮没有改任何消费者参考图、University 或头像代码。npm 与 Directing 正式发布仍是各自独立的验收步骤。

2026-10-14 发布确认：用户通知 Owner 已在本人终端完成两步验证并发布上述验收原包，本会话没有重发。官方 registry 记录发布时间为 **2026-10-13T17:02:22.573Z**（本机 2026-10-14 01:02:22 +08）。01:08 独立读取官方版本并重新下载归档，确认 `latest=3.2.3`、`next=3.0.0-rc.3`，**23977373 字节**与本地验收包逐字节相同，SHA-256 不变，SHA-512 integrity 与 SHA-1 shasum 同时匹配。原始元数据、全新下载包及完整摘要保留在 `.scratch/contour-identity/publish-confirmation-20261014/`，以 `receipt.json` 为入口；未重打包、改标签或修改任何运行源码。随包 README/CHANGELOG 的发布前字节保持不变，此处仅收敛仓库文档状态。

Directing 的三图批准及最新门禁由 Directing 的 `current-work` 和收据拥有；上方 8/11 是替换获批参考图之前的原始记录。本次包发布不等于 Directing 生产发布；用户随后转达 Owner 01:20 的生产发布确认；Directing 仍须最新消费者的本机完整浏览器、World 和六分片全部通过，才可按该产品的正式发布流程部署并线上冒烟。测试或门禁真正失败即停止，不因授权跳过验收。

## 前次：3.2.2 已发布到 npm latest，原包独立核验通过

Owner 的 2026-10-12 SSO 收尾授权要求修正长选项、窄屏账号页签和根入口体积。Kit 内三个问题均已修复：分段选项按内容换行，超长词留在自己的点击区；账号页签按内容分配宽度、两侧留白 4 像素，360 像素下中英文标准标签及选中对勾完整显示，普通英文单词不折断，点击高度至少 44 像素。无新增认证逻辑、公开接口或品牌包依赖。

根入口及全部可达分块共 **157262 字节（gzip 46442）**，比 3.2.1 少 4491 字节。采用现有 Rolldown `attachDebugInfo: 'none'`，仅不再输出源码分区调试注释；许可证、PURE 标记、运行警告和可选入口边界仍受检查。真实 tarball 门禁硬性守护原上限 **159626 = 153482 + 6144 字节**，不改变计量范围、不把代码挪出根入口凑数字。

最终候选：`.scratch/release-3.2.2-final/pieai-swimmer-ui-kit-3.2.2.tgz`，**23972852 字节**，SHA-256 **`f24d775e1d30e3a68727a22a45ab69a34908c224585df64d79f84453265dba53`**。候选不可覆盖；源修改、源码提交、npm 发布与产品验收分别记录。

本轮完整 `pnpm verify` **104 文件 / 705 测试通过**；类型、lint、格式、公开接口、指南覆盖、60 份组件样式、12 套语义配色、构建与真实字体通过；`build-storybook`、实际包 `check:packed` 和实际 Next 16.3.8 消费 `check:next-consumer` 全部通过，后两项摘要与上述最终包一致。日志仍有 LiquidReveal/act 测试环境、声明编译器版本和 Storybook 大分块等警告，不宣称零警告；实际 Next 消费回执无浏览器错误。

原始证据：`.scratch/sso-layout-3.2.2/` 保留 4 项布局红灯、161753 字节超预算红灯、英文 Account 拆词红灯与修正后的绿灯；`.scratch/release-3.2.2/` 保留第一轮包和截图，因英文拆词被最终候选取代，不发布该轮包。最终门禁、包与 Next 回执、28 张明暗/中英/宽窄截图在 `.scratch/release-3.2.2-final/`。截图来自构建后的故事，检查无横向越界、完整文字、英文不拆词及真实点击；代表图已目视复核，28 场景均无页面错误。

发布收口：源 `d6a6fd88179eaf72e2722a968e95385cd3478103` 已提交推送，干净提交的原包检查通过。Owner 恢复 npm 登录后，非交互发布在 `EOTP` 退出，独立查询确认版本仍不存在；改用 npm 官方交互授权流程，Owner 在 Microsoft Edge 完成本人授权，原交互命令退出 0。npm 注册表记录发布时间为 **2026-10-12T08:42:32.424Z**、发布者 `pieai`；本次没有 GitHub Actions 发布 run。

2026-10-12T09:22Z 独立查询确认 `latest=3.2.2`、`next=3.0.0-rc.3` 未变；全新缓存下载的 **23972852 字节**与上述已验收原包逐字节一致，SHA-256 不变，registry SHA-512 同样匹配。Owner 随后询问是否超时，本轮只观察原命令与注册表，未重新发包或再次打开授权页。发布前身份失败、非交互 EOTP 和成功的交互执行分别保留在 `.scratch/release-3.2.2-final/publish-20261012T083651Z/`，独立回执为同目录 `independent-readback-20261012T092208Z/receipt.json`。随包 README/CHANGELOG 保留发布前字节，当前文档的发布状态修订不重打包、不覆盖已发布版本。

各产品尚未接入此补丁，产品已有 nowrap/宽度覆写需在各自迁移中单独核对；本轮没有修改 University 或账号中心头像代码。主题指南适用版本已按本轮授权同步，不再等待下方历史开放项所述的另一次决定；惰性路径警告和 aria 属性合同保持不变。

## 上次发布：3.2.1 已发布到 latest

2026-10-10 20:36 +08（registry 记录的发布时间为 12:36:33 UTC）由 Claude 发布到 npm `latest`，发布的 tarball 为本地候选 `.scratch/release-3.2.1/swimmer-ui-kit-3.2.1.tgz`，SHA-256 `b0c803c7d50738be6eeca68c07f43717a34f6a23d6ed7b100bfd3c01b9589577`。只读核对：registry 的 `dist.integrity`（sha512）为 `sha512-725MGXbMxsA5qbKpROnyh4JRRrQjb4CvIOXo2mMmyLiKVN2hujnjfTgtgxXAPo1PzlIP4oFHRz+BQ2GSGR4gng==`，与本地候选的 sha512 一致；`latest` 为 3.2.1，`next` 仍为 3.0.0-rc.3。发布前的 `latest` 为 3.2.0。以下为发布前的候选记录。

2026-10-10，任务单要求修正 3.2.0 的两个问题：（1）Server Component 构造的触发器以惰性元素传入 `HelpCard` 或 `Tooltip` 时，服务端渲染与生产预渲染失败，报 `TypeError: Cannot read properties of undefined (reading 'ref')`；（2）`HelpCard` 的中文 `懒人包 / 设定图 / 选角单` 与英文 `Starter pack / Sheet / Cast` 在 340 像素卡片内换成两行。

惰性触发器的处理：有效元素仍走原来的克隆路径；其他子元素放入不占布局的 `game-ui-trigger-slot`，挂载后把 `aria-expanded` 与 `aria-controls`（卡片）或 `aria-describedby`（提示）加到第一个可聚焦元素上，卸载时移除。触摸的第一次点按在捕获阶段处理，内层链接不会因此跳转。`Tooltip` 此前不崩溃，但惰性触发器缺少 `aria-describedby`，已补上。惰性路径每个组件打印一次 `console.warn`，没有按构建模式关闭（理由见 `scripts/check-warnings-survive-build.mjs`）。

页签一行：`HelpCard` 与 `AccountMenu` 共用一条组合选择器（写在 `Tabs` 的样式中）；帮助卡的页签按内容定宽，并用账号菜单的紧凑间距，因为 `Tabs` 没有紧凑尺寸。账号菜单的等宽页签不变。

源码提交：`e2018e6`（惰性触发器与 Next 消费检查）、`7fa6b25`（页签一行）、`13e37b1`（版本 3.2.1、更新日志与 README 状态）、`30c1310`（惰性触发器只在元素变化时更新）、`d810572`（页签测试在恢复视口前卸载卡片）。候选源码为 `d810572`。没有发布 npm，没有运行 `npm publish`、`npm dist-tag` 或 `npm trust`，没有触发任何 workflow。

门禁（源码 `d810572`）：`pnpm verify` 通过（103 个测试文件、700 项测试，退出码 0；`act` 警告 6 条，均为既有的 `LiquidReveal`，与 3.2.0 相同）；`pnpm docs:check` 通过（57 份文档，0 警告）；`pnpm build-storybook` 通过；`check:packed` 通过（回执源提交 `d810572`，工作树干净）；`check:next-consumer` 通过（3.2.1，SHA-256 与候选一致，控制台与网络错误为零，包含服务端触发器用例）。3.2.0 候选在同一用例上失败：静态预渲染报同样的 `TypeError`，动态渲染返回 500。

入口体积：根入口 `index.js` 从 3.2.0 的 159,459 字节（gzip 46,558）增至 161,753 字节（gzip 47,366），相对 3.2.0 增加 2,294 字节。相对 3.1.0（153,482）增加 8,271 字节，超过 6 KB 上限约 2.1 KB；Claude 审核后接受，因为这是崩溃修复。

入口体积上限：6 KB（6,144 字节，minified，相对 3.1.0 计算，3.2.0 起沿用）。3.2.1 超出约 2.1 KB 并已接受；下一个次版本应寻找精简，上限不得静默抬高。

本地候选为 `.scratch/release-3.2.1/swimmer-ui-kit-3.2.1.tgz`，23,977,391 字节，SHA-256 `b0c803c7d50738be6eeca68c07f43717a34f6a23d6ed7b100bfd3c01b9589577`。证据见同目录 `result.json`。截图在 `.scratch/release-3.2.1/shots/`：两个页签故事（中文、英文）各三个页签、1280 与 360 像素、浅色与深色，共 24 张，三个页签均在同一行、无截断、无换行；账号菜单 1280 与 360 像素的截图与 3.2.0 字节一致。

开放事项：（1）入口体积超出记录上限，见上。（2）任务单要求惰性路径仅在开发环境告警；按仓库已有的 `check-warnings-survive-build` 规则，构建模式判断会在发布时被删除，故未加门控，告警只打印一次。（3）任务单写 `aria-haspopup`，但 3.2.0 的克隆路径没有设置它，两条路径保持一致，未加。（4）`docs/reference/theme-and-liquid.md` 是固定文档（REF-DESIGN-SYSTEM-GUIDE），其“适用版本”行仍写“3.2.0 候选”，3.2.0 发布后未更新；本次未改，需要 Owner 或 Claude 决定是否用 `Pinned-Override` 更新。（5）账号菜单的选中页签在 360 像素下截断，见下节“已知后续”。

## 3.2.1 原始问题记录（Kit 内已在上方 3.2.2 候选修复）

以下保留最初诊断及产品覆写背景；其中“本次未修”指 3.2.1 当时，不是 3.2.2 当前状态。产品迁移验收仍需独立完成。

- `SegmentedControl`（SwimmerParty，1024 像素）：长英文选项标签互相重叠，由产品报告。选项为 `flex: 1 1 0` 且 `min-width: 0`；SwimmerParty 的 `SheetBuilder` 在选项上加了 `whitespace-nowrap`，标签溢出到相邻选项，并用 `!flex-[0_1_auto]` 覆盖基础宽度。需注意：3.2.1 源码中该规则位于 `@layer swimmer-ui`，并非未分层；产品为何仍需要 `!important`，尚未核实。未来 kit 修正方向：按内容定宽并允许换行，或在文档中写明这一限制。本次未修。
- `AccountMenu`（360 像素）：选中页签“小鱼的作品”被截为“小鱼...”。3.2.0 即如此，由等宽页签（`flex: 1 1 0`）造成；3.2.1 按要求未改外观。未来方向待定。本次未修。

## 历史：3.2.0 发布到 latest

2026-10-10 18:32 +08 由 Claude 用 Owner 的 npm 登录从 `.scratch/release-3.2.0/swimmer-ui-kit-3.2.0.tgz`（SHA-256 `06853f1b81bed64838d5a3c37cc7b4482b1aa39a59a113640406dd5740388191`）发布；`latest` = 3.2.0，`next` 仍为 3.0.0-rc.3。以下为发布前的候选记录。

2026-10-10，Owner 决定：帮助属于 UIKit 的同一个 help 家族，四级由轻到重（Tooltip、HelpCard、FirstSessionOnboarding、产品自己的指南页），UIKit 提供位置、动效、触摸、键盘、减少动态与无障碍的框架，产品提供文字与短演示。Claude 据此委托实现 `HelpCard`，并在候选中补充两项 AccountMenu 修正：360 像素面板的页签保持一行，选中页签文字的对比度加以守护。

`HelpCard` 与其三个类型从根入口导出。悬停经过 `openDelay`（默认 200 毫秒）打开，离开约 150 毫秒后关闭；键盘聚焦打开但不抢焦点，Tab 进入卡片，Escape 回到触发器；触摸第一次点按只打开、第二次才执行动作。一到四个主题用 Tabs 切换。媒体在第一次打开并选中主题后才请求，视频静音循环、只在可见时播放，减少动态时不自动播放并显示 poster。卡片经门户离开主题子树后，通过一个带主题与风格属性的外框镜像触发器的主题（测试覆盖深色与风格）。演示素材 23 KB，由脚本生成，放在 `src/feedback/HelpCard/assets/`。

源码提交：`46d644b`（HelpCard）、`3befbb7`（账号页签一行与对比度守护）、`7e91c62`（选择指南、主题说明与接口清单）、`378711f`（3.2.0 版本号、更新日志与 README 状态）。没有发布 npm，没有运行 `npm dist-tag` 或 `npm trust`，没有触发任何 workflow；所有 workflow 都是 `workflow_dispatch`，推送不会触发它们，Vercel 的 git 部署在 `vercel.json` 中已关闭。

门禁（源码 `378711f`）：`pnpm verify` 通过（103 个测试文件、683 项测试）；`pnpm docs:check` 通过（57 份文档，0 警告）；`pnpm build-storybook`、真实打包检查 `check:packed`（回执的源提交为 `378711f`，工作树干净）与真实 Next 消费检查 `check:next-consumer` 均通过。

入口体积：根入口 `index.js` 从 153,482 字节（gzip 44,908）增至 159,459 字节（gzip 46,558），增加 5,977 字节（minified，低于 6 KB 上限，余量较小）。根入口公开名字从 129 增至 133（56 个值、77 个类型）；迁移表与接口清单由生成器更新。

本地候选为 `.scratch/release-3.2.0/swimmer-ui-kit-3.2.0.tgz`，23,975,862 字节，SHA-256 `06853f1b81bed64838d5a3c37cc7b4482b1aa39a59a113640406dd5740388191`。证据见同目录 `result.json`。截图在 `.scratch/release-3.2.0/shots/`：HelpCard 七个故事，各含 1280 与 390 像素、浅色与深色、关闭与打开，共 56 张；另有 AccountMenu 灰色风格的页签截图 3 张。56 张无页面错误，无横向滚动，每个打开状态都有对话框。

账号页签：360 像素下三个页签等宽、同一行（测量顶边相同），标签单行并省略，未选中页签不为隐藏的对勾预留宽度。选中页签文字在六种风格与两种明暗下的对比度均不低于 6.8:1（测试以 4.5:1 为下限守护）。开放事项：本仓库的故事与浏览器检查没有复现“选中页签文字不可见”，悬停与焦点状态也没有变化；若产品仍遇到，需要提供风格、明暗与 DOM 结构，本次不做产品覆写。

开放事项：（1）3.1.0 的账号菜单入口闭包约 83 KB 的问题仍待 Claude 决定（见下节）。（2）HelpTip 也经门户渲染，但未做主题镜像，它在深色下是否出错未核实，留作后续检查。（3）`documentation-map.md` 中关于 3.0.0 的既有过时句子不在本次范围，未改。

## 前序：3.1.0（已发布到 npm latest，2026-10-10 16:19 +08）

2026-10-10，Owner 委托新增共享账号菜单。Claude 审核后定为：`AccountMenu` 与其三个类型只从 `@pieai/swimmer-ui-kit/liquid-presence` 导出，并需同时引入 `liquid-presence.css`，不进入根入口。头像与名字的 sm 次要按钮打开同一个液体面板（站内内容、全部产品、账号页签）；产品拥有数据、产品列表和登录/退出，组件不联网、不存储。`Tooltip` 新增可选 `align`（center / start / end）与 `placement`（top / bottom），默认外观不变。

源码提交：`f183446`（AccountMenu）、`2c985e3`（Tooltip）、`efa7936`（选择指南与接口清单）、`c5fc480`（3.1.0 版本号、更新日志与 README 状态）、`9f711ae`（3.0.0 发布记录）、`32b91e2`（账号菜单移入 liquid-presence 入口）、`d458717`（入口相关文档与生成清单）。`pnpm verify` 通过（100 个测试文件、659 项测试）；`pnpm docs:check` 通过（57 份文档，0 警告）；`pnpm build-storybook`、`check:packed` 与 `check:next-consumer` 通过。

本地候选为 `.scratch/release-3.1.0/swimmer-ui-kit-3.1.0.tgz`，源码 `d458717`（工作树干净），SHA-256 `1954dd118ce94caba0d07aeed656dd48e668a5036894b0133e726af5cb9bdd28`。它取代入口移动前的候选 `9afc973c…b887e`（菜单在根入口，未发布，已覆盖）。证据见同目录 `result.json`；截图 64 张在 `.scratch/release-3.1.0/shots/`，取自本候选的 storybook 构建，覆盖展开与收起、1280 与 390 像素、浅色与深色；390 像素无横向滚动，无页面错误。

入口体积。方法：沿打包产物的导入图累计各入口的块字节（与 `check:packed` 的 rootRuntimeBytes 同一规则；3.0.0 得到 153,332，与已记录一致）。

- 根入口 index.js：3.0.0 为 153,332 字节（gzip 44,709）；移动入口前的 3.1.0 为 179,195（gzip 52,975）；移动后为 153,482（gzip 44,908），与 3.0.0 相差 150 字节，来自 Tooltip 的新参数。
- liquid-presence 入口：3.0.0 为 57,052 字节（gzip 17,629，2 块）；移动入口前为 57,764（gzip 19,229）；移动后为 140,187（gzip 41,130，3 块）。增量约 83 KB，来自账号菜单使用的 Button（所在共享块 `Avatar-*.js`，26 KB）及液体引擎共享块 `LiquidGroup-*.js`（66 KB）。这两块与根入口是同一份文件，没有重复代码；液体预算的定义只出现在一处。消费端是否裁掉未使用的菜单代码，取决于其打包器的摇树，本次未实测。

根入口公开名字为 129 个（55 值、74 类型），与 3.0.0 相同；迁移表与接口清单由生成器重新生成，数字照生成器算出的结果保留。

开放事项：（1）账号菜单的入口闭包比上一候选的 liquid-presence 多约 83 KB，原因是它依赖 Button。若 Claude 认为 liquid-presence 的专用产品承担不起，需要决定是否改用不依赖 Button 的结构，或接受现状。（2）账号菜单自身的样式仍在 `styles.css`，因为既有的 CSS 归属检查要求 game/ 下的组件样式进入主样式表；面板的液体样式仍在 `liquid-presence.css`。

3.1.0 已于 2026-10-10 16:19（+08）由 Claude 发布到 npm `latest`，发布的 tarball 为上面的本地候选 `.scratch/release-3.1.0/swimmer-ui-kit-3.1.0.tgz`，SHA-256 `1954dd118ce94caba0d07aeed656dd48e668a5036894b0133e726af5cb9bdd28`。只读核对：registry 的 `dist.integrity`（sha512）与该候选一致；`latest` 为 3.1.0，`next` 为 3.0.0-rc.3。发布前的 `latest` 为 3.0.0。

## 前序：3.0.0 稳定版（已发布到 npm latest，2026-10-10）

2026-10-10，Owner 决定发布稳定版 3.0.0：源码与 3.0.0-rc.3 完全相同（基于提交 `c058b9f`），只把版本号改为 3.0.0，并更新 README 安装命令、更新日志与迁移说明。`pnpm verify` 通过（95 个测试文件、624 项测试，与 rc.3 相同）；`pnpm docs:check` 通过（57 份文档，0 警告）；`pnpm build-storybook`、真实打包检查 `check:packed` 与真实 Next 消费检查 `check:next-consumer` 均通过。

本地候选为 `.scratch/stable-3.0.0/swimmer-ui-kit-3.0.0.tgz`，SHA-256 `eb6cdfe9e8cdd804d10078e69acd224ba349d30fb457f9c681220b7d3a98561d`，证据见同目录 `result.json`。与 rc.3 tarball 对比：文件列表 500 项完全相同；除 `package.json`、`README.md`、`CHANGELOG.md` 三个文件外，所有文件字节一致。

3.0.0-rc.3（SHA-256 `004669ec…356`）已于 2026-10-10 发布到 npm `next`。3.0.0 已于 2026-10-10 04:48:31 UTC 由 Claude 发布到 npm `latest`，发布的 tarball SHA-256 与上述候选一致（`eb6cdfe9…`，发布后用 npm 只读下载核对）。发布后只读查询：`latest` 为 3.0.0，`next` 为 3.0.0-rc.3。下游产品仍按各自精确版本锁定，不因此自动升级。`.scratch/stable-3.0.0/result.json` 保留的是发布前记录（`published: false`），不作修改。

npm 访问：Owner 的 npm 登录（账号 `pieai`，组织 owner）现可在本机使用，下文 rc.2 节记录的“等待权限核对”阻断已解除。GitHub `npm-publish` 工作流的可信发布配置仍未核实，保留为开放事项；本次没有触发任何 GitHub 工作流。

## 前序：3.0.0-rc.3 候选（按压与待定，已发布到 next）

2026-10-10，Owner 反馈液体按压几乎不可见。本地提交依次为 `9e52771`（按压至少保持 140 毫秒）、`6c34140`（CTA 压扁 1.06 / 0.87 / 3，平面水滴压扁 1.09 / 0.80）、`b60d8cc`（Button `pending`）、`0b17020`（文档）与 `8d3cf78`（版本 3.0.0-rc.3 与更新日志）。`pnpm verify` 通过 95 个测试文件、624 项测试；storybook、docs、真实打包、packed 检查与真实 Next 消费均通过。

本地候选为 `.scratch/jelly-rc3/swimmer-ui-kit-3.0.0-rc.3.tgz`，SHA-256 `004669ec5b6dfbdaba4af3a746c8b5abd1e727c44b2147145efc3b3e0e36356b`；证据见同目录 `result.json`。本次只推送源码，没有 npm 发布，也没有触发 `npm-publish` 或其他 GitHub workflow。rc.2 候选文件保持原样，芽族仍按其哈希锁定使用；rc.3 不覆盖 rc.2。下游接入或正式发布都需要 Owner 另行授权。

2026-10-10 后续：Owner 决定后，Claude 使用 Owner 的本机 npm 登录，把上述 tarball 发布到 npm `next`（SHA-256 不变，未经 GitHub 工作流）。`latest` 未变。3.0.0 稳定版见上节。

## 前序：芽族使用本地 3.0.0-rc.2 候选，发布暂缓

2026-10-10 更新：Owner 的 npm 登录现可在本机使用，下文“权限核对”的访问阻断已解除；rc.2 发布失败的原始记录保留不变。GitHub `npm-publish` 的可信发布配置仍未核实，见上节。

2026-10-08续接确认 Owner K3：芽族先使用下方哈希锁定的本地候选完成修正与验收，分阶段本地提交；推送与 npm 发布留待后面一起处理。无需为了本地开发重新登录 npm。包本身仍未发布，下面的失败记录继续有效，但不再阻塞芽族的本地工作；不要重复触发发布。候选文件仍原样保留，修改 Kit 源码后必须另做新候选并重新验收，不静默覆盖已经验证的 tarball。

Owner 在芽族 `PLAN-YAZU-PLATFORM-RENEWAL-V1` §1 K2／§2 已授权根修、验证、普通推送并通过本仓库可信工作流发布下一候选版。本轮不动其他产品或其工作区。原生按钮 props 整包注入的编译回归在 rc.1 为红；修正共用 NativeAction 的 `rel` 类型，不在芽族打兼容补丁。证据保留 `.scratch/yazu-renewal-rc2/`。最终本地 verify 同次114.789s、94测试文件/601例全过；Storybook7.492s、docs4.214s、打包检查3.115s与真实Next消费58.091s通过，1275份输入未变。候选SHA-256 `cf6a772f09588fd4cea782649369a4bed5054c9f1fa869e9a41e1801e99a0d94`；芽族使用这个实际tgz后类型/内容检查、8项语言与账号边界测试及构建通过，不丢弃原生按钮属性。证据见该目录的 `final-validation/result.json`。2026-10-07 Owner 续接授权后普通推送成功，本地/远端实现均为 `39e3277f16b01a8d2e439aa78e91762837476de8`；发布状态见下段，不能把候选包当作已发布。

本次只触发一次 `npm-publish`：运行 `37644318828`（run attempt 1）完成全部发布前门禁，包括云端601项测试、Storybook、文档、真实打包、publint、类型消费及Next验收；2026-10-07T15:33:53Z 在 npm PUT 发布请求处返回 E404，未通过发布。完整日志及结构化结果为 `.scratch/yazu-renewal-rc2/publish-37644318828.{log,json}`。独立注册表回读仍是 next=3.0.0-rc.1、latest=2.14.0，rc.2未可见；没有重复发布或改标签。

已按中央 `.secrets/README.md` 与 cloud-platform-access 规则核对既有方式。官方 `npm trust list @pieai/swimmer-ui-kit --json --registry=https://registry.npmjs.org` 返回 E401，当前本机登录不能读取此包的可信发布配置。发布E404本身不能唯一确定根因；需要Owner恢复有此包管理权限的npm登录，再核对 GitHub组织 `PieAIStudio`、仓库 `SwimmerUIKit`、工作流文件 `npm-publish.yml`、环境条件与 `npm publish` 权限。不要获取/输出密钥、降低2FA或用私包GitHub令牌替代npm权限，也不要在缺少新证据时重跑发布。此处满足芽族计划§3.1的访问阻断，后续等待权限核对。2026-10-23 npm 网页核实本包可信发布 PieAIStudio/SwimmerUIKit · npm-publish.yml 状态 Valid；下次发布先走该工作流。

## 已发布基线：3.0.0-rc.1

S0–S14与本次预发布均已完成，计划已归档：[结构重整](../../plans/completed/PLAN-UIKIT-3-RESTRUCTURE.md)、[发布前补齐](../../plans/completed/PLAN-UIKIT-3-COMPLETION.md)。发布源提交79d1649a37f7f42d1ad89ab66f6ec844f6d678fa；工作流37173677049成功，npm独立核对next=3.0.0-rc.1、latest=2.14.0。本次新增授权只触发一次，run_attempt=1。后续文档收口提交不改变已发布包。

| 阶段 | 进度与提交                                                                                                                        | 证据                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| S0   | 完成，c9aed8b；66 源码文件 / 20,069 行，295 名字，482 测试                                                                        | .scratch/baseline/：原始构建、288 张浅深色 DPR 1 图、metrics.json                                     |
| S1   | 完成，1e720ba；只拆分归位，492 测试，295 名字不变                                                                                 | .scratch/s1/consistent-v9/ 与保存的 S0 重拍：288 张逐字节一致                                         |
| S2   | 完成，38ca91c；组件样式归位，496 测试                                                                                             | .scratch/s2/：993 条编译后原子规则等价、288 张截图一致                                                |
| S3   | 完成，6cde281、f18fe32；移除专用业务、分离特效和展厅，dark 断代，460 测试                                                         | .scratch/s3/visuals-final/：保留 238 图一致；删除故事有清单                                           |
| S4   | 完成，8442b1a；Claude 通过，危险红字、普通底色、两套红边，开关语义色；489 测试                                                    | 原评审 .scratch/s4/review/；补充 .scratch/s4/claude-amendment/，三引擎各 360 色对最低 5.036:1         |
| S5   | 完成，47d2cef：现行说明收敛为七个入口，旧业务/研究/发布回执归档；493 测试及文档、Storybook 门禁通过                               | .scratch/s5/；276 个历史工件归档，非 Markdown 字节逐一一致；351 个公开素材路径与内容不变              |
| S6   | 历史3.0.0本地候选（由rc.1接替，不再单独发布）；493 测试、文档、Storybook、实际 tarball、publint 严格检查和四入口 ESM 类型消费通过 | .scratch/s6/final/；package-check/receipt.json 记录源提交、包体校验值、351 个素材、四入口和共享块体积 |

**发布前补齐（S7–S14）**：Owner 2026-10-03 决定发布前一次解决产品接入暴露的 11 个问题，不兼容旧写法；黏土图标退场、中文默认字体用资源圆体；完成后以 `3.0.0-rc.1` 发布到 npm `next` 标签（`latest` 保持 2.14.0）。已完成任务书：[PLAN-UIKIT-3-COMPLETION](../../plans/completed/PLAN-UIKIT-3-COMPLETION.md)。下文 S6 的 `3.0.0` 本地候选由该计划的 rc.1 取代。

| 阶段 | 进度与证据                                                                                                                                                                                                                                                                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S7   | 本地提交0354542；移除五个未公开组件及所有关联代码；指南逐项覆盖全部公开值，缺行反例检查接入 verify。门禁记录：.devspace-reports/uikit-3-completion/S7/。                                                                                                                                                                 |
| S8   | 351个图片素材及复制工具退场，48个线条图标和逐图快照；独立路径子入口可裁剪，来源与许可证已登记。门禁和浅深色总览：.devspace-reports/uikit-3-completion/S8/。                                                                                                                                                              |
| S9   | 资源圆体OFL1.1允许切分，保留版权并改内部名称；四字重464块按需加载。确定性、实际字体和纯英文零中文请求的证据：.devspace-reports/uikit-3-completion/S9/。                                                                                                                                                                  |
| S10  | 四个层级与一个浮层阴影归位，旧panel别名删除；12风格控件配方不变，首页有真实层级示例。证据：.devspace-reports/uikit-3-completion/S10/。                                                                                                                                                                                   |
| S11  | 原生/路由链接、32px小号与受控LiquidPopover；新10个浏览器用例覆盖真实ref、禁用、键盘、焦点与静态预算。阶段门禁与桌面/窄屏截图：.devspace-reports/uikit-3-completion/S11/。                                                                                                                                                |
| S12  | 完成，本地提交45bdc12；展示组件静止水滴，进度条变值600ms后休眠、不占滤镜预算。十二组合与0→100记录在S12/；本次复验569测试、样式、字体与文档通过，日志在S12/resume/。                                                                                                                                                      |
| S13  | 完成，本地提交e3a96a7；完整verify与docs通过。React入口及共享分块client boundary；真实tarball通过Next16.3.8构建、启动、Server直接导入、Client液体交互、Next Link、390px减少动态与零浏览器错误检查。证据：.devspace-reports/uikit-3-completion/S13/next-consumer/；完整包体检查：.scratch/uikit-3-completion/S13/packed/。 |

S14首轮工作流37141176655在registry结构校验处失败并停止，实际发布未执行；证据保留在`.devspace-reports/uikit-3-completion/S14/`。Owner随后新增的一次授权已成功完成，证据在同级`S14-reauthorized/`：真实npm12.2.0返回夹具、29项发布保护专项、本地/云端598测试、真实包与Next门禁、推送、workflow及独立npm校验。

本轮迁移唯一入口：[migration-3.0](../migration-3.0.md)，包含 University 的主题、风格、CTA、AuthKit 验证码判断与候选验收事项。接口明细由 pnpm api:inventory 生成，数字随源更新，不从历史版本推断。

S14 当时的安装版本为精确版本`@pieai/swimmer-ui-kit@3.0.0-rc.1`（历史记录；当前稳定版见上文 3.0.0 节）。本地候选在`.scratch/uikit-3-completion/S14-reauthorized/swimmer-ui-kit-3.0.0-rc.1.tgz`；npm下载包与CI核对SHA-256为`80f3f59353ad70516e1442284793a7949007d943f0b3df3f42ed42f8b8c57681`，证据`S14-reauthorized/published-artifact.json`。本地候选哈希与云端归档哈希不同，回执明确分开；S6/S13包只作历史证据。

下一步只剩各产品自己的主动接入验收；本任务未修改任何其他仓库。正式3.0.0已由Owner于2026-10-10授权（见上文）；其他版本、再次发布或产品部署仍需新的明确授权。发布成功后短暂E404的原始观察也已保留，最终以版本和标签实际可见为准，不以publish步骤绿色代替。完整报告：`.devspace-reports/uikit-3-completion/REPORT.md`。

## 历史与边界

2.14.0 及以前已发布回执已移到[历史记录](../../archive/releases/through-2.14.0.md)，不再当作当前待办。S0 原图不覆盖，S4 原评审图与补充复验分开；历史证据归档保留字节，不算当前产品验收。

源仓库、提交/推送、npm 发布、消费产品验收是四件事。保存代码不触发 Actions 或 Vercel；不要把新版本号、tarball 或绿色测试说成已经上线。
