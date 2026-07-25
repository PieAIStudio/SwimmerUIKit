/*
 * Structural ownership analysis for kit stylesheets.
 *
 * Why this exists (1.3.0): `.game-ui-callout` was declared twice in
 * styles.css — once as a decorative absolutely-positioned speech bubble for
 * the demo table in <GameUiPreview />, and once as the real <GameCallout>
 * component. CSS only overrides the properties a later rule re-declares, so
 * every product's <GameCallout> silently inherited `position: absolute` and
 * `white-space: nowrap` from scenery it had nothing to do with. Four
 * downstream products (SupaLuv, Sea console, Sea viewer, Anvil) each shipped
 * their own `position: static` patch instead of the bug being fixed here.
 *
 * The invariant that would have caught it, stated as a rule a design system
 * can actually keep: **a class may define its box/flow model in exactly one
 * place.** Cosmetic rules (color, padding, animation, shadow) may be split
 * across as many rules as readability wants; only the structural claim is
 * exclusive. That keeps the legitimate "base rule here, motion rule in the
 * motion section" pattern legal while making a name collision between two
 * unrelated components a hard failure.
 */

/**
 * Properties that decide how a box participates in layout. Re-declaring any
 * of these is a claim of ownership over the element's flow.
 */
export const STRUCTURAL_PROPERTIES: readonly string[] = [
  'position',
  'display',
  'float',
  'white-space',
  'inset',
  'top',
  'right',
  'bottom',
  'left',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-area',
  'grid-column',
  'grid-row',
  'flex-direction',
];

export interface StructuralClaim {
  /** Single bare class selector, including the leading dot. */
  readonly selector: string;
  /** 1-based line of the rule's opening brace. */
  readonly line: number;
  /** Structural properties this rule declares, in source order. */
  readonly properties: readonly string[];
}

export interface OwnershipViolation {
  readonly selector: string;
  readonly claims: readonly StructuralClaim[];
}

/** Blank out comments while preserving byte offsets so line numbers stay true. */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));
}

function lineAt(css: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (css[i] === '\n') line += 1;
  return line;
}

/**
 * Structural properties declared directly in a rule body, ignoring any
 * nested rule bodies (CSS nesting) so a child's layout is not read as the
 * parent's claim.
 */
function structuralPropertiesOf(body: string): string[] {
  let depth = 0;
  let own = '';
  for (const char of body) {
    if (char === '{') depth += 1;
    else if (char === '}') depth -= 1;
    else if (depth === 0) own += char;
  }
  const found: string[] = [];
  for (const declaration of own.split(';')) {
    const name = declaration.split(':', 1)[0]?.trim().toLowerCase();
    if (name && STRUCTURAL_PROPERTIES.includes(name) && !found.includes(name)) found.push(name);
  }
  return found;
}

/**
 * Collect every rule whose prelude is exactly one bare class selector and
 * which sits at unconditional nesting depth. `@layer` is transparent here —
 * the kit wraps everything in `@layer swimmer-ui` — but `@media`,
 * `@supports` and `@container` rules are conditional overrides and are
 * intentionally exempt.
 */
export function collectStructuralClaims(css: string): StructuralClaim[] {
  const source = stripComments(css);
  const claims: StructuralClaim[] = [];
  const stack: { readonly atRule: boolean; readonly prelude: string }[] = [];
  let prelude = '';
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    if (char === '{') {
      const text = prelude.replace(/\s+/g, ' ').trim();
      prelude = '';
      if (text.startsWith('@')) {
        stack.push({ atRule: true, prelude: text });
        index += 1;
        continue;
      }
      const conditional = stack.some(
        (frame) => frame.atRule && !frame.prelude.startsWith('@layer'),
      );
      if (!conditional && /^\.[A-Za-z0-9_-]+$/.test(text)) {
        let depth = 1;
        let end = index + 1;
        while (end < source.length && depth > 0) {
          if (source[end] === '{') depth += 1;
          else if (source[end] === '}') depth -= 1;
          end += 1;
        }
        const properties = structuralPropertiesOf(source.slice(index + 1, end - 1));
        if (properties.length > 0) {
          claims.push({ selector: text, line: lineAt(source, index), properties });
        }
      }
      stack.push({ atRule: false, prelude: text });
      index += 1;
      continue;
    }
    if (char === '}') {
      stack.pop();
      prelude = '';
      index += 1;
      continue;
    }
    if (char === ';') {
      prelude = '';
      index += 1;
      continue;
    }
    prelude += char;
    index += 1;
  }

  return claims;
}

/**
 * Classes whose box/flow model is claimed by more than one unconditional
 * rule. A non-empty result means two rules — usually two different
 * components that collided on a name — are fighting over one element's
 * layout, and the loser's properties leak into the winner.
 */
export function findOwnershipViolations(css: string): OwnershipViolation[] {
  const bySelector = new Map<string, StructuralClaim[]>();
  for (const claim of collectStructuralClaims(css)) {
    const existing = bySelector.get(claim.selector);
    if (existing) existing.push(claim);
    else bySelector.set(claim.selector, [claim]);
  }
  return [...bySelector]
    .filter(([, claims]) => claims.length > 1)
    .map(([selector, claims]) => ({ selector, claims }));
}

/** One human-readable line per violation, for test output and the CLI. */
export function formatOwnershipViolation(violation: OwnershipViolation): string {
  const where = violation.claims
    .map((claim) => `line ${claim.line} (${claim.properties.join(', ')})`)
    .join(' and ');
  return `${violation.selector} claims layout in ${violation.claims.length} places: ${where}`;
}
