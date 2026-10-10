# GameAccountMenu

登录后的账号入口：头像与名字组成的触发器，点击打开同一个账号面板。面板含产品提供的站内内容、全部产品列表和账号页签。

主要参数：`user`、`labels`、`site`、`products`、`accountHref`、`onSignOut`、`signingOut`、`defaultTab`；[完整参数](GameAccountMenu.tsx)以源码为准。

边界：产品拥有用户、产品列表、站内内容与退出逻辑；组件不联网、不存储、不做登录。退出按钮处理中显示 `pending`，但不禁用，重复点击由组件守卫忽略。当前产品显示为「当前」标记而不是链接；头像只渲染 https 图片，否则显示首字母。

面板基于 LiquidPopover，宿主需同时引入 `@pieai/swimmer-ui-kit/liquid-presence.css`。
