# HelpLoop

A decorative frame for an author's inline SVG/CSS loop. It adds `is-playing` only while on screen and the system allows motion. CSS animations pause without resetting when off screen; reduced motion disables animations/transitions and shows `poster` when supplied. No GSAP, timer, player or animation dependency.

```tsx
<HelpLoop poster={<ConnectionStill />}>
  <svg viewBox="0 0 320 180">
    <path className="connection-pulse" d="..." />
  </svg>
</HelpLoop>
```

Author keyframes with `animation: connection-pulse 3s infinite`; scope them to your drawing. The wrapper controls `animation-play-state` via class. Base SVG styles use 2px non-scaling round strokes: `--help-stroke` is the line colour and `--help-accent` is the one accent colour. Both follow existing light/dark semantic tokens and may be overridden on the theme scope. Use a text-free 320×180 viewBox; make the base drawing a meaningful still if no poster is provided.

The frame is `aria-hidden` and inert; put the app-localized caption outside it (HelpTip, HowToPanel and FirstSessionOnboarding do this). Use CSS animation, not SMIL, JavaScript clocks or autoplay media: this helper cannot pause an arbitrary media engine. [API](HelpLoop.tsx).
