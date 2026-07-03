# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Design system

### Clay
The kit's design language: colorful, sculpted, toy-like surfaces with soft
shadows and rounded silhouettes, extracted from TuringPact and shared by all
Pie products. Icons ship in two families — the sculpted, colorful "game"
family (primary, on-brand) and the flat monochrome "line" family (utility
alternate for dense toolbars).

### Design token layers
The three-tier variable architecture every visual value flows through:
**semantic tokens** (what a surface means — panel, accent, text), **derivation
bases** (the inks and papers that alpha washes are mixed from), and
**scenery tokens** (demo-stage backdrops). Component rules may only reference
tokens; raw color values live in exactly one file. Downstream themes override
the semantic layer, adding derivation bases for full fidelity.

### Guard test
A unit test that enforces a design-system or packaging contract rather than
component behavior — e.g. "no raw colors in component CSS", "no Tailwind
at-rules in shipped styles", "the package stays ESM-only". Guard tests are
how a documented rule survives future contributors: a rule without one is
treated as likely to regress.

### Tailwind bridge
An optional, separately-exported stylesheet that maps Tailwind theme names
onto the kit's semantic tokens so Tailwind-using hosts can write utility
classes that follow kit theming. It requires the host's own Tailwind build
and must never be folded into the main stylesheet, which stays 100% standard
CSS for processor-free consumers.

## Distribution

### Central kitchen model
The kit's operating model, defined by the founder: product apps consume the
kit at a pinned exact version; local customization is token overrides only
(never copied component rules); when a product needs something the kit lacks,
the gap is filled upstream and released, and every product gains it on their
next explicit upgrade. A component moves upstream when two or more products
need it.

### Wrapped app
A consumer running the web build inside a native WebView shell (mobile or
desktop). Wrapped apps are first-class targets: the kit adapts by input
capability (hover/pointer media features), never by platform sniffing, and
exposes safe-area insets as overridable tokens because WebView hosts may
need to correct the browser-reported values.
