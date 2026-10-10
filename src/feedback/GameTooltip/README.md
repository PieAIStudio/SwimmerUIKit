# GameTooltip

给触发器补充简短文字。

背景为静止水滴，缓波上限1.4px；出现后不持续变形，不使用液体滤镜。

主要参数：`label`、`align`（center / start / end，默认 center）、`placement`（top / bottom，默认 top）；[完整参数](GameTooltip.tsx)以源码为准。

触发器若由 Server Component 构造并作为子元素传入，可能以惰性元素到达。这是受支持的情况：`aria-describedby` 在挂载后加到可聚焦的元素上。在客户端组件里构造触发器则保留原始元素。

标签最宽 280px，超出时换行；`label` 中的 `\n` 保留为换行。`start` 让左边与触发器对齐并向右展开，`end` 让右边对齐并向左展开。

边界：需要触摸帮助或可交互内容时优先用 GameHelpTip。
