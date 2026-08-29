# 液态边缘毛刺：测量报告

版本：`1.11.3`。产品滤镜 **已改**：offset-only inset 从抗锯齿 `shape` 取差，不再走 `BINARIZE`。复现：`node artifacts/edge-quality/measure-liquid-edge.mjs`（需 Storybook `http://127.0.0.1:6006`）。原始表：`artifacts/edge-quality/metrics.json`。

## 这一轮的结论

`wavy-inset-aa` 已经进产品。虚线是 inset 从二值轮廓泄漏，不是剪影台阶。从 `shape` 取差之后，10× 东缘从断开的淡青碎点变成连续软带；顶部 2px 黏土高光还在。锯齿贴在干净矢量圆的地板上（0.139 vs 0.126），起伏仍在 1.09。面积代价为零。

`BINARIZE` 在 inset-only（以及 inset + 外阴影、无描边、无 spread）下不再发出。`wavy-inset-aa` 与强制留下未消费 `bin` 的 `wavy-inset-aa-keepbin` 数字完全相同，所以那一格是空转。现场青色指示器 16 → 15 个 primitive。描边和 spread 仍需要硬边，`BINARIZE` 留在那些链上。

## 应用前后

同一套度量，dpr=2，阈值不变。`keepbin` 与 `aa` 逐项相同，表里不单列。

| 样本 | 锯齿 | 起伏 | 北 | 东 | breaks/100 | 峰值超额 | 步数 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 干净矢量圆地板 | 0.126 | 0.045 | 0 | 0 | 0 | — | — |
| `wavy-inset`（1.11.2，`bin`） | 0.136 | 1.092 | 1 | 0.44 | **2.51** | 63 | 12 |
| `wavy-inset-aa`（1.11.3，`shape`） | 0.139 | 1.087 | 1 | 0.49 | **1.25** | 43 | 11 |
| `wavy-shadow-full`（`bin`） | 0.138 | 1.094 | 1 | 0.44 | 2.50 | 61 | 16 |
| `wavy-shadow-full-aa` | 0.142 | 1.087 | 1 | 0.46 | 1.67 | 42 | 15 |
| `cal-inset-bin`（无 goo） | 0.118 | 0.031 | 1 | 0.36 | **3.78** | 58 | 9 |
| `cal-inset-aa` | 0.118 | 0.036 | 1 | 0.45 | **0.42** | 49 | 8 |
| `pill-inset`（`bin`） | 0.308 | 25.53 | 1 | 0.48 | 0.62 | 69 | 12 |
| `pill-inset-aa` | 0.307 | 25.56 | 1 | 0.49 | 1.24 | 49 | 11 |
| `pill-shadow-full`（`bin`） | 0.304 | 25.54 | 1 | 0.48 | 0.618 | 68 | 16 |
| `pill-shadow-full-aa` | 0.307 | 25.58 | 1 | 0.48 | 0.617 | 49 | 15 |
| 现场青色指示器 1.11.2 | 0.202 | 12.19 | 1 | 0.56 | 2.64 | 66 | 16 |
| 现场青色指示器 1.11.3 | 0.195 | 12.24 | 1 | 0.60 | 2.64 | 47 | **15** |
| `WavinessDefault` / blob | 不变 | 不变 | — | — | — | — | — |

孤立圆的 breaks 腰斩，起伏没有砸扁。干净圆上 `BINARIZE` inset 的结巴（3.78）降到比原生 CSS inset（0.85）还低（0.42）。药丸的 `breaks` 计数几乎不动，甚至 inset-only 药丸从 0.62 升到 1.24：药丸周长本来就是一条顶带加一条底空，东缘碎点只占很少仓，软化之后峰值超额靠近阈值 18，计数会抖。10× 黏土裁块上，药丸东缘同样从台阶碎点变成连续软带，顶带还在。产品路径是 `pill-shadow-full`（`--game-ui-shadow-button`），breaks 0.618 → 0.617。

现场青色指示器的 `breaks` 也没动（2.64 → 2.64）。孤立对照是圆；真链是 52px 高的药丸加外阴影。计数反映的是「顶有 / 底无」这条设计带，不是东缘虚线。透明底 10× 东缘和黏土合成 10× 东缘都是碎点 → 软带，和对照预测的是同一件事。

## 淡青虚线是什么（file:line）

消融（同一 150px 青圆，生产 waviness 链）上一轮已经定性，没有改：

| 样本 | 淡青高光 | 10× 东 |
| --- | --- | --- |
| `baseline`（只有填色 + 位移） | 无（rim=0） | 只有色边 |
| `wavy-stroke`（1px 描边，无 inset） | 无（rim=0） | 一条深褐带 |
| `wavy-inset`（只有 inset） | **就是它** | `crops/wavy-inset-east-nn10.png` 淡青虚线 |
| `wavy-shadow-full` | 与 `wavy-inset` 相同 | 外阴影不贡献淡青 |

1.11.2 的画法：`feColorMatrix` `BINARIZE` = `0 0 0 60 -29.5` → `bin`，然后 `InsetPass` 对 `bin` 做 `feOffset dy=2` 再 `bin OUT offset`。二值边和它下移 2px 的副本对不齐，竖直东缘漏出 1px 碎点。白 42% 盖在 `#1d9a8b` 上就是淡青。

1.11.3：`src/liquidGooeyFilter.tsx` 的 `InsetPass` 在 `spread === 0` 时从 `shape` 取差。`BINARIZE` 只在 `stroke !== null` 或某个 shadow `spread !== 0` 时发出（形态学仍需要硬边）。现场 SVG（`.game-ui-segmented-follow`）15 个 primitive，inset 的 `feOffset` / `feComposite out` 的 `in` 是 `shape`，没有 `BINARIZE`。

透明底截图仍会把半透明 inset 拍成不透明亮点。判断用黏土合成裁块（`*-clay-*-nn10.png`）和 `captures/story-segmented-on-clay-after.png`。

## 新度量：沿轮廓的高光连续度

`r(θ)` 量的是剪影半径。一条贴着轮廓的亮线可以断成虚线而不移动 `r(θ)`。沿 720 个角向仓，从轮廓外 1.2 CSS px 走到内 4 CSS px。只看 α≥160 的像素。相对内部填色亮度的峰值超额 ≥ 18 记为 **有高光**。

| 度量 | 定义 |
| --- | --- |
| **rim 出现率** | 有高光的仓 / 720 |
| **北 / 东 / 南 出现率** | 250–290°、340–20°、70–110°（屏幕 y 向下，北 = 顶） |
| **breaks / 100 CSS px** | 有↔无翻转次数 / 周长 × 100。连续线 ≈ 0，虚线很大 |

阈值 18 的依据：inset 超额约 50–70；填色-only 的不透明像素超额 ≤ 1.4。抗锯齿 inset 把峰值超额降到 ~43，仍远高于 18；药丸东缘会在阈值附近发抖，所以药丸的 breaks 不能单独当关卡。关卡是：顶带还在（北=1），起伏不砸扁，10× 东缘是软带而不是碎点。

## 超采样仍然付不起

上一轮的结论没有变。CSS `transform: scale(0.5)` 的 2× SVG **没有**提高滤镜栅格分辨率。真 4× 再缩小把锯齿降到矢量圆地板（0.137 → 0.124），到不了 0.07——0.07 低于 dpr=2 上干净圆的 0.126。青色指示器布局面积 124 160，×4 = 496 640，超过 480 000。从 `shape` 画 inset 零面积代价，这是付得起的那条。

## 还剩什么

1. **剪影台阶。** 在 dpr=2 的布局尺寸上，已经离干净圆 0.01 CSS px。不要再拧噪声参数。
2. **`WavinessDefault` 的描边**仍走 `BINARIZE` + `feMorphology`。那是另一条硬边，与青色指示器无关。形态学没有抗锯齿。
3. 药丸 / 现场指示器的 `breaks` 计数对这条虚线不敏感。以后若再量 rim，看 10× 黏土裁块和峰值超额，不要只看 breaks。

## 给主人看的图

请自己看。10× 是最近邻。`*-clay-*` 是把半透明像素合成到 `#f6e8d2` 上再放大，不要拿透明底那张当真界面。

| 你在看什么 | 路径 |
| --- | --- |
| 1.11.2 圆、黏土东缘：淡青碎点 | `artifacts/edge-quality/crops/wavy-inset-clay-east-nn10.png` |
| 1.11.3 圆、黏土东缘：连续软带 | `artifacts/edge-quality/crops/wavy-inset-aa-clay-east-nn10.png` |
| 同上，顶缘：2px 高光还在，更软 | `crops/wavy-inset-clay-north-nn10.png` · `crops/wavy-inset-aa-clay-north-nn10.png` |
| 现场青色指示器，黏土东缘 after | `crops/story-segmented-teal-after-clay-east-nn10.png` |
| 现场青色指示器，黏土顶缘 after | `crops/story-segmented-teal-after-clay-north-nn10.png` |
| 真界面整颗分段（黏土地）after | `captures/story-segmented-on-clay-after.png` |
| 药丸 inset，黏土东缘 before / after | `crops/pill-inset-clay-east-nn10.png` · `crops/pill-inset-aa-clay-east-nn10.png` |
| 药丸 inset，黏土顶缘 after | `crops/pill-inset-aa-clay-north-nn10.png` |
| 完整 button shadow 的圆，黏土东缘 after | `crops/wavy-shadow-full-aa-clay-east-nn10.png` |
| 完整 button shadow 的药丸，黏土东缘 after | `crops/pill-shadow-full-aa-clay-east-nn10.png` |
| 干净圆 BINARIZE inset 仍结巴 | `crops/cal-inset-bin-east-nn10.png` |
| 干净圆从 `shape` 画 inset | `crops/cal-inset-aa-east-nn10.png` |
| 透明底会把半透明 inset 拍成霓虹（过曝） | `crops/story-segmented-teal-east-nn10.png` · `crops/story-segmented-teal-after-east-nn10.png` |
| 要留的不规则剪影 | `captures/baseline.png` |
