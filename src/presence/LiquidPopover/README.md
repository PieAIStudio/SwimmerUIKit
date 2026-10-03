# LiquidPopover

受控的非模态液体面板，组合 LiquidAnchor 与 LiquidReveal；从 liquid-presence 入口导入。
open / onOpenChange 由宿主管理，source 是真实启动控件 ref，title 提供名称。
桌面默认 bottom-end、440px，窄屏优先 top、两侧各12px。打开聚焦标题，Esc或外点关闭后回到来源。
不自动执行业务，不圈住焦点；需阻断背景时用 GameModal。面板内使用 secondary，不再放液体 CTA。
