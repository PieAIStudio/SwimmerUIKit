# LanguageMenu

展示语言选项并通知产品用户的选择。

主要参数：`currentLabel`、`label`、`options`、`value`、`defaultValue`、`onSelect`；[完整参数](LanguageMenu.tsx)以源码为准。

`options` 没有 `href` 时保持回调按钮模式（`menuitemradio`）；提供 `href` 时输出原生路由链接，并透传 `hrefLang`、`lang`、`dir`、`current`、`target` 和 `rel`。菜单支持上下/左右箭头、Home/End、Escape 关闭和焦点回到触发器；链接不阻止浏览器的普通导航或新标签页行为。

边界：不加载翻译、不解析 locale、不重建页面、不负责语言持久化。宿主提供路由、cookie、翻译和当前语言。
