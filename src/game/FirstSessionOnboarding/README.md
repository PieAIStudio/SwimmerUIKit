# FirstSessionOnboarding

展示产品提供的首次使用步骤；`labels`、`onDismiss`、`open` 和原有纯文字步骤保持兼容。

每步仍用 `title` 和 `body`，可追加 `media?: ReactNode` 与 `poster?: ReactNode`。有画面时，`body` 就是画面外的一句短话及其可访问名称，不再重复一段正文。减少动态显示 poster；未提供 poster 时停用 CSS 动画，基础图须能说明意思。画面使用 HelpLoop 的 2px 圆头线条和一个强调色，不放字或交互控件。

```tsx
const step = {
  title: t('connect'),
  body: t('connect.sameWifi'),
  media: <ConnectionDrawing />,
  poster: <ConnectionStill />,
};
```

边界：是否出现、关闭及记录由宿主决定，不推断完成状态，不固化产品教学流程。需要逐步切换时用 HowToPanel；这里保留现有步骤概览。[完整参数](FirstSessionOnboarding.tsx)。
