# Shell

用插槽组织场景、HUD、侧栏和覆盖层。

主要参数：`assetLibrary`、`bottomBar`、`density`、`hud`、`layout`、`look`、`movementPad`、`overlay`、`sidePanel`；[完整参数](Shell.tsx)以源码为准。

外观：工具壳默认 `look="glass"`，侧栏是磨砂玻璃；`look="aura"` 是整窗一层静态光谱光晕（`--swimmer-aura`），侧栏透明，不用模糊。

边界：不创建场景、不保存游戏状态、不引入产品运行时。
