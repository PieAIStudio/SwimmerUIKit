# ManagerSheet

Colour Worlds 的长列表清单页。`theme="light" | "dark"` 控制清单纸面；分组、行数据、搜索与动作回调由宿主提供。行选择使用自定义 `Checkbox`，底部动作使用粉色 `ActionPill`，不渲染原生 `select`。

只有提供 `onRowOpen(id)` 时才显示行 Open 按钮，`row.disabled` 同时禁用选择和打开。宿主可传 `backLabel`、`searchLabel`、`sortPrefix` 独立于主题设置文案；省略时保留原有明暗主题默认值。富文本 `row.name` 应提供字符串 `row.label`，供 `Select …` / `Open …` 可访问名称使用；省略时沿用行名。
