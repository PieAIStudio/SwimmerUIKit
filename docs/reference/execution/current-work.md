---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-10-03
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

## 3.0 大手术

S0–S6按[PLAN-UIKIT-3-RESTRUCTURE](../../plans/active/PLAN-UIKIT-3-RESTRUCTURE.md)完成。原计划停在本地候选；其等待发布状态已由下方Owner 2026-10-03的S7–S14授权覆盖。继续在main分阶段提交，仅修改UIKit；版本事实看package.json，产品接入不属于本仓库验收。

| 阶段 | 进度与提交 | 证据 |
| --- | --- | --- |
| S0 | 完成，c9aed8b；66 源码文件 / 20,069 行，295 名字，482 测试 | .scratch/baseline/：原始构建、288 张浅深色 DPR 1 图、metrics.json |
| S1 | 完成，1e720ba；只拆分归位，492 测试，295 名字不变 | .scratch/s1/consistent-v9/ 与保存的 S0 重拍：288 张逐字节一致 |
| S2 | 完成，38ca91c；组件样式归位，496 测试 | .scratch/s2/：993 条编译后原子规则等价、288 张截图一致 |
| S3 | 完成，6cde281、f18fe32；移除专用业务、分离特效和展厅，dark 断代，460 测试 | .scratch/s3/visuals-final/：保留 238 图一致；删除故事有清单 |
| S4 | 完成，8442b1a；Claude 通过，危险红字、普通底色、两套红边，开关语义色；489 测试 | 原评审 .scratch/s4/review/；补充 .scratch/s4/claude-amendment/，三引擎各 360 色对最低 5.036:1 |
| S5 | 完成，47d2cef：现行说明收敛为七个入口，旧业务/研究/发布回执归档；493 测试及文档、Storybook 门禁通过 | .scratch/s5/；276 个历史工件归档，非 Markdown 字节逐一一致；351 个公开素材路径与内容不变 |
| S6 | 历史3.0.0本地候选（由rc.1接替，不再单独发布）；493 测试、文档、Storybook、实际 tarball、publint 严格检查和四入口 ESM 类型消费通过 | .scratch/s6/final/；package-check/receipt.json 记录源提交、包体校验值、351 个素材、四入口和共享块体积 |

**发布前补齐（S7–S14）**：Owner 2026-10-03 决定发布前一次解决产品接入暴露的 11 个问题，不兼容旧写法；黏土图标退场、中文默认字体用资源圆体；完成后以 `3.0.0-rc.1` 发布到 npm `next` 标签（`latest` 保持 2.14.0）。任务书：[PLAN-UIKIT-3-COMPLETION](../../plans/active/PLAN-UIKIT-3-COMPLETION.md)。下文 S6 的 `3.0.0` 本地候选由该计划的 rc.1 取代。

| 阶段 | 进度与证据 |
| --- | --- |
| S7 | 本地提交0354542；移除五个未公开组件及所有关联代码；指南逐项覆盖全部公开值，缺行反例检查接入 verify。门禁记录：.devspace-reports/uikit-3-completion/S7/。 |
| S8 | 351个图片素材及复制工具退场，48个线条图标和逐图快照；独立路径子入口可裁剪，来源与许可证已登记。门禁和浅深色总览：.devspace-reports/uikit-3-completion/S8/。 |
| S9 | 资源圆体OFL1.1允许切分，保留版权并改内部名称；四字重464块按需加载。确定性、实际字体和纯英文零中文请求的证据：.devspace-reports/uikit-3-completion/S9/。 |
| S10 | 四个层级与一个浮层阴影归位，旧panel别名删除；12风格控件配方不变，首页有真实层级示例。证据：.devspace-reports/uikit-3-completion/S10/。 |
| S11 | 原生/路由链接、32px小号与受控LiquidPopover；新10个浏览器用例覆盖真实ref、禁用、键盘、焦点与静态预算。阶段门禁与桌面/窄屏截图：.devspace-reports/uikit-3-completion/S11/。 |
| S12 | 完成，本地提交45bdc12；展示组件静止水滴，进度条变值600ms后休眠、不占滤镜预算。十二组合与0→100记录在S12/；本次复验569测试、样式、字体与文档通过，日志在S12/resume/。 |
| S13 | 完成，本地提交e3a96a7；完整verify与docs通过。React入口及共享分块client boundary；真实tarball通过Next16.3.8构建、启动、Server直接导入、Client液体交互、Next Link、390px减少动态与零浏览器错误检查。证据：.devspace-reports/uikit-3-completion/S13/next-consumer/；完整包体检查：.scratch/uikit-3-completion/S13/packed/。 |

S14首轮提交9ec1463已推送。工作流37141176655在发布前registry检查失败，npm publish未执行，latest仍为2.14.0；原始回执保留在`.devspace-reports/uikit-3-completion/S14/`。Owner随后明确再授权一次，仍只发布3.0.0-rc.1到next，失败即停。新增证据独立保存在`S14-reauthorized/`，不覆盖首轮失败。

本轮迁移唯一入口：[migration-3.0](../migration-3.0.md)，包含 University 的主题、风格、CTA、AuthKit 验证码判断与候选验收事项。接口明细由 pnpm api:inventory 生成，数字随源更新，不从历史版本推断。

S6旧候选及负例保留在`.scratch/s6/final/`，只作历史证据，不再用于新接入。S13消费端验收包在`.scratch/uikit-3-completion/S13/candidate.tgz`，仍是中间3.0.0版本；S14会生成最终3.0.0-rc.1包并重新跑完整门禁。每个回执绑定实际tarball与SHA-256，不能用旧的绿色结果替代后续修改的验证。

再授权轮已用CI同版npm12.2.0复现：成功查询返回单元素数组，旧检查器按对象读取而误拒绝；候选精确版本查询返回E404。检查器现保留每条查询的目标、退出码与原始输出，只允许成功包查询加版本特定E404继续，其他查询故障一律拦截。真实返回已逐字节加入回归夹具；发布前重新跑完整门禁。工作流固定npm12.2.0，仍禁rerun，本次新增授权仅可触发一次。最终结果写入.devspace-reports/uikit-3-completion/REPORT.md；发布成功后才归档计划。

## 历史与边界

2.14.0 及以前已发布回执已移到[历史记录](../../archive/releases/through-2.14.0.md)，不再当作当前待办。S0 原图不覆盖，S4 原评审图与补充复验分开；历史证据归档保留字节，不算当前产品验收。

源仓库、提交/推送、npm 发布、消费产品验收是四件事。保存代码不触发 Actions 或 Vercel；不要把新版本号、tarball 或绿色测试说成已经上线。
