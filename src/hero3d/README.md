# ToolHero3D

可选 Colour Worlds hero leaf：从 `@pieai/swimmer-ui-kit/tool-hero-3d` 导入，宿主另外安装 `three` peer。

`model` 必须带 `fallback` 静态 PNG，并且二选一：`build(THREE) => THREE.Group`（只用 route-v0 基本几何和材质）或 `url` GLB。组件共用页面 renderer，空闲/不可见/隐藏窗口时暂停，减少动态时保持静止；失败、无 WebGL 和加载错误都保留 PNG，不显示空盒子。
