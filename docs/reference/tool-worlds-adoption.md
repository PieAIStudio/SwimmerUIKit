---
id: REF-TOOL-WORLDS-ADOPTION
title: Colour Worlds adoption
type: reference
status: active
canonical: true
owner: project
created: 2026-10-30
last_reviewed: 2026-10-30
domain: ui-components
tags:
  - uikit-4
  - colour-worlds
  - matrixapps
pinned: false
related:
  - REF-COMPONENT-SELECTION-GUIDE
  - REF-DESIGN-TOKENS
  - REF-DESIGN-SYSTEM-GUIDE
  - REF-MIGRATION-3-0
---

# Colour Worlds adoption

Colour Worlds is the UIKit 4.0 tool layer. It gives MatrixAPPs one window language and one set of parts; the consuming app still owns routes, data, permissions, 3D art, copy, translations and business actions.

## Switch from the quiet shell

1. Install one exact 4.0 alpha version from npm `next`; do not upgrade a 3.x consumer in place without its own acceptance.
2. Import the tool parts from `@pieai/swimmer-ui-kit/tool-worlds` and replace the old tool-shell import with `ToolWindow` and `ToolSidebar`. Keep game `Shell` and liquid imports only where the app is using game surfaces; they are separate contracts.
3. Set exactly one `world` on `ToolWindow`. Use the app assignment below; do not mix worlds in one app and do not override `--swimmer-act`.
4. Compose the page from `ToolLanding`, `GlassCard`, `ManagerSheet`, `BentoProgress`, `RoundAction`, `Gem`, `Checkbox`, `ActionPill` and `Switch`. Put the real app action/data handlers underneath these parts.
5. Use the same layout for English and Chinese. Let text wrap; do not add ellipsis or a native `select` to rescue a narrow layout. Use `sidebarMode="rail"` for review/manager views and the 380×600 popup layout for AutoContinue.
6. Add the consumer guard to the app's check command: `swimmer-ui-check <app-source> --rules=tool`. It rejects native select, visible native checkboxes, painted sidebars, opaque white cards on worlds, and marked main actions that are not `RoundAction`.

The alpha is a hard break: there is no quiet/aura tool-shell alias. An app migrates deliberately or stays on its existing exact 3.x package.

## Part map

| Quiet-shell / app pattern | Colour Worlds part | Ownership after migration |
| --- | --- | --- |
| `Shell` tool mode, `look="glass"`/`"aura"` | `ToolWindow` | UIKit paints one world; app chooses the world and supplies children. |
| `sidebar`/`windowBar`/`mobileNav` slots | `ToolSidebar` | UIKit owns transparent chrome and rail geometry; app supplies navigation items. |
| PageSurface title/content slots | `ToolLanding`, `GlassCard`, `ManagerSheet`, `BentoProgress` | UIKit owns structure; app owns route, data and copy. |
| wide primary `Button` | `RoundAction` | UIKit owns the 92px go/stop shape; app owns the actual task and safety promise. |
| quiet result `Panel` / white card | `GlassCard` | UIKit owns dark glass; app supplies result text and quiet text actions. |
| hand-built list, native checkbox or select | `ManagerSheet` + `Checkbox` | UIKit owns sheet, row selection and focus treatment; app owns search/sort state. |
| ad-hoc pink footer button | `ActionPill` | UIKit owns the shared action colour; app owns label and callback. |
| custom glossy feature square | `Gem` | UIKit owns the world-colour gem; app supplies the line icon. |
| native-looking on/off row | `Switch` | UIKit owns the painted track and hidden real input; app owns checked state. |
| animated progress grid | `BentoProgress` | UIKit paints done/now/waiting tiles; app owns real progress and cancellation. |
| duplicated line-glyph map | `Icon` / `ToolIcon` | Use an existing `Icon` name first; use `ToolIcon` only for a contract glyph gap. |

## App worlds

| App | World | 380×600 popup |
| --- | --- | --- |
| ClaudeSync | `violet` | no |
| MailWard | `coral` | no |
| OnePlace | `teal` | no |
| Attendant | `indigo` | no |
| AutoContinue | `magenta` | yes |
| Future app | `green`, `orange` or `blue` | app decision |

`--swimmer-world-<name>-{c1,c2,c3,acc,gem1,gem2}` defines the eight available worlds. `--swimmer-act` is the same pink action colour in every app; its painted text uses `--swimmer-act-ink`, while sheet copy uses `--swimmer-act-text` or `--swimmer-act-text-dark`. c1 is a decorative glow, not a text surface; if app content must sit directly on it, use `--swimmer-tool-text-on-glow`. The world is the only app-level colour axis; 3D art and content are the intentional per-app differences.

## Acceptance checklist

- Real buttons, links, search inputs and checkbox inputs remain underneath painted parts.
- `ToolSidebar` is transparent and has one faint divider; rail items are 38px circles and the selected item is a gem.
- There is one `RoundAction` main action and one visible safety promise.
- English and Chinese fit without truncation; inspect both normal and rail layouts.
- Check light/dark manager sheets, visible focus rings and `prefers-reduced-motion: reduce`.
- Run the related app tests plus `swimmer-ui-check --rules=tool`; this does not replace the app's own business and Electron acceptance.
