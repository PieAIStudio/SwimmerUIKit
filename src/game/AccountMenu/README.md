# AccountMenu

登录后的账号入口：头像与名字组成的触发器，点击打开同一个账号面板。面板含产品提供的站内内容、全部产品列表和账号页签。

主要参数：`user`、`labels`、`site`、`products`、`accountHref`、`onSignOut`、`signingOut`、`defaultTab`、`triggerId`；[完整参数](AccountMenu.tsx)以源码为准。

边界：产品拥有用户、产品列表、站内内容与退出逻辑；组件不联网、不存储、不做登录。退出按钮处理中显示 `pending`，但不禁用，重复点击由组件守卫忽略。当前产品显示为「当前」标记而不是链接；头像只渲染 https 图片，否则显示首字母。

`triggerId` 可选，原样传给触发 `Button` 的原生 `id`，供产品选择稳定唯一的语义身份；未提供时行为不变。

后续建议（本次不做）：未给 id 时，外圈也应由稳定种子决定，而不依赖 React `useId` 的挂载编号；需另行设计并验收默认轮廓的兼容性。

窄屏的三个页签保留一排，按内容分配宽度；长名称必要时在页签内换行，而不是以省略号隐藏。选中对勾、原生键盘操作和至少 44 像素点击高度不变。

不在根入口：从 `@pieai/swimmer-ui-kit/liquid-presence` 导入。面板基于 LiquidPopover，宿主需同时引入 `@pieai/swimmer-ui-kit/liquid-presence.css`。

```tsx
import { AccountMenu } from '@pieai/swimmer-ui-kit/liquid-presence';
import '@pieai/swimmer-ui-kit/styles.css';
import '@pieai/swimmer-ui-kit/liquid-presence.css';
```
