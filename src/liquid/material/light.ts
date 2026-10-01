/*
 * The presence material's fall of light (University, 2026-10-01).
 *
 * 涟's droplet and its reveal panel carry their light in the fill: a narrow
 * brighter band along the top, `from` falling to `to`, and a foot a touch
 * deeper. The gloss pass stays for the sheen on the shoulder; the fill is what
 * makes the body read as having thickness, so a raised rim is no longer needed.
 * Stops are mixed with CSS `color-mix` from the presence palette variables, so
 * a status colour (warning) or a host palette flows through unchanged. The
 * matching contact shadow lives in liquid-presence.css.
 */
const FROM = 'var(--liquid-presence-from, var(--game-ui-secondary))';
const TO = 'var(--liquid-presence-to, var(--game-ui-secondary))';

export const PRESENCE_MATERIAL_LIGHT: readonly (readonly [number, string])[] = [
  [0, `color-mix(in srgb, ${FROM}, white 18%)`],
  [0.16, `color-mix(in srgb, ${FROM}, white 9%)`],
  [0.55, `color-mix(in srgb, ${FROM}, ${TO})`],
  [1, `color-mix(in srgb, ${TO}, black 5%)`],
];
