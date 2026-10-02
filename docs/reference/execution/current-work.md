---
id: REF-CURRENT-WORK
title: Current Work
type: reference
status: active
canonical: true
owner: human
created: 2026-07-02
last_reviewed: 2026-10-02
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

任务书：[PLAN-UIKIT-3-RESTRUCTURE](../../plans/active/PLAN-UIKIT-3-RESTRUCTURE.md)。Owner 批准干净断代、main 分阶段提交；没有授权发布 npm 或修改产品仓库。版本事实只看 package.json；发布前由 Claude 在 University 安装候选并跑完整门禁，再交 Owner 决定。

| 阶段 | 进度与提交 | 证据 |
| --- | --- | --- |
| S0 | 完成，c9aed8b；66 源码文件 / 20,069 行，295 名字，482 测试 | .scratch/baseline/：原始构建、288 张浅深色 DPR 1 图、metrics.json |
| S1 | 完成，1e720ba；只拆分归位，492 测试，295 名字不变 | .scratch/s1/consistent-v9/ 与保存的 S0 重拍：288 张逐字节一致 |
| S2 | 完成，38ca91c；组件样式归位，496 测试 | .scratch/s2/：993 条编译后原子规则等价、288 张截图一致 |
| S3 | 完成，6cde281、f18fe32；移除专用业务、分离特效和展厅，dark 断代，460 测试 | .scratch/s3/visuals-final/：保留 238 图一致；删除故事有清单 |
| S4 | 完成，8442b1a；Claude 通过，危险红字、普通底色、两套红边，开关语义色；489 测试 | 原评审 .scratch/s4/review/；补充 .scratch/s4/claude-amendment/，三引擎各 360 色对最低 5.036:1 |
| S5 | 完成：现行说明收敛为七个入口，旧业务/研究/发布回执归档；493 测试及文档、Storybook 门禁通过 | .scratch/s5/；276 个历史工件归档，非 Markdown 字节逐一一致；351 个公开素材路径与内容不变 |
| S6 | 待执行：3.0.0 本地候选与包体验收 | 到候选就停，发布需 Owner 明确批准 |

本轮迁移唯一入口：[migration-3.0](../migration-3.0.md)，包含 University 的主题、风格、CTA、AuthKit 验证码判断与候选验收事项。接口明细由 pnpm api:inventory 生成，数字随源更新，不从历史版本推断。

## 历史与边界

2.14.0 及以前已发布回执已移到[历史记录](../../archive/releases/through-2.14.0.md)，不再当作当前待办。S0 原图不覆盖，S4 原评审图与补充复验分开；历史证据归档保留字节，不算当前产品验收。

源仓库、提交/推送、npm 发布、消费产品验收是四件事。保存代码不触发 Actions 或 Vercel；不要把新版本号、tarball 或绿色测试说成已经上线。
