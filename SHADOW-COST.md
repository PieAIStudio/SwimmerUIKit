# 外阴影搬出 SVG 滤镜：2.0.0 实测记录

日期：2026-08-30  
分支：`work/shadow-cost`  
对照：kit 1.11.3 → 2.0.0；donor `3862ffa`；产品 University 只读，钉在已发布的 1.11.3。

证据分层必须当真。下面每一张表都标了来源。标了「未测」的没有升格。

| 标记 | 含义 |
| --- | --- |
| **【我实测的】** | 本轮打开了页面或跑了测试，数字来自 DOM / 构建产物 / 截图。 |
| **【我从源码推断的】** | 对着文件读出来的，或用实测宽高乘实测 pad 推的改后产品面积。产品仓库没有改，无法在 University 里读到 2.0.0 的 live `data-liquid-filter-area`。 |
| **【未测】** | 本轮没有做。包括帧率（按任务要求不报）。 |

截图在 `artifacts/shadow-cost/`。

---

## 1. 做了什么

把无 spread 的外阴影从 SVG `feGaussianBlur` 挪到剪影 SVG 的 CSS `drop-shadow()`，并从 pad 里拿掉。`inset` 和 spread 仍在 SVG 滤镜里。剪影加上 `will-change: filter, transform`。

donor 的理由在 `Gooey.tsx`：类 iPhone 3x 上，SVG 大半径模糊会把整块 padded 区域每帧 CPU 栅格化。**【未测 fps】** 本机同时在跑别的代理，帧时间是噪音；本轮只报面积、primitive、pad。

---

## 2. 视觉：改前改后看不出差别才算成功

**【我实测的】** Storybook iframe 截图，Chromium。

| 表面 | 改前 | 改后 | 我看见的 |
| --- | --- | --- | --- |
| 分段控件（可见外阴影） | `before-segmented-default.png` | `after-segmented-default.png` | 棕色外阴影的位置、柔和度、颜色对得上。点 Daily 后 follow 仍带动，`after-segmented-daily.png`。 |
| 进度条（轨道 `overflow: hidden`） | `before-progress-default.png` | `after-progress-default.png` | 外阴影仍然看不见。顶缘那条 inset 高光还在。 |
| 合并液滴（外阴影跟合并轮廓） | `before-stroke-and-shadow.png` | `after-stroke-and-shadow.png` | 一个共享光晕围着合并后的 8 字，不是两坨各投各的。 |
| 拆开 | （改前没拍拆开） | `after-stroke-and-shadow-split.png` | 拆开后两颗各自有一圈，因为它们是同一张 SVG 上两块不连的 alpha；滤镜仍是组上那一条 `drop-shadow()`，不是每颗一个。 |
| 再合并 | | `after-stroke-and-shadow-remerged.png` | 又回到一圈共享光晕。 |
| 无外阴影对照 | `before-merging-pieces.png` | `after-merging-pieces.png` | 这条故事没有 `shadow`，面积和 primitive 未变。 |

`drop-shadow()` 作用在已经滤完的 SVG 结果上，所以 goo 颈的阴影跟着颈走。这不是理论上确认：合并态截图里只有一圈贴着 8 字的光晕。

inset `0 2px 0` 没有一起搬走。分段指示器和进度条顶缘的黏土高光都还在。

---

## 3. 面积、primitive、pad：改前改后都是实测

计数方式：`filter.children.length`（和 `EDGE-QUALITY.md` 1.11.3 现场指示器同一口径）。pad 取 `filter` 的 `|x|`。

### 3.1 Storybook（kit 热更新前后各读一次）

**【我实测的】**

| 表面 | 尺寸 CSS px | 改前 pad | 改后 pad | 改前面积 | 改后面积 | 改前 prim | 改后 prim | 改前 `stdDeviation=13` | 改后 CSS `filter` |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 分段底 `.game-ui-segmented-surface` | 281×52 | 124 | 74 | 158 700 | 85 800 | 20 | 16 | 1 | `drop-shadow(rgba(76,52,28,0.22) 0px 13px 26px)` |
| 分段指示器 `.game-ui-segmented-follow` | 281×52 | 102 | 52 | 124 160 | 60 060 | 15 | 11 | 1 | 同上 |
| 进度条 `.game-ui-progress-liquid` | 见下 | 101 | 51 | 见下 | 见下 | 15 | 11 | 1 | 同上 |
| StrokeAndShadow 合并 | 644×220 | 132 | 89 | 439 472 | 327 156 | 16 | 12 | 0（那层是 22px → σ=11） | `drop-shadow(... 0px 10px 22px)` |
| MergingPieces（无外阴影） | 644×220 | 80 | 80 | 305 520 | 305 520 | 9 | 9 | 0 | none |

进度条 Storybook 改前改后画布宽度不同（先 1163.8，后把 viewport 设成 1440 变成 1323.8），所以面积不能直接减。**pad 和 primitive 与宽度无关**：101 → 51，15 → 11。用改前那个宽度重算改后面积：

**【我从源码推断的】** 1164×14、pad 51 → `(1164+102)×(14+102) = 146 856`（改前实测 295 056，约一半）。

Primitive 少掉的 4 个正好是外阴影那条 `ShadowPass`：`feGaussianBlur@13` + `feOffset` + `feFlood` + `feComposite`。inset 的 `feOffset dy=2` 还在。

### 3.2 产品页 live `data-liquid-filter-area`（University 1.11.3，改前）

**【我实测的】** 打开 `http://127.0.0.1:9998/`，delivery 模式，viewport 先默认再 1440×900。每组都读了 `data-liquid-filter-area`、`filter` 的 pad、`filter.children.length`。审计那份是公式，这里升成 live DOM。

| 页 | 表面 | 实测尺寸 | 实测面积 | 占 480 000 | pad | prim | 父级 overflow |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| `/catalog` | 进度条 | 146.7×14 | 75 384 | 15.7% | 101 | 15 | hidden |
| `/planet` | 进度条 ×7 | 146.7–235.3×14 | 75 384–94 392 | 16–20% | 101 | 15 | hidden |
| `/library` | 进度条 | 146.7×14 | 75 384 | 15.7% | 101 | 15 | hidden |
| `/library` | 分段底 | 464×52 | 213 600 | 44.5% | 124 | 20 | visible |
| `/library` | 分段指示器 | 464×52 | 171 008 | 35.6% | 102 | 15 | visible |
| `/plans` | 分段底 / 指示器 | 136×52 | 115 200 / 87 040 | 24% / 18% | — | 20 / 15 | — |
| `/quests` | 进度条 ×4（不含顶栏那根） | 523–527×14 | 156 600–157 464 | 33% | 101 | 15 | hidden |

所有产品进度条和分段指示器改前都有 1 个 `stdDeviation="13"` 的 SVG 模糊。进度条父级 `overflow: hidden`，26px 外阴影在 14px 轨道上几乎不可见，面积照付。这是审计 3.2 / 3.3 的 live 证实。

产品里没有一根进度条接近审计公式的 750px 桌面课文宽。最宽的 live 进度条是 `/quests` 的 527px（33% 预算）。课文工具条那根本轮没登录到课文阅读器，**【未测】**。

### 3.3 产品改后面积（不能 live 读，用实测尺寸 × kit 实测新 pad）

University 仍依赖已发布的 1.11.3，本轮按任务没有改产品代码，所以没有 2.0.0 的产品 live 属性。

**【我从源码推断的】** 用 §3.2 的实测宽高，乘 §3.1 同类表面的实测新 pad。

| 表面 | 实测尺寸 | 改前实测面积 | 改后推算 | 改后占预算 |
| --- | ---: | ---: | ---: | ---: |
| 目录进度条 | 147×14 | 75 384 | `(147+102)×116 = 28 884` | 6.0% |
| 行星行进度条 | 235×14 | 94 392 | `(235+102)×116 = 39 092` | 8.1% |
| 任务进度条 | 527×14 | 157 464 | `(527+102)×116 = 72 964` | 15.2% |
| 图鉴分段底 | 464×52 | 213 600 | `(464+148)×200 = 122 400` | 25.5% |
| 图鉴分段指示器 | 464×52 | 171 008 | `(464+104)×156 = 88 608` | 18.5% |

审计公式里 750×14 占 43%、搬走后 21%：**本轮没有 750px 的 live 条**。Storybook 进度条改前 1164×14 实测 295 056（61.5%），用同一宽度和新 pad 是 146 856（30.6%）。方向和审计一致，数字是实测或实测尺寸推的，不是审计那张公式表的拷贝。

超预算临界：**【我从源码推断的】** 14px 条、pad 51 时 `(W+102)×116 > 480 000` → **W ≳ 4036px**。改前 pad 101 时是 W ≳ 2020px（审计公式；本轮用实测 pad 101 重算：`(W+202)×216 > 480 000` → W ≳ 2021px，对得上）。

---

## 4. 预算降级仍然有效

**【我实测的】** 浏览器测试挂了一根 `4300×14`、`motion="follow"`、带 `--game-ui-shadow-button` 的组：

- `data-liquid-filter-area` > 480 000
- `data-liquid-motion="static"`
- `console.warn` 含 `the liquid animation budget is insufficient (the filter-area limit is exceeded)`

降级后仍画 SVG 剪影，只是 Move 不再跟。样子可接受：静止的液条，不是空白。改完之后仍然存在一个能触发降级的尺寸，只是比以前更宽。

---

## 5. 附带任务

### A. 两条 `import.meta.env.DEV` 警告

**【我实测的】** 1.11.3 的 `dist/index.js` 里搜不到

- `LiquidGroup.Item children should not have their own border`
- `dissolve is ignored for effect="move"`

预算那两条还在。发布包里子项误用 border，University 不会响。

`scripts/check-warnings-survive-build.mjs` 现在按 id 检查四条。扩展之后，先对着 1.11.3 产物跑，失败并点名 `[item-border]` 和 `[dissolve-on-move]`。源码修好后，再故意把 DEV 门控加回去、重建，检查再次失败并点名同一对；然后改回来。

针要避开引号：压缩器会把 `effect="move"` 写成 `effect=\"move\"`，整句 `includes` 会假失败。针改成 `dissolve is ignored for effect=`。修好后 `pnpm verify` 通过（255 tests，`warnings survive the build: ok (4 checked)`）。

### B. `effect="move"` 是空壳：去掉，不实现

判断：去掉公开类型里的 `'move'`。

理由：

1. kit 已经有可用的 Move 入口：组级 `motion="follow"`。产品里的进度前缘和分段指示器用的就是它。
2. 实现 item 级 Move + `MoveTuning` 是新功能（审计 M5），耦合 donor 那套被拒绝的 observer。产品零调用。这一轮的主任务是阴影性能，不是第二条 Move API。
3. **一个接受参数却不做事的 API，比没有这个 API 更糟。** 公开 union 写着 `'move'`，运行时丢掉它、静默走 Morph。照着 donor README 写的人得不到他要的东西，也没有任何提示。

去掉是破坏性变更，进 2.0.0。TypeScript 现在会报错。运行时如果还传入这个字符串，会警告「用 `motion="follow"`」；`dissolve` 在这条遗留路径上仍然忽略。

不实现 item Move 的决定写在 `donors-individual.md` 的「仍然漏掉」里，没有事后写成「当初就拒绝了」。

### C. 漏记

`donors-individual.md`、lock、NOTICE、CHANGELOG 已同步。漏掉的写成漏掉。本轮修了 M1/M2/M11 和 M5 的 API 谎言；M3/M4/M6/M7/M8/M9 暂不做，理由是产品没有调用点。M10（静止时 `flowSpeed` 搅动）记成有意的无环境钟改编，补进 `rejectedScope`，并写明是 2026-08-30 才记下的，不是当初的拒绝。

---

## 6. 我没做的

- **【未测】** 帧率、donor 声称的 9fps。
- **【未测】** 课文阅读器工具条上那根更宽的进度条（没登录进课文）。
- **【未测】** 复跑 `EDGE-QUALITY.md` 的 rim 度量。1.11.3 的虚线修的是 inset，inset 这一轮没搬。
- **【未测】** University 跑 2.0.0 之后的 live `data-liquid-filter-area`。产品升级包是你的发布步骤。

---

## 7. 验证

- `pnpm format` / `typecheck` / 相关单测和浏览器测试
- 故意复现 DEV 门控 → `check-warnings-survive-build.mjs` 失败并点名
- `pnpm verify`（含 `build`，build 会跑警告检查）
- 视觉：Storybook 改前改后截图

没有发布到 npm。
