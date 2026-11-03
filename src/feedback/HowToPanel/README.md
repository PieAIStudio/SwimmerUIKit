# HowToPanel

One illustrated step at a time, with app-translated `label`, `previousLabel`, `nextLabel` and `steps: { media, poster?, caption }[]`. Previous/next buttons work with touch, Tab and Enter/Space; Left/Right and Home/End also select a step. The first/last buttons stop at the ends. Steps never advance automatically.

```tsx
<HowToPanel
  label={t('connect.title')}
  previousLabel={t('previous')}
  nextLabel={t('next')}
  steps={[
    { media: <ConnectionDrawing />, poster: <ConnectionStill />, caption: t('connect.sameWifi') },
  ]}
/>
```

Only the current step is mounted. Its caption is its accessible name and a polite announcement when changed. `HelpLoop` keeps the drawing looping while visible; reduced motion shows the poster (or freezes CSS animation if omitted). Drawings contain no text or interactive controls. Use inside a `Modal` or a page; this panel does not open a dialog or own completion/business state. [API](HowToPanel.tsx).
