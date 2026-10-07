---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-10-07
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

## 当前：芽族接入修复候选 3.0.0-rc.2（npm 发布受阻）

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

当前安装使用精确版本`@pieai/swimmer-ui-kit@3.0.0-rc.1`。本地候选在`.scratch/uikit-3-completion/S14-reauthorized/swimmer-ui-kit-3.0.0-rc.1.tgz`；npm下载包与CI核对SHA-256为`80f3f59353ad70516e1442284793a7949007d943f0b3df3f42ed42f8b8c57681`，证据`S14-reauthorized/published-artifact.json`。本地候选哈希与云端归档哈希不同，回执明确分开；S6/S13包只作历史证据。

下一步只剩各产品自己的主动接入验收；本任务未修改任何其他仓库。正式3.0.0、其他版本、再次发布或产品部署都需要新的明确授权。发布成功后短暂E404的原始观察也已保留，最终以版本和标签实际可见为准，不以publish步骤绿色代替。完整报告：`.devspace-reports/uikit-3-completion/REPORT.md`。

## 历史与边界

2.14.0 及以前已发布回执已移到[历史记录](../../archive/releases/through-2.14.0.md)，不再当作当前待办。S0 原图不覆盖，S4 原评审图与补充复验分开；历史证据归档保留字节，不算当前产品验收。

源仓库、提交/推送、npm 发布、消费产品验收是四件事。保存代码不触发 Actions 或 Vercel；不要把新版本号、tarball 或绿色测试说成已经上线。
