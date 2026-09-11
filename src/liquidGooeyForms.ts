/*
 * Named liquid forms.
 *
 * Why this file exists: the gooey engine is expressive and completely
 * unnamed. `LiquidGroup` exposes blur, contrast, waviness, wavinessFreq,
 * filterPadding, stroke, shadow, and an item-level `effect` of
 * 'morph' | 'melt' | 'bend' with its own spring and morph tuning. Every one of
 * those is a physical knob, and none of them is a look. To get a liquid button
 * a consumer has to become a goo expert first: University's `LiquidCtaButton`
 * is 166 lines of hand-tuned configuration wrapped around a normal button, and
 * it reached the right settings by trial — `waviness={0}` and `contrast={24}`
 * against kit defaults of 6 and 18 — without any of that knowledge coming back
 * here. The second product to want liquid would have started from the same
 * defaults and rediscovered the same corrections.
 *
 * A form is the missing layer: a tested bundle of knobs under a name that says
 * what it looks like, so a caller picks a behaviour instead of a physics
 * configuration.
 *
 * On the resting edge, and a second correction to what this file said.
 *
 * It first set every form to `waviness: 0`, on the strength of a production
 * finding that a wavy outline on a static rounded rectangle reads as a
 * rendering defect. It then reversed that, blaming the frequency rather than
 * the amplitude, and shipped low-frequency waviness with a cap on the product
 * of the two. Both revisions were judged from renders. The renders were real;
 * the reading of them was not.
 *
 * Measured properly — device ratio 1, alpha recovered from two backgrounds,
 * sampled along the straight top edge — the low-frequency settings move the
 * outline by a constant 1.5px and vary it by 0.01px across the whole side.
 * There was no wave. The cap that looked like it was protecting the edge was
 * choosing frequencies low enough for the feature to disappear, and scoring
 * well for it. The one place it did vary, it varied as a single 1px step,
 * because Chrome resamples `feDisplacementMap` with nearest-neighbour and the
 * contour can only land on whole pixels.
 *
 * So the shape does not come from the filter at all any more. `blob` pours the
 * outline outward in the path data itself: exact at every device ratio, free
 * of the sampling grid that made the filter route choose between jitter and a
 * notch, and cheaper, since it removes two full-region filter passes.
 */

import type { MorphTuning } from './liquidGooeyEvolve';
import type { Transition } from './liquidGooeySpring';

/**
 * The named looks, ordered by how much cohesion the liquid is losing:
 * `press` barely deforms, `drain` stops being a shape at all.
 */
export type LiquidForm = 'press' | 'settle' | 'merge' | 'follow' | 'fill' | 'drain';

/** Filter-level knobs a form fixes on the group. */
export interface LiquidFormGroup {
  readonly blur: number;
  readonly contrast: number;
  /**
   * How far the outline swells outward from the control's box, in px. The
   * bulge is outward-only, so this never eats into a label's padding, and it
   * is clamped to 18% of the shorter side so one number suits a 44px button
   * and a 14px meter.
   */
  readonly blob: number;
  /** How many swells go round the outline. 2 is lazy, 5 is busy. */
  readonly lobes: number;
  /**
   * Volume. The edge says 「liquid」 only as an outline; this is what makes the
   * inside of the body look like a material instead of a flat sticker.
   */
  readonly gloss: number;
  readonly filterPadding: number;
  /**
   * What the body casts on the ground at rest, in CSS box-shadow syntax.
   *
   * Every liquid button floated before this existed: the flat button has a lip
   * *and* `--game-ui-shadow-button`, and the liquid one had neither, which is
   * most of why it read flatter than its own flat twin. A form is where this
   * belongs rather than a call site, because how far a body sits off the
   * surface is part of what the form means.
   *
   * Keep it to outer layers with no spread. `liquidGooeyShadow` compiles those
   * to a CSS `drop-shadow()` on the silhouette — the compositor does the blur,
   * the shadow hugs the poured outline rather than a rounded rectangle, and it
   * is allowed to paint outside the filter region. Inset and spread are legal
   * but stay inside the SVG filter and are charged against the filter-area
   * budget, so they are a deliberate purchase, not a default.
   */
  readonly shadow?: string;
  /**
   * What it casts while the form is engaged, when that differs.
   *
   * A body that squashes toward the surface gets *closer* to it, and a real
   * contact shadow answers by tightening and darkening rather than staying
   * put. Leaving this out is fine; the rest shadow then holds through the
   * whole gesture, which is what a form with no vertical travel wants.
   */
  readonly shadowEngaged?: string;
}

/** Item-level behaviour a form fixes on each participating item. */
export interface LiquidFormItem {
  readonly effect?: 'morph' | 'melt' | 'bend';
  readonly morph?: MorphTuning;
  readonly transition?: Transition;
  readonly dissolve?: boolean;
}

/*
 * The one shadow colour is a token; everything else is the form's own.
 *
 * `--game-ui-shadow-liquid-ink` is a solid colour per theme rather than a
 * finished shadow, so a form can say "a fifth of the ink at 2px" without
 * restating the room's light, and a night theme changes one value instead of
 * six. Each layer is outer with no spread on purpose — that is exactly the
 * case `compositorDropShadowFilter` lifts off the SVG filter and onto the
 * compositor, where it costs nothing and hugs the poured outline instead of a
 * rounded rectangle.
 */
function layer(y: number, blur: number, strength: number): string {
  return `0 ${y}px ${blur}px color-mix(in srgb, var(--game-ui-shadow-liquid-ink) ${strength}%, transparent)`;
}

/*
 * Two layers, because one cannot say both things a resting body says.
 *
 * A tight, barely offset layer is the *seat*: the darkness trapped where the
 * body meets the surface, and the only part of a shadow that says "touching".
 * A wide, low one is the cast, and it is what gives height. Compared at device
 * ratio 1 against the flat button — which gets the same two ideas as a solid
 * lip plus `--game-ui-shadow-button` — a seat alone glues the body to the page
 * and a cast alone leaves it hovering. The flat control is the reference the
 * liquid one has to stand next to, so it needs both.
 *
 * Chained `drop-shadow()`s do shadow each other. At these strengths that
 * compounding is what deepens the mid-tone between the two layers, which is
 * the effect wanted; it is worth remembering before anyone raises them.
 */
function cast(...layers: readonly string[]): string {
  return layers.join(', ');
}

export interface LiquidFormSpec {
  /** One sentence on what a viewer sees, for docs and for picking. */
  readonly summary: string;
  readonly group: LiquidFormGroup;
  readonly item: LiquidFormItem;
}

/*
 * Two knobs decide whether a form reads as liquid at all, and they pull against
 * each other:
 *
 * - `blur` sets the merge radius. It is the distance over which two separate
 *   silhouettes still see each other as one body, so a form about joining
 *   wants a large blur and a form about one crisp control wants a small one.
 * - `contrast` sets the alpha slope that turns that blur back into an edge.
 *   High contrast is a hard rim; low contrast is a soft body that merges
 *   readily but can look out of focus.
 *
 * So `merge` sits at the high-blur/low-contrast end and `press` at the
 * low-blur/high-contrast end, and the forms between them are the useful
 * intermediate points rather than arbitrary presets.
 *
 * Three forms carry a shadow and three deliberately do not, and the split is
 * not laziness:
 *
 * - `press`, `settle` and `drain` are bodies on a surface. Their whole subject
 *   is weight — being pushed into something, landing on it, slumping off it —
 *   and a body with weight and no shadow is the one thing the eye refuses.
 * - `fill` lives *inside* a track, which is usually a recessed groove. A level
 *   that casts a shadow onto the groove it is filling has stopped being a
 *   level. What that form wants, if anything, is an inset — and an inset is
 *   charged to the filter-area budget on a control that is often thin, so it
 *   is a purchase to make against a real meter, not here.
 * - `merge` and `follow` are group forms: the caller arranges the items, so
 *   the caller owns the ground they sit on. `follow`'s marker rides inside a
 *   rail and `merge`'s bodies may be mid-air; neither has one right answer
 *   from in here. They take `shadow` on the group like any other caller.
 */
export const LIQUID_FORMS: Readonly<Record<LiquidForm, LiquidFormSpec>> = {
  /*
   * Proven before it was named: this is the configuration University's CTA
   * arrived at across eighteen surfaces. Small blur and a firm edge, because a
   * primary button has to keep a crisp, hit-testable silhouette; the liquid is
   * in the rebound, not in the outline.
   */
  press: {
    summary: 'A control that squashes under a press and rebounds past its rest shape.',
    group: {
      blur: 4,
      contrast: 24,
      blob: 5,
      lobes: 3,
      gloss: 5,
      filterPadding: 28,
      // Resting on the surface, not hovering over it.
      shadow: cast(layer(2, 4, 22), layer(9, 18, 22)),
      // Pushed down, so it is nearer the ground: the seat hardens and the cast
      // collapses toward the body, which is what a shortening gap does.
      shadowEngaged: cast(layer(1, 3, 28), layer(4, 9, 26)),
    },
    item: {
      effect: 'morph',
      morph: { shape: true, speed: 1, bounce: 0.35, contentBlur: 0 },
      transition: 'wobbly',
    },
  },

  /*
   * Landing. More overshoot than `press` and a slightly softer edge, because
   * the thing being expressed is mass arriving rather than a finger pushing:
   * a piece that drops into place should look like it carried weight there.
   */
  settle: {
    summary: 'Something arrives, overshoots, and comes to rest.',
    group: {
      blur: 5,
      contrast: 22,
      blob: 4,
      lobes: 3,
      gloss: 5,
      filterPadding: 26,
      // Rest for this form is mid-air — `AT_REST` lifts it 8px and stretches
      // it thin. A body in the air has no seat at all, only a wide weak cast;
      // adding a tight layer here would be drawing contact that is not
      // happening.
      shadow: cast(layer(16, 28, 15)),
      // Landed, and the ground notices. This pair is the whole reason the
      // engaged shadow exists: without it a form about arriving arrives onto
      // nothing.
      shadowEngaged: cast(layer(2, 4, 26), layer(5, 11, 24)),
    },
    item: {
      effect: 'morph',
      morph: { shape: true, speed: 0.9, bounce: 0.55, contentBlur: 0 },
      transition: 'wobbly',
    },
  },

  /*
   * The signature move, and the only one that needs more than one item to mean
   * anything. Largest blur so neighbouring silhouettes reach each other, and
   * the lowest contrast in the set so the neck between them stays smooth while
   * it forms and breaks. `filterPadding` is larger because a merged body is
   * wider than the boxes that make it.
   */
  merge: {
    summary: 'Neighbouring shapes reach for each other and fuse into one body.',
    group: {
      blur: 10,
      contrast: 14,
      blob: 0,
      lobes: 3,
      gloss: 6,
      filterPadding: 18,
    },
    item: {
      effect: 'morph',
      morph: { shape: true, speed: 0.8, bounce: 0.2, contentBlur: 0 },
      transition: 'smooth',
    },
  },

  /*
   * A blob that chases the active item in a group — a segmented control, a
   * tab rail. Deliberately the least bouncy of the moving forms: a marker that
   * overshoots its target reads as imprecise rather than as alive, and this one
   * is pointing at something.
   */
  follow: {
    summary: 'A single blob travels to whichever item is active.',
    group: { blur: 6, contrast: 20, blob: 0, lobes: 3, gloss: 3, filterPadding: 12 },
    item: {
      effect: 'morph',
      morph: { shape: true, speed: 1.1, bounce: 0.15, contentBlur: 0 },
      transition: 'smooth',
    },
  },

  /*
   * A level rising — progress, capacity, a meter. Almost no bounce on purpose:
   * a quantity that springs past its value and comes back has told the viewer
   * something untrue for a few frames.
   */
  fill: {
    /*
      Calmer than the other single-body forms on purpose. This one lands on
      progress bars and meters, which are thin. `blob` clamps to 18% of the
      shorter side, so a bold amplitude on a 14px bar spends the whole clamp
      and the level stops reading as a level.
    */
    summary: 'A level rises and holds, the way a poured liquid settles.',
    group: { blur: 6, contrast: 20, blob: 2, lobes: 2, gloss: 4, filterPadding: 14 },
    item: {
      effect: 'morph',
      morph: { shape: true, speed: 0.9, bounce: 0.08, contentBlur: 0 },
      transition: 'smooth',
    },
  },

  /*
   * Leaving. Contrast drops furthest here because the point is the loss of a
   * clean boundary: the shape should stop being a shape before it stops being
   * visible.
   */
  drain: {
    summary: 'A shape loses its boundary and goes.',
    group: {
      blur: 8,
      contrast: 16,
      blob: 7,
      lobes: 4,
      gloss: 5,
      filterPadding: 30,
      shadow: cast(layer(2, 4, 22), layer(9, 18, 22)),
      // Slumping: it spreads, so it touches more ground and lifts off less,
      // and both layers widen as they weaken. The silhouette's own alpha
      // carries the ending — a `drop-shadow` fades with what casts it, so the
      // shadow leaves when the body does without being told to.
      shadowEngaged: cast(layer(2, 7, 15), layer(6, 24, 14)),
    },
    item: { dissolve: true, transition: 'smooth' },
  },
};

/** Every form name, for shelves, docs and exhaustiveness checks. */
export const LIQUID_FORM_NAMES = Object.keys(LIQUID_FORMS) as readonly LiquidForm[];

/**
 * Resolve a form into group props, letting a caller override single knobs.
 *
 * Overrides are merged rather than replacing the bundle, so a surface that
 * needs one different value does not have to restate the other three and
 * silently drift from the form it claims to be using.
 */
export function liquidFormGroup(
  form: LiquidForm,
  overrides?: Partial<LiquidFormGroup>,
): LiquidFormGroup {
  return { ...LIQUID_FORMS[form].group, ...overrides };
}

/** Resolve a form into item props, with the same merge-don't-replace rule. */
export function liquidFormItem(form: LiquidForm, overrides?: LiquidFormItem): LiquidFormItem {
  const base = LIQUID_FORMS[form].item;
  return {
    ...base,
    ...overrides,
    ...(base.morph || overrides?.morph ? { morph: { ...base.morph, ...overrides?.morph } } : {}),
  };
}
