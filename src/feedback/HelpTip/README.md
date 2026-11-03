# HelpTip

支持悬停、键盘焦点和触摸的上下文帮助；保留原生 dialog 内的定位与 Escape 行为。

```tsx
<HelpTip label={t('help')} media={<ConnectionDrawing />} poster={<ConnectionStill />} caption={t('connect.sameWifi')} />
// Existing text-only usage still works:
<HelpTip label={t('help')}>{t('shortExplanation')}</HelpTip>
```

`media?: ReactNode` 是无字、非交互画面，`poster?: ReactNode` 是减少动态时的关键帧，`caption?: string` 是画面外的一句短话和浮层的可访问名称；未传 caption 时沿用 `children?: string`。开发环境对没有 media 的长文字（超过约 60 字符或多句话）只警告，不抛错。画面使用 HelpLoop 的 CSS 动画契约；未传 poster 时减少动态会停用 CSS 动画，基础图形须能独立说明意思。

文字和按钮 label 都由产品翻译，画面内不放字。关键步骤、费用或错误不能只藏在帮助浮层中，也不放交互控件。[完整参数](HelpTip.tsx)。
