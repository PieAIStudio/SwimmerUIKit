# ToolLanding

Colour Worlds 首页组合：宿主提供标题、lead 和 feature 数据；`art` 保留现有静态入口，传入 `model` 时组件改用 `ToolHero3D`。3D 模型来自 `tool-hero-3d` 可选 leaf，必须同时提供 route-v0 primitive builder 或 GLB URL，以及同一物体的静态 PNG fallback。组件负责 glow、浅标题和三个 Gem 行的布局。
