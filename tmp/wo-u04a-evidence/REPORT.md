# WO-U04a — Official "overlay glass" HUD variant

**Branch:** `wo-u04a-overlay-glass`  
**Package:** `@pieai/swimmer-ui-kit` (version **not** bumped; no publish)  
**Verify:** `pnpm verify` — typecheck + lint + format:check + test (141) + build — **PASS**

## Design decisions

### API shape (aligned with existing kit conventions)

| Concern | Mechanism | Notes |
| --- | --- | --- |
| Surface tone | `data-game-ui-tone="glass"` | Parallel to `data-game-ui-theme="night"` — re-scopes CSS variables on a subtree |
| Class alias | `.game-ui-overlay-scope` | Same token block as the data attribute (either is enough) |
| Density | `data-game-ui-density="compact"` | Orthogonal to tone; 34px control floor, tighter panel/chip padding |
| Brand accent | Inherited clay `--game-ui-accent*` | Not redeclared by glass — warm brand stays; primary uses translucent warm fill |
| Focus | `--game-ui-overlay-glass-focus-ring` | Warm `rgba(241, 201, 168, 0.78)` for WCAG-visible rings on dark glass |

### Why not only a full theme?

`night` is a **page theme** (parchment → dark clay). Overlay glass is a **HUD surface tone** for chrome floating over a live scene. Products often keep a light/night host shell and only glass the scene-overlay subtree. Nesting works:

```html
<html data-game-ui-theme="night">
  <div data-game-ui-tone="glass" data-game-ui-density="compact">…HUD…</div>
</html>
```

### Token architecture

1. **Primitives** live only in `theme.css` `:root` (`--game-ui-overlay-glass-*`), matching SupaLuv stage chrome:
   - fill `rgba(12, 14, 20, 0.72)`
   - border `rgba(255, 255, 255, 0.18)`
   - text `#fff6ee`
   - warm hover border / translucent primary fill
2. **Glass scope** reassigns semantic surface/text/elevation tokens to those primitives and sets `box-shadow: none` on controls.
3. **`styles.css`** only adds shapes tokens cannot express alone: translucent primary/success/danger fills, hover border, `backdrop-filter`, clay-icon drop-shadow on dark glass.
4. **TS mirrors:** `CLAY_OVERLAY_GLASS_TOKENS`, `GAME_UI_OVERLAY` (attr/class constants). Not flat-merged into `GAME_UI_TOKENS` (would shadow `text` / `textMuted`).

### Icons on glass

Clay `GameAssetIcon` plates stay as painted assets. Glass scope adds a soft dark `drop-shadow` so sculpted icons read on translucent dark chips without a second icon family.

## Files touched

| Path | Role |
| --- | --- |
| `src/theme.css` | Overlay-glass primitives + `[data-game-ui-tone='glass']` / `.game-ui-overlay-scope` token re-scope |
| `src/styles.css` | Glass component overrides + compact density rules |
| `src/clay/tokens.ts` | `overlayGlass` / `overlayGlassText` colors + `CLAY_OVERLAY_GLASS_TOKENS` |
| `src/tokens.ts` | `GAME_UI_OVERLAY`, re-export glass tokens |
| `src/index.ts` | Public exports |
| `src/OverlayGlass.test.tsx` | Token + CSS + markup coverage |
| `src/tokens.test.ts` | Preview-only class list extended |
| `src/bin-swimmer-ui-check.test.ts` | Tone blocks allowed as token scopes |
| `bin/swimmer-ui-check.mjs` | Allow `[data-*tone*=…]` as raw-color token blocks |
| `src/stories/OverlayGlass.stories.tsx` | Clay vs glass stories (busy backdrop) |
| `src/GameUiPreview.tsx` | Overlay glass compare section |
| `src/preview.css` | Compare layout (demo-only) |
| `tmp/wo-u04a-evidence/*` | Screenshots + this report |

## Evidence screenshots

| File | What it shows |
| --- | --- |
| `clay-control-light.png` | Default clay HUD (control) on busy stage |
| `glass-compact-light.png` | Glass + compact on same busy stage (light host context) |
| `glass-on-night.png` | Glass nested under `data-game-ui-theme="night"` |
| `side-by-side.png` | Clay vs glass comparison |
| `capture.mjs` | Playwright capture helper (re-run against Storybook) |

Storybook path: **Clay / Themes / OverlayGlass**

## Test tails

```
pnpm verify
  typecheck ✓
  lint ✓
  format:check ✓
  vitest: 27 files / 141 tests ✓
  build: dist/index.js + styles.css (0 warnings) ✓
```

Key new tests in `OverlayGlass.test.tsx`:

- `:root` overlay-glass primitives match TS color mirrors
- glass scope re-scopes surface/text/elevation; does **not** redeclare `--game-ui-accent`
- component rules + compact density selectors present
- representative HUD markup accepts tone + density attrs / scope class

## Migration notes (consumers)

### Minimal adopt

```tsx
import '@pieai/swimmer-ui-kit/styles.css';
// optional constants
import { GAME_UI_OVERLAY } from '@pieai/swimmer-ui-kit';

<div
  data-game-ui-tone="glass"
  data-game-ui-density="compact"
  // or className={GAME_UI_OVERLAY.scopeClass}
>
  {/* GameButton, GameBadge, GamePanel, GameHud, GameProgress, inputs… */}
</div>
```

No package version bump in this WO — consumers pick this up on the next kit release the director publishes.

### SupaLuv (`apps/web/src/styles/stage.css` ~217–360)

**Can delete / shrink once on a kit build that includes WO-U04a:**

| Override (approx.) | Becomes |
| --- | --- |
| `.vn-stage .game-ui-button { color/border/background/box-shadow !important }` | Covered by glass tone |
| `.vn-stage .game-ui-button:hover { … !important }` | Covered |
| `.vn-stage .game-ui-button[data-variant="primary"]` / `.choice-button` primary fill | Covered by glass primary fill |
| `.vn-stage .game-ui-badge { … }` | Covered |
| Compact `.vn-stage .game-ui-button { min-height: 2.4em; padding… }` | Prefer `data-game-ui-density="compact"` (34px floor) or keep stage-cqw scaling if still needed |

**Keep product-local (not kit chrome):**

- `.vn-stage > * { font-size: clamp(...) }` stage type scale
- `.vn-hud` / dialogue grid / story-copy scroll behavior
- `.meter-block` product chrome (not a kit class)
- Dialogue max-height / player-mode panel tweaks if still product-specific

**Wire-up suggestion:**

```html
<div class="vn-stage" data-game-ui-tone="glass" data-game-ui-density="compact">
```

If stage-relative `em` sizing must stay more aggressive than 34px compact, keep only the cq-based size rules; drop color/shadow `!important` overrides.

### TuringPact

Wrap tavern HUD / scene chrome with the same attributes instead of fighting clay parchment with local overrides. Nested glass still works inside any `data-game-ui-theme`.

## Risks

1. **44px → 34px compact** is intentional for scene HUD density; do not put compact on primary form screens that need full touch floors.
2. **Translucency** depends on a real scene behind the glass; solid host backgrounds will look like opaque dark panels.
3. **`backdrop-filter`** can be expensive on low-end WebViews — already used by kit HUD chips; same cost profile as SupaLuv’s dialogue box.
4. **Forced-colors / high-contrast** still go through existing kit `@media (forced-colors)` paths; glass fills may be neutralized by the OS (same as other authored colors).
5. **Primary text** on glass is light-on-warm-translucent (SupaLuv pattern), not dark ink on solid orange — intentional for scene overlay.

## Out of scope (per WO)

- Package version bump / npm publish  
- `.npmrc` / CI / publish workflow changes  
- Push / merge (director owns review + release)
