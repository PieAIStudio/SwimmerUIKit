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
 * On the resting edge, and a correction to what this file said first.
 *
 * It originally set every form to `waviness: 0`, on the strength of a
 * production finding that waviness on a static rounded rectangle reads as a
 * rendering defect. That finding is real, but the rule drawn from it was the
 * wrong one: it blamed amplitude when the culprit is frequency.
 *
 * Rendered side by side at button scale, the old default of amplitude 6 at
 * frequency 0.018 gives a visibly jittery outline — high-frequency noise at the
 * same scale as anti-aliasing, which is exactly why it reads as breakage. The
 * same mechanism at 3 / 0.008 gives a single slow undulation across the whole
 * silhouette: not a machined pill, obviously deliberate, and still smooth
 * everywhere. Same displacement, different wavelength, opposite reading.
 *
 * So single-body forms now rest with a low-frequency waviness, which is how a
 * liquid surface can look liquid while standing still. `seed` and frequency are
 * fixed in the filter, so the silhouette is a stable shape rather than
 * something that crawls — a moving resting edge would be the defect again.
 *
 * The two group forms stay at 0 deliberately. `merge` already says everything
 * through the neck between two bodies, and `follow` is pointing at something,
 * where a soft outline costs precision and buys nothing.
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
  /** Resting displacement, in px. Judge it together with `wavinessFreq`. */
  readonly waviness: number;
  /**
   * Wavelength of that displacement. This is the knob that decides whether a
   * resting edge reads as liquid or as breakage: at 0.018 it is noise, at
   * 0.008 it is form.
   */
  readonly wavinessFreq: number;
  readonly filterPadding: number;
}

/** Item-level behaviour a form fixes on each participating item. */
export interface LiquidFormItem {
  readonly effect?: 'morph' | 'melt' | 'bend';
  readonly morph?: MorphTuning;
  readonly transition?: Transition;
  readonly dissolve?: boolean;
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
    group: { blur: 4, contrast: 24, waviness: 3, wavinessFreq: 0.008, filterPadding: 14 },
    item: {
      effect: 'morph',
      morph: { shape: true, speed: 1, bounce: 0.35, contentBlur: 0 },
      transition: 'bouncy',
    },
  },

  /*
   * Landing. More overshoot than `press` and a slightly softer edge, because
   * the thing being expressed is mass arriving rather than a finger pushing:
   * a piece that drops into place should look like it carried weight there.
   */
  settle: {
    summary: 'Something arrives, overshoots, and comes to rest.',
    group: { blur: 5, contrast: 22, waviness: 3, wavinessFreq: 0.008, filterPadding: 16 },
    item: {
      effect: 'morph',
      morph: { shape: true, speed: 0.9, bounce: 0.55, contentBlur: 0 },
      transition: 'bouncy',
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
    group: { blur: 10, contrast: 14, waviness: 0, wavinessFreq: 0.008, filterPadding: 18 },
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
    group: { blur: 6, contrast: 20, waviness: 0, wavinessFreq: 0.008, filterPadding: 12 },
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
    summary: 'A level rises and holds, the way a poured liquid settles.',
    group: { blur: 6, contrast: 20, waviness: 2, wavinessFreq: 0.008, filterPadding: 12 },
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
    group: { blur: 8, contrast: 16, waviness: 3, wavinessFreq: 0.008, filterPadding: 16 },
    item: { dissolve: true, transition: 'smooth' },
  },
};

/**
 * The band a resting edge may occupy and still read as a surface rather than as
 * damage, measured at button scale. Above either number the silhouette starts
 * looking chipped; the old kit default sat at 6 / 0.018, well outside it.
 */
export const LIQUID_REST_EDGE_LIMITS = { waviness: 3, wavinessFreq: 0.01 } as const;

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
