# LiquidEffectsGroup

可选的融化、弯曲与图像接触溶解。只从 `@pieai/swimmer-ui-kit/liquid-effects` 导入，不进入默认控件包。

主要参数：沿用 LiquidGroup 的材质参数；子项通过 `effect`、`bend`、`melt`、`dissolve` 选择行为。共享引擎仍负责时钟、测量、预算、减少动态和卸载清理。

边界：普通按钮、输入与列表不需要此特效。DOM 文字保持独立，图像溶解不自动模糊整段文字。
