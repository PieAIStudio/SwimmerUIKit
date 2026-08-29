# 液态边缘毛刺：测量报告

版本：`1.11.2`（含 1.11.1 的 0.5px 位移后模糊）。产品滤镜 **没有改**。第三次猜参数不是进展；下面是像素数字。

复现：`node artifacts/edge-quality/measure-liquid-edge.mjs`（需本机 Storybook `http://127.0.0.1:6006`）。原始表：`artifacts/edge-quality/metrics.json`。

## 结论

毛刺 **不是** `feTurbulence` 低频分形噪声排成色块、再把轮廓推成台阶。噪声场本身是光滑 Perlin。轮廓在用户空间里是光滑的有机变形；人眼放大后看到的像素台阶，是 **硬边栅格被 `feDisplacementMap` 搬到新像素之后，没有在设备分辨率上重建一条干净的等值线**。

1.11.1 的 0.5px 后模糊 **确实帮了忙**（此前没人量过）：在 150px 青色圆斑上，锯齿 RMS 从 0.174 降到 0.137 CSS 像素（−21%），有机起伏几乎不动（1.102 → 1.095）。再加模糊、先把源边弄软、把噪声再糊一遍，要么数字几乎不动，要么剪影变脏、变软，没有一个变体同时做到「更干净」且「起伏还在」。

所以这次 **不改 `src/`，不升版本**。

## 毛刺是什么

三层，不要混在一起：

1. **要留的不规则。** `waviness=6`、`baseFrequency=0.018` 在约 150px 的圆上大约走 8 个慢波，剪影读起来像软八角/阿米巴，而不是椭圆。主人说「非标准是好事」——指的是这一层。量它的是 **起伏 RMS**。
2. **位移之后的设备像素台阶。** 对比矩阵把 goo 边几乎二值化，`feDisplacementMap` 按像素取样（公式见 SVG 规格：`P'(x,y) ← P(x + scale·(Xc−0.5), …)`，scale=12）。结果是一条被搬过的硬等值线，光栅不会自动补抗锯齿。放大后就是毛刺。量它的是 **锯齿 RMS**。1.11.1 的 0.5px 模糊是在这一层工作。
3. **描边故事里的第二道硬边。** `WavinessDefault` 带 `stroke`。描边走 `BINARIZE`（α 斜率 60）再 `feMorphology` 腐蚀，形态学是最小/最大，边更硬。10× 最近邻裁块上，米色描边的台阶比填色更扎眼。青色分段指示器 **没有描边**，主人夸的青色主要是第 2 层。

Donor 的 `waviness` 默认是 **0**（`packages/liquid-gooey/src/filter.tsx`、`Gooey.tsx`、README 都写着）。Kit 推到 6px，是 donor 没出货、也没验证过的区间。Waviness 那条位移链上，donor **没有** 位移后模糊，也没有别的抗锯齿手法可搬。Melt 观察器里有一个 `stdDeviation` 从 0 起的位移后模糊，那是熔图，不是剪影纹理。

## 度量（以及为什么砸扁形状刷不掉）

主科学对象是 **150×150 的圆斑**（和 Storybook `WavinessClampComparison` 的 blob、孤立 SVG 滤镜链一致）。填充 `#1d9a8b`（`--game-ui-secondary`，分段指示器的青色）。截图 **deviceScaleFactor=2**，轮廓量转换到 CSS 像素。

从 α≥128 的外轮廓取 720 个角向仓的最大半径 `r(θ)`：

| 度量 | 定义 | 为什么砸扁刷不掉 |
| --- | --- | --- |
| **锯齿 RMS** | `r(θ)` 相对沿弧长 σ≈2.2px 平滑后的残差 RMS（CSS px） | 砸成椭圆/关掉 waviness，这个数会掉向校准圆的地板（~0.12），但 **起伏 RMS 会同时掉到 ~0.03**。过关条件是锯齿下降而起伏留在基线 ±10% 里。 |
| **起伏 RMS** | 抗锯齿尺度的 `r(θ)` 相对平均半径的 RMS | 真椭圆 ≈ 0。6px×7 周的干净矢量正弦 ≈ 4.15。生产基线 ≈ 1.09。加台阶几乎加不上起伏（楼梯圆只有 0.20）。 |
| **起伏带能量** | `r(θ)` 里空间波长 12–70 CSS px 的 DFT 能量 | 对应 `1/0.018 ≈ 56px` 的慢波。砸扁会拆掉这一带；只清像素台阶不会。 |
| **4× 再栅格** | 同一用户空间滤镜，SVG 画成 4 倍 CSS 再量化 | 若毛刺是用户空间里的几何色块，锯齿（以 CSS px 计）应几乎不变。若只是设备分辨率不够，锯齿会掉、起伏不动。这个对照 **不能** 用画椭圆来冒充。 |

胶囊/双液滴 **不能** 用从质心出发的 `r(θ)` 当起伏——长短轴本身就会把起伏刷到 25px。那些形状只作主人对照图。

α 过渡宽度这次没测到（走样函数在实心内部就饱和，恒为 0）。软边用 10× 最近邻裁块判断，不拿这个数做关卡。

## 校准：度量能分开「锯齿」和「合法起伏」

同一 150px 圆，无滤镜：

| 样本 | 锯齿 RMS | 起伏 RMS | 10× 裁块 |
| --- | ---: | ---: | --- |
| 干净矢量圆 `cal-circle` | 0.126 | 0.045 | `artifacts/edge-quality/crops/cal-circle-east-nn10.png` |
| 干净矢量正弦（振幅 6px、7 周）`cal-wobble` | 0.162 | **4.147** | `artifacts/edge-quality/crops/cal-wobble-east-nn10.png` |
| 只走轴对齐台阶的数字圆 `cal-stairs` | **0.257** | 0.202 | `artifacts/edge-quality/crops/cal-stairs-east-nn10.png` |

正弦圆起伏是楼梯圆的 20 倍，锯齿只高一点（曲线本身更弯）。楼梯圆锯齿是干净圆的 2 倍，起伏仍接近圆。度量没有把「好看的不规则」记成毛刺。

## 基线（先量 1.11.2，再动任何东西）

生产链：`goo 模糊 6 + contrast 18 + atop + fractalNoise 0.018 / octaves=2 / seed=7 + displacement scale=12 + 0.5px 模糊`。孤立 SVG 与 Storybook blob 数字一致，说明孤立链没有画错。

| 样本 | 锯齿 | 起伏 | 相对无后模糊 |
| --- | ---: | ---: | --- |
| `calm`（waviness=0，goo 圆） | 0.118 | 0.031 | — |
| `no-edge-blur`（1.11.0 行为） | 0.174 | 1.102 | 基准 |
| **`baseline`（1.11.1/1.11.2）** | **0.137** | **1.095** | 锯齿 −21%，起伏 −0.6% |
| Storybook blob `waviness-blob-after` | 0.135 | 1.165 | 与孤立基线同量级 |

1.11.1 把锯齿从「明显差一截」拉到离矢量圆地板（0.126）只差 0.01 CSS px。起伏几乎原封不动——后模糊没有把形状砸扁。

10× 最近邻（最差局部，不是正东——正东切线接近竖直，任何圆都会看起来像一条竖线）：

- 无后模糊，台阶是硬的：`artifacts/edge-quality/crops/no-edge-blur-nn10.png`
- 现在的 0.5px：台阶还在，多了一圈半透明边：`artifacts/edge-quality/crops/baseline-nn10.png`
- 全形：`artifacts/edge-quality/captures/baseline.png`
- 生产橙色圆斑（Storybook，能看出要留的软八角）：`artifacts/edge-quality/captures/story-waviness-blob.png`
- 青色分段指示器：`artifacts/edge-quality/captures/story-segmented-teal.png`（透明底上的彩虹圈是阴影滤镜，不是产品里看见的颜色；看中间那颗青色药丸的边）
- 带描边的双液滴：`artifacts/edge-quality/captures/story-waviness-default.png` 和 `artifacts/edge-quality/crops/story-waviness-default-nn10.png`

## 主假设怎么死的

「低频 `fractalNoise` 按像素取样，位移会一块一块变，轮廓变成台阶」。

| 实验 | 如果假设为真 | 实测 |
| --- | --- | --- |
| 只画噪声 | 色块、大面积梯度为 0，然后跳变 | `noise-baseline` 10× 是光滑云：`artifacts/edge-quality/crops/noise-baseline-nn10.png`。梯度零点比例 5.2%，中位梯度 2.2。量化对照 `noise-posterize` 零点 23%，10× 能看见色块：`artifacts/edge-quality/crops/noise-posterize-nn10.png` |
| 位移前把噪声再糊 1–3px | 台阶应随噪声变光滑而消失 | 锯齿 0.136 / 0.137 / 0.135，相对基线 0.137 **没有** 改善；起伏还在 1.09–1.07 |
| 把噪声量化成 5 档（假色块） | 锯齿应升上去 | 升到 **0.295**（和楼梯圆同类），起伏仍 1.29。度量 **能** 抓住真色块，生产噪声不是那种东西 |
| 改 octaves 1 / 4 | 低频块来自 2 层 octave | 1：锯齿 0.137（同基线），起伏 1.23。4：锯齿 **更差** 0.149 |
| 改 `baseFrequency` 0.008 / 0.04 | 更低的频率应更块 | 0.008：锯齿 0.137，起伏掉到 0.78（更少的波，不是更干净的边）。0.04：锯齿 **更差** 0.166 |
| 位移前把源边糊 0.75–1px | 若只是硬源缺乏过渡带 | 无后模糊时锯齿仍 0.171（≈ 0.174）。过渡带过不了位移取样 |
| **4× 再栅格同一用户空间滤镜** | 用户空间色块会留下 | 锯齿 **0.031**（掉到 1/4），起伏 **1.085**（基线 1.095）。几何在用户空间是光滑的 |

假设不成立。剩下的台阶是 **设备像素上的位移取样**，和 Smashing Magazine 对 `feDisplacementMap` 硬边的描述同类，不是 Perlin 格子。

## 试过的修复，以及为什么不进产品

生产 waviness 链是 **6** 个滤镜子图（goo 模糊、对比、atop、turbulence、displacement、0.5 模糊）。区域：pad 50，150×150 控件约 `(150+100)² = 62 500` CSS px²。

| 变体 | 锯齿 | 起伏 | 代价 | 为什么不采用 |
| --- | ---: | ---: | --- | --- |
| 基线 0.5px 后模糊 | 0.137 | 1.095 | 已在 1.11.1 | — |
| 后模糊 1.0 | 0.125 | 1.090 | 同次数，pad +1px（~+1%） | 数字贴地板，但 10× 裁块是更脏的彩色晕：`crops/edge-blur-1-east-nn10.png`。主人会看成新毛刺 |
| 后模糊 1.5 | 0.122 | 1.085 | pad +3px | 更软、晕更重：`crops/edge-blur-1-5-east-nn10.png`。约束禁止「糊到轮廓发虚」 |
| 0.8 / 1.2 模糊再对比拉回 | 0.132 / 0.123 | 1.087 | **+1 次** color matrix | 拉回等于把台阶加硬。`crops/reconstruct-12-10-east-nn10.png` 几乎是二值楼梯 |
| 位移前糊源边 | 0.171 | 1.096 | +1 次模糊 | 锯齿回到 1.11.0。`crops/preblur-1-nn10.png` |
| 前糊 + 现有 0.5 | 0.133 | 1.089 | +1 次 | 相对基线 −3%。看不出，换一次全区域模糊不值 |
| 4× 再栅格 | 0.031 | 1.085 | 设备像素 ×16；若按 CSS 面积进预算则 ×4 | 双液滴演示约 24 万 CSS px²，×4 = 96 万，超过 48 万顶。小控件能活，大组合不能 |

没有一个候选满足「锯齿明显下降、起伏留下、边不要发虚、滤镜工作量不要翻倍」的合取。按任务要求：**改动为零**。

## 下一步（只这一条）以及怎样算确认

**在位移这一级做 2× 超采样，再双线性缩回布局尺寸**，不要再拧 `numOctaves` / `baseFrequency` / 再加一层糊。

已经用 4× 证明过：分辨率能在不动起伏的前提下把锯齿打下去。2×（面积 ×4，不是 ×16）才是可能付得起的版本。

确认实验（同一套脚本，加一个「2× 画、0.5× CSS transform」的变体）：

1. 150px 圆斑：锯齿从 ~0.137 掉到 ≤0.07，起伏仍在 1.09 ±10%，10× 裁块上的台阶接近 `cal-wobble-east-nn10.png`，而不是 `no-edge-blur-nn10.png`。
2. 量滤镜面积：小控件（分段指示器 ~280×52，pad 50 → ~5.8 万，×4 ≈ 23 万）仍应低于 48 万。`LiquidGroup` 演示舞台（~220×全宽）若超过预算，2× 只能当前景奖励用，不能当默认。
3. 次数应仍是 6（不要再加模糊）；多出来的是光栅分辨率，不是新的 primitive。

若 2× 数字过关但预算不过关，结论就是：这是分辨率问题，默认做不起，不要再回到噪声参数上猜。

次要、可并行的确认（不是替代）：把 `WavinessDefault` 的描边拿掉再拍同一裁块。若 10× 毛刺大部分消失，主人在描边故事里看见的是形态学描边，不是填色位移。青色指示器没有描边，那条线解释不了青色。

## 给主人看的图

请自己看，不要信文字。全部是 2× 设备像素再 **最近邻** 放大 10 倍，没有双线性把台阶糊掉。

| 你在看什么 | 路径 |
| --- | --- |
| 现在的有机剪影（要留的不规则） | `artifacts/edge-quality/captures/baseline.png` |
| 生产橙色圆斑，同一滤镜 | `artifacts/edge-quality/captures/story-waviness-blob.png` |
| 1.11.0：位移后不重建 | `artifacts/edge-quality/crops/no-edge-blur-nn10.png` |
| 1.11.2：0.5px 之后仍有台阶 | `artifacts/edge-quality/crops/baseline-nn10.png` |
| 干净矢量正弦，合法起伏长这样 | `artifacts/edge-quality/crops/cal-wobble-east-nn10.png` |
| 假色块噪声，假设为真时长这样 | `artifacts/edge-quality/crops/posterize-noise-east-nn10.png` |
| 真噪声 10×：光滑，不是砖 | `artifacts/edge-quality/crops/noise-baseline-nn10.png` |
| 4× 再栅格：起伏还在，台阶没了 | `artifacts/edge-quality/crops/baseline-4x-east-nn10.png` |
| 把后模糊加到 1px：更脏的晕 | `artifacts/edge-quality/crops/edge-blur-1-east-nn10.png` |
| 带描边的双液滴 10× | `artifacts/edge-quality/crops/story-waviness-default-nn10.png` |
| 青色药丸（阴影在透明底上会开花） | `artifacts/edge-quality/captures/story-segmented-teal.png` |
