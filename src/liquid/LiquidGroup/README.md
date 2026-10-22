# LiquidGroup

分离装饰轮廓与真实 DOM 内容，统一液体运动及预算。

主要参数：`blur`、`contrast`、`gloss`、`fill`、`filterPadding`、`shadow`、`stroke`；[完整参数](types.ts)以源码为准。默认使用涟的统一重量，没有材质开关。

边界：装饰 SVG 对读屏隐藏，portal 容器不进入 Tab 顺序；内容仍使用原生控件，不另造交互语义。
