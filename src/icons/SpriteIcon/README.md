# SpriteIcon

Plays pre-rendered WebP-with-alpha sprite sheets with CSS `steps()` in the `@pieai/swimmer-ui-kit/tool-worlds` entry (no `three.js`).

## Behavior

- **Tier selection**: Picks `96`, `192`, or `512` px frames from `Math.max(renderedWidth, renderedHeight) * devicePixelRatio` (`<= 96 -> 96`, `<= 192 -> 192`, `> 192 -> 512`), falling back to the nearest supplied tier when partial tiers (such as `96` / `192` clip sheets on ordinary icons) are passed.
- **Manifest adapter**: `spriteIconFromManifest(manifest, resolveFile)` builds a `SpriteIconSource` from generator `manifest.json` data (`role`, `still`, and named `clips`) with zero per-icon code.
- **Rest still and clip lifecycle**: Starts on the rest still, plays one WebP sheet per named clip (`idle`, `hover`, `syncing`, `done`, `problem`, `act`) using percentage-based CSS `@keyframes` and `steps()`, and settles back on the rest still when non-looping clips finish.
- **Hero-only idle**: Only hero icons (`hero={true}` or `icon.role === 'hero'`) loop `idle` at rest; ordinary icons stay on the rest still until hover, focus, selection (`selected` `false -> true`), or a controlled `state`.
- **Reduced motion**: Under `prefers-reduced-motion: reduce` or `reducedMotion={true}`, shows the rest still only with animations disabled.
