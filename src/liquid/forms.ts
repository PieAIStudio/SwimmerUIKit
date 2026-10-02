/** Liquid forms are motion vocabulary, not separate material skins. */
import { LIQUID_MATERIAL } from './material/weight';
import type { MorphTuning } from './evolve';
import type { Transition } from './spring';

export type LiquidForm =
  | 'set'
  | 'press'
  | 'swell'
  | 'settle'
  | 'fill'
  | 'reach'
  | 'ripple'
  | 'drain'
  | 'follow'
  | 'merge'
  | 'split'
  | 'bead';

export type LiquidFormKind = 'body' | 'group';

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
}

export interface LiquidFormItem {
  readonly effect?: 'morph';
  readonly morph?: MorphTuning;
  readonly transition?: Transition;
}

export interface LiquidFormSpec {
  /** One sentence on what a viewer sees, for docs and for picking. */
  readonly summary: string;
  /** One body, or a relationship between siblings the caller arranges. */
  readonly kind: LiquidFormKind;
  readonly group: LiquidFormGroup;
  /**
   * Group knobs that change while the form is engaged.
   *
   * Only `set` uses this, and only because `set` is the one form whose subject
   * is *stopping* being liquid — without it the vocabulary can say a dozen
   * degrees of liquid and never say 「solid」. Be careful with it: `blob` is
   * path data and `gloss` is a filter pass, so neither tweens. They snap. For
   * `set` that snap is the gesture — a thing clicking into place — and for
   * anything continuous it would be a flicker, which is why this is not a
   * general-purpose second bundle.
   */
  readonly groupEngaged?: Partial<LiquidFormGroup>;
  readonly item: LiquidFormItem;
}

export const LIQUID_FORMS: Readonly<Record<LiquidForm, LiquidFormSpec>> = {
  set: {
    kind: 'body',
    summary: 'A liquid body firms up and stops being liquid.',
    group: LIQUID_MATERIAL,
    groupEngaged: { blur: 0, blob: 0, gloss: 0 },
    item: {
      effect: 'morph',
      morph: { shape: true, speed: 1.2, bounce: 0.12, contentBlur: 0 },
      transition: 'snappy',
    },
  },
  press: {
    kind: 'body',
    summary: 'A control that squashes under a press and rebounds past its rest shape.',
    group: LIQUID_MATERIAL,

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 1, bounce: 0.35, contentBlur: 0 },
      transition: 'wobbly',
    },
  },
  swell: {
    kind: 'body',
    summary: 'A body grows to be noticed, without being touched.',
    group: LIQUID_MATERIAL,

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 0.7, bounce: 0.4, contentBlur: 0 },
      transition: 'wobbly',
    },
  },
  settle: {
    kind: 'body',
    summary: 'Something arrives, overshoots, and comes to rest.',
    group: LIQUID_MATERIAL,

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 0.9, bounce: 0.55, contentBlur: 0 },
      transition: 'wobbly',
    },
  },
  fill: {
    kind: 'body',
    summary: 'A level rises and holds, the way a poured liquid settles.',
    group: LIQUID_MATERIAL,

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 0.9, bounce: 0.08, contentBlur: 0 },
      transition: 'smooth',
    },
  },
  reach: {
    kind: 'body',
    summary: 'A body stretches toward something and thins as it goes.',
    group: LIQUID_MATERIAL,

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 1, bounce: 0.15, contentBlur: 0 },
      transition: 'smooth',
    },
  },
  ripple: {
    kind: 'body',
    summary: 'A shudder crosses the body and dies out, and nothing breaks.',
    group: LIQUID_MATERIAL,

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 1.6, bounce: 0.5, contentBlur: 0 },
      transition: 'wobbly',
    },
  },
  drain: {
    kind: 'body',
    summary: 'A shape loses its boundary and goes.',
    group: LIQUID_MATERIAL,

    item: { transition: 'smooth' },
  },
  follow: {
    kind: 'group',
    summary: 'A single blob travels to whichever item is active.',
    group: { ...LIQUID_MATERIAL, blur: 6 },

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 1.1, bounce: 0.15, contentBlur: 0 },
      transition: 'smooth',
    },
  },
  merge: {
    kind: 'group',
    summary: 'Neighbouring shapes reach for each other and fuse into one body.',
    group: { ...LIQUID_MATERIAL, blur: 10 },

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 0.8, bounce: 0.2, contentBlur: 0 },
      transition: 'smooth',
    },
  },
  split: {
    kind: 'group',
    summary: 'One body pulls into two, and the neck between them thins and breaks.',
    group: { ...LIQUID_MATERIAL, blur: 10 },

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 0.9, bounce: 0.3, contentBlur: 0 },
      transition: 'smooth',
    },
  },
  bead: {
    kind: 'group',
    summary: 'A scatter of small droplets that can find each other.',
    group: { ...LIQUID_MATERIAL, blur: 8 },

    item: {
      effect: 'morph',
      morph: { shape: true, speed: 1, bounce: 0.45, contentBlur: 0 },
      transition: 'wobbly',
    },
  },
};

export const LIQUID_FORM_NAMES = Object.keys(LIQUID_FORMS) as readonly LiquidForm[];
export function liquidFormGroup(
  form: LiquidForm,
  overrides?: Partial<LiquidFormGroup>,
): LiquidFormGroup {
  return { ...LIQUID_FORMS[form].group, ...overrides };
}
export function liquidFormItem(form: LiquidForm, overrides?: LiquidFormItem): LiquidFormItem {
  const base = LIQUID_FORMS[form].item;
  return {
    ...base,
    ...overrides,
    ...(base.morph || overrides?.morph ? { morph: { ...base.morph, ...overrides?.morph } } : {}),
  };
}
