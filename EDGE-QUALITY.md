# 液态边缘毛刺：测量报告

版本：`1.11.2`。产品滤镜 **没有改**。复现：`node artifacts/edge-quality/measure-liquid-edge.mjs`（需 Storybook `http://127.0.0.1:6006`）。原始表：`artifacts/edge-quality/metrics.json`。

## 这一轮的结论

主人看见的毛刺，主要不是剪影台阶。`r(θ)` 锯齿已经贴在干净矢量圆的地板上（0.137 vs 0.126）。真正扎眼的是 **沿轮廓断续的淡青高光**。

那条线 **不是描边**。青色分段指示器没有 `stroke`。它是黏土 inset 高光：`--game-ui-shadow-button` 的第二层 `inset 0 2px 0 rgba(255, 255, 255, 0.42)`，经 `BINARIZE` + `feOffset dy=2` + `bin OUT offset` 画在填色上面。顶部是连续的 2px 亮带（这是设计）；东西两侧的虚线，是二值化位移边和它下移 2px 的副本对不齐，漏出来的碎点。

`feMorphology` **没有**出现在这条产品链上（spread=0）。硬边来自 `BINARIZE`（α 斜率 60）和 `feOffset`，不是形态学。

2× 超采样实验做了。CSS `transform: scale(0.5)` 的 2× SVG **没有**提高滤镜栅格分辨率，布局尺寸上锯齿、起伏、rim 数字与 1× 相同。把真正的 4× 栅格双线性缩回布局尺寸：锯齿降到矢量圆地板（0.137 → 0.124），起伏仍在 1.08；rim 虚线略为连上（breaks 2.51 → 1.67），东侧高光并不消失。目标锯齿 ≤ 0.07 在 dpr=2 的布局尺寸上 **低于干净圆的地板**，达不到。

2× 的面积 ×4 也付不起：青色指示器实测滤镜面积 124 160，×4 = 496 640，超过 480 000；WavinessDefault 舞台 327 888，×4 = 1 311 552。结论是「这个修法在这个尺寸付不起」，不是悄悄把别处的质量降下来。

## 淡青虚线是什么（file:line）

消融（同一 150px 青圆，生产 waviness 链）：

| 样本 | 淡青高光 | 10× 东 |
| --- | --- | --- |
| `baseline`（只有填色 + 位移） | 无（rim=0） | `crops/baseline-east-nn10.png` 只有色边，没有亮线 |
| `wavy-stroke`（1px 描边，无 inset） | 无（rim=0） | `crops/wavy-stroke-east-nn10.png` 是一条 **深褐** 带 |
| `wavy-inset`（只有 inset，无描边、无外阴影） | **就是它**（rim=0.47，北=1，南=0，东=0.44） | `crops/wavy-inset-east-nn10.png` 淡青虚线 |
| `wavy-shadow-full`（完整 `--game-ui-shadow-button`） | 与 `wavy-inset` 相同 | 外阴影不贡献淡青 |
| 现场青色指示器 | 与 `wavy-inset` 相同（rim=0.50，breaks=2.64） | `crops/story-segmented-teal-east-nn10.png` |

现场 SVG 滤镜（Storybook `MoveIndicator`，`.game-ui-segmented-follow`）16 个 primitive，**没有** `feMorphology`，**没有** stroke：

1. 填色位移链 6 步，与 1.11.1 相同。
2. `feColorMatrix` `BINARIZE` = `0 0 0 60 -29.5` → `bin`。  
   `src/liquidGooeyFilter.tsx:14` 矩阵，`:216-217` 因为 `shadow.inset` 为真而启用。
3. 外阴影：`in="shape"`（抗锯齿剪影）模糊 13 + 下移 13 + `rgba(76, 52, 28, 0.22)`。
4. **InsetPass**：`feOffset in="bin" dy="2"`，然后 `feComposite in="bin" in2=offset operator="out"`，`feFlood rgba(255,255,255,0.42)`，再 `in` 到 band。  
   `src/liquidGooeyFilter.tsx:28-77`（`:43-54` offset，`:67` out，`:68-75` 填色）。
5. `feMerge` 把 inset 叠在 `shape` 之上。`:238-240`。

谁把这个 shadow 传进去：

- `src/GameSurfaces.tsx:258` — 青色 follow 指示器 `shadow="var(--game-ui-shadow-button)"`，**没有** `stroke`。
- `src/theme.css:161-162` — `0 13px 26px rgba(76, 52, 28, 0.22), inset 0 2px 0 rgba(255, 255, 255, 0.42)`。
- `src/liquidGooeyShadow.ts:37-60` — `parseShadow`。

上一轮写「青色没有描边，描边链解释不了青色」——描边那句是对的，漏掉了 inset。Donor 自己的注释（`packages/liquid-gooey/src/filter.tsx:19-22`）说 offset-only inset 必须只在 **顶边** 留一条，侵蚀四周会画出假环。产品链没做侵蚀；虚线来自 **二值边的台阶和 dy=2 的副本对不齐**，在接近竖直的东缘漏出 1px 碎点。白 42% 盖在 `#1d9a8b` 上就是淡青 `~rgb(150, 208, 200)`，和现场像素一致。

透明底截图会把半透明 inset 像素拍成不透明亮点，虚线被放大。黏土地上同一颗药丸（`captures/story-segmented-on-clay.png`）顶部是连续亮带，东缘是跟着台阶走的较淡一圈，没有彩虹晕。主人在真界面上看到的更接近黏土裁块，不是透明底那条霓虹虚线。

## 新度量：沿轮廓的高光连续度

`r(θ)` 量的是剪影半径。一条贴着轮廓的亮线可以断成虚线而不移动 `r(θ)`。所以在用任何实验当关卡之前，先标定 rim。

沿 720 个角向仓，从轮廓外 1.2 CSS px 走到内 4 CSS px。只看 α≥160 的像素（不把透明边当高光）。相对内部填色亮度的峰值超额 ≥ 18 记为 **有高光**。

| 度量 | 定义 |
| --- | --- |
| **rim 出现率** | 有高光的仓 / 720 |
| **北 / 东 / 南 出现率** | 同上，限制在 250–290°、340–20°、70–110°（屏幕 y 向下，北 = 顶） |
| **breaks / 100 CSS px** | 有↔无翻转次数 / 周长 × 100。连续线 ≈ 0，虚线很大 |
| **平均有/无段长** | 连续「有」或「无」段的弧长（CSS px） |

阈值 18 的依据：inset 超额约 50–70；填色-only 的不透明像素超额 ≤ 1.4。

### 标定（先于任何关卡）

同一 150px 青圆，无 goo（除 `cal-inset-bin` / `cal-css-inset`）：

| 样本 | 出现率 | 北 | 东 | 南 | breaks/100 | 10× |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 无高光 `cal-circle` | 0 | 0 | 0 | 0 | 0 | `crops/cal-circle-east-nn10.png` |
| 连续满圈 1.5px 白描边 `cal-rim-ring` | **1.00** | 1 | 1 | 1 | **0** | `crops/cal-rim-ring-east-nn10.png` |
| 虚线满圈 `cal-rim-dashed`（dash 5 4） | 0.63 | 0.61 | 0.63 | 0.65 | **22.1** | `crops/cal-rim-dashed-east-nn10.png` |
| 0.35px 发丝 `cal-rim-hairline` | 1.00 | 1 | 1 | 1 | 0 | `crops/cal-rim-hairline-east-nn10.png` |
| CSS `inset 0 2px 0` `cal-css-inset` | 0.48 | 1 | 0.40 | 0 | 0.85 | `crops/cal-css-inset-north-nn10.png` |
| 同一 inset，走 `BINARIZE`+offset `cal-inset-bin` | 0.47 | 1 | 0.36 | 0 | **3.78** | `crops/cal-inset-bin-east-nn10.png` |
| 生产填色 `baseline` | 0 | 0 | 0 | 0 | 0 | — |

度量能把连续满圈（breaks=0）和虚线满圈（breaks=22）分开。发丝 0.35px 在 dpr=2 上 **没有** 断成虚线——「亚像素亮线必然锯成虚线」在这个阈值、这个 DPR 上不成立。产品虚线不是那种机制。

CSS inset 与 `BINARIZE` inset 都是顶带（北=1，南=0）。`BINARIZE` 的 breaks 是 CSS 的 4 倍（3.78 vs 0.85）：即使是干净圆，二值 offset 也比浏览器原生 inset 更结巴。这是画法，不是 waviness。

产品 `wavy-inset`：出现率 0.47，北=1，南=0，东=0.44，breaks=2.51。形状是顶带 + 东侧漏点，不是满圈虚线。

## 超采样实验

上一轮 4× 再栅格把锯齿报到 0.031，是把 **高分辨率栅格换算成 CSS 像素**（1 device px = 0.125 CSS px）。那是「假如有 4× 屏」，不是「画大再缩回布局尺寸」。

| 样本 | 锯齿 | 起伏 | rim | 东 | breaks | 面积（布局 → 若按栅格计） |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| `baseline` 1× | 0.137 | 1.095 | 0 | 0 | 0 | 108 900 |
| `baseline-2x`（SVG 2× + CSS scale 0.5） | **0.137** | **1.095** | 0 | 0 | 0 | 108 900 → 435 600 |
| `baseline-4x`（量 4× 栅格，不缩小） | 0.031 | 1.085 | 0 | 0 | 0 | → 1 742 400，超预算 |
| `baseline-4x-down`（4× PNG 双线性缩到 230 CSS） | **0.124** | 1.085 | 0 | 0 | 0 | 同上 ×16 才换来布局地板 |
| 干净矢量圆地板 | 0.126 | 0.045 | 0 | 0 | 0 | — |
| `wavy-inset` 1× | 0.136 | 1.092 | 0.47 | 0.44 | 2.51 | 111 556 |
| `wavy-inset-2x`（CSS scale） | **0.136** | **1.092** | **0.47** | **0.44** | **2.51** | → 446 224 |
| `wavy-inset-4x-down` | 0.121 | 1.083 | 0.48 | 0.46 | 1.67 | ×16 |
| 关卡 | ≤ 0.07 | 1.09±10% | 虚线应消失或连成连续线 |  |  | ≤ 480 000 |

CSS 2× 变换 **没有** 超采样滤镜：质量、边数、锯齿、rim 与 1× 相同（像素 RGB 有差，α≥128 等值线没有）。Blink 在 CSS transform 之后按输出分辨率栅格化 `feDisplacementMap`。

真 4× 再缩小：

- 锯齿 0.137 → 0.124，到矢量圆地板。**到不了 0.07**——0.07 低于 dpr=2 上干净圆的 0.126。
- 起伏 1.095 → 1.085，不规则还在。
- rim breaks 2.51 → 1.67，东侧虚线变软、略连（`crops/wavy-inset-4x-down-east-nn10.png`），出现率几乎不动。不是「连成一圈连续亮线」，也不是「东侧漏点消失」。

### 预算（现场面积，不是孤立圆）

| 组 | 布局 CSS | 滤镜面积 | ×4 |
| --- | --- | ---: | ---: |
| 青色 follow 指示器 | 281×52 | **124 160** | **496 640 > 480 000** |
| 分段底槽 | 281×52 | 158 700 | 634 800 |
| WavinessDefault 舞台 | 652×220 | **327 888** | **1 311 552** |
| 孤立 150px 圆、无外阴影 | 230×230 pad 50 | 108 900 | 435 600（小控件才刚够） |

kit 的 `data-liquid-filter-area` 按布局算，看不见内部 2× 栅格。按真实光栅工作量，青色指示器的 2× 已经超预算。诚实的句子：**这个修法在这个尺寸付不起**。

次数：2× 不加 primitive（仍 6 步填色 / 12 步带 inset / 现场 16 步含外阴影）。多出来的是分辨率，付不起。

对照（不是候选，只说明画法）：`wavy-inset-aa` 用抗锯齿 `shape` 而不是 `bin` 做 inset，breaks 2.51 → 1.25，10× 东缘是软带而不是碎点（`crops/wavy-inset-aa-east-nn10.png`），锯齿 0.139（略差），起伏 1.087。零面积代价。它不满足「锯齿和 rim 同时过关」，所以没进产品。若以后只修高光，这是比超采样便宜的画法。

## 上一轮仍然成立（噪声假设已死）

毛刺 **不是** `feTurbulence` 低频色块。生产噪声是光滑 Perlin；4× 用户空间再栅格把锯齿按 CSS px 除以 4，起伏不动。1.11.1 的 0.5px 后模糊把锯齿从 0.174 降到 0.137（−21%），起伏 1.102 → 1.095。再糊、预糊、改 octave / 频率，要么数字不动，要么剪影变脏。详见本文件更早的版本；脚本不再重跑那些变体，旧图仍在 `artifacts/edge-quality/captures/`。

起伏度量照旧：砸扁形状会把起伏带到 ~0.03。过关必须起伏留在基线 ±10%。这次所有超采样样本都留在 1.08–1.09。

## 还剩什么

1. **剪影台阶。** 在 dpr=2 的布局尺寸上，已经离干净圆 0.01 CSS px。再降锯齿要么换更高输出分辨率（付不起），要么接受地板。不要再拧噪声参数。
2. **Inset 高光的画法。** 虚线是 `BINARIZE`+`feOffset` 在位移台阶上的泄漏，不是亚像素描边走样。超采样整条滤镜能把碎点糊软，但 2× 已经超预算。剩下的修法是 **换一种画顶高光的方式**（从抗锯齿 `shape` 取差，或不用二值 mask），而不是在位移后再加糊、也不是把 waviness 拧小。
3. `WavinessDefault` 的描边仍走 `BINARIZE` + `feMorphology`。那是另一条硬边，与青色指示器无关。形态学没有抗锯齿；若主人指的是米色描边故事，下游超采样修不好，只能换画法。

## 给主人看的图

请自己看。10× 是最近邻，没有双线性把台阶糊掉。

| 你在看什么 | 路径 |
| --- | --- |
| 真界面上的青色药丸（黏土地，不是透明底） | `artifacts/edge-quality/captures/story-segmented-on-clay.png` |
| 同上，东缘 10×：较淡的边跟着台阶走 | `artifacts/edge-quality/crops/story-segmented-on-clay-east-nn10.png` |
| 同上，顶缘 10×：连续的 2px 黏土高光 | `artifacts/edge-quality/crops/story-segmented-on-clay-north-nn10.png` |
| 透明底把半透明 inset 拍成霓虹虚线（过曝，不是真界面） | `artifacts/edge-quality/crops/story-segmented-teal-east-nn10.png` |
| 只有 inset、没有描边：虚线复现 | `artifacts/edge-quality/crops/wavy-inset-east-nn10.png` |
| 只有描边、没有 inset：深褐带，不是淡青 | `artifacts/edge-quality/crops/wavy-stroke-east-nn10.png` |
| 干净圆的 CSS inset（原生顶带） | `artifacts/edge-quality/crops/cal-css-inset-north-nn10.png` |
| 同一 inset 走 BINARIZE：干净圆也会结巴 | `artifacts/edge-quality/crops/cal-inset-bin-east-nn10.png` |
| 标定：连续满圈 vs 虚线满圈 | `crops/cal-rim-ring-east-nn10.png` · `crops/cal-rim-dashed-east-nn10.png` |
| 4× 缩小后的 inset 东缘：碎点变软，没消失 | `artifacts/edge-quality/crops/wavy-inset-4x-down-east-nn10.png` |
| 从 `shape` 画 inset（未进产品）：软带，不是碎点 | `artifacts/edge-quality/crops/wavy-inset-aa-east-nn10.png` |
| 要留的不规则剪影 | `artifacts/edge-quality/captures/baseline.png` |
