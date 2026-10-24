# SegmentedControl

在少量并列选项之间选择，背景与选中对勾都不改变布局宽度。

主要参数：options、activeId、onSelect、label、disabled、hue；选项可单独指定 hue。

边界：产品拥有值；不要再包 LiquidGroup，不再支持材质开关。

长标签按内容分配宽度；放不下时选项换行，单个超长标签在自己的按钮内折行。
不要给选项或标签覆写 `white-space: nowrap`、固定高度或等宽零基准布局，否则产品需要自行承担截断与重叠验证。
