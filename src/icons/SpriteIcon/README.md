# SpriteIcon

Plays pre-rendered WebP-with-alpha sprite sheets with CSS `steps()` in the `@pieai/swimmer-ui-kit/tool-worlds` entry (no `three.js`).

## Behavior

- **Tier selection**: Picks `96`, `192`, or `512` px frames from `Math.max(renderedWidth, renderedHeight) * devicePixelRatio` (`<= 96 -> 96`, `<= 192 -> 192`, `> 192 -> 512`), falling back to the nearest supplied tier when partial sources are passed.
- **Rest still and clip lifecycle**: Starts on the rest still, plays one WebP sheet per named clip (`idle`, `hover`, `syncing`, `done`, `problem`, `act`) using percentage-based CSS `@keyframes` and `steps()`, and settles back on the rest still when non-looping clips finish.
- **Hero-only idle**: Only `hero={true}` icons loop `idle` at rest; ordinary icons stay on the rest still until hover, focus, selection (`selected` `false -> true`), or a controlled `state`.
- **Reduced motion**: Under `prefers-reduced-motion: reduce` or `reducedMotion={true}`, shows the rest still only with animations disabled.
