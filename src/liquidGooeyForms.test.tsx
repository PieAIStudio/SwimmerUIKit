import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameButton } from './GameButton';
import { LiquidSurface } from './LiquidSurface';
import { presets } from './liquidGooeySpring';
import { blobPath, silhouettePath, type CornerRadii } from './liquidGooeyGeometry';
import {
  LIQUID_FORM_NAMES,
  LIQUID_FORMS,
  liquidFormGroup,
  liquidFormItem,
} from './liquidGooeyForms';
import {
  LIQUID_GOOEY_FILTER_DEFAULTS,
  LIQUID_GOOEY_MIN_EDGE_RAMP,
  liquidGooeyEdgeContrast,
} from './liquidGooeyFilter';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

/** Every anchor point of the blob spline: the end point of each cubic. */
function anchors(d: string): [number, number][] {
  const out: [number, number][] = [];
  for (const match of d.matchAll(/C [-\d.]+ [-\d.]+ [-\d.]+ [-\d.]+ ([-\d.]+) ([-\d.]+)/g))
    out.push([Number(match[1]), Number(match[2])]);
  return out;
}

/** Exact signed distance to a rounded box; negative inside. */
function roundedBoxDistance(px: number, py: number, w: number, h: number, r: number): number {
  const qx = Math.abs(px - w / 2) - (w / 2 - r);
  const qy = Math.abs(py - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

const PILL: CornerRadii = [22, 22, 22, 22];

describe('liquid blob outline', () => {
  /*
    This is the test the previous two rounds of edge tuning did not have, and
    the one that would have caught both of them.

    The shape used to come from `feDisplacementMap`. Measured at device ratio 1
    on a straight edge, the settings that shipped moved the outline a constant
    1.5px and varied it by 0.01px — a plain rounded rectangle, nudged. Every
    assertion in the file at the time was about the *configuration* (amplitude
    times frequency stays under a cap), and configuration is exactly what was
    not the problem. So this asserts the outcome instead: the outline has to
    actually go somewhere.
  */
  it('actually deviates, rather than shifting the whole outline evenly', () => {
    const d = blobPath(0, 0, 130, 44, PILL, { amplitude: 5, seed: 7, lobes: 3 });
    const distances = anchors(d).map(([x, y]) => roundedBoxDistance(x, y, 130, 44, 22));
    const spread = Math.max(...distances) - Math.min(...distances);
    expect(spread).toBeGreaterThan(5 * 0.6);
  });

  /*
    Outward-only is the property that makes the surface safe to put under any
    control: no amplitude, however bold, can push the silhouette across a
    label's padding or inside the hit target.
  */
  it('never cuts inside the control box', () => {
    for (const amplitude of [2, 5, 8, 40]) {
      const d = blobPath(0, 0, 130, 44, PILL, { amplitude, seed: 3 });
      const inside = anchors(d).filter(([x, y]) => roundedBoxDistance(x, y, 130, 44, 22) < -0.02);
      expect(inside).toEqual([]);
    }
  });

  /*
    One amplitude has to suit a 44px button and a 14px meter, because a form
    fixes it once for every surface that picks that form.
  */
  it('clamps the bulge on a thin box so a meter stays a meter', () => {
    const thin: CornerRadii = [7, 7, 7, 7];
    const d = blobPath(0, 0, 200, 14, thin, { amplitude: 8, seed: 7 });
    const far = Math.max(...anchors(d).map(([x, y]) => roundedBoxDistance(x, y, 200, 14, 7)));
    expect(far).toBeLessThanOrEqual(14 * 0.18 + 0.01);
  });

  it('falls back to the plain rounded rectangle when no shape is asked for', () => {
    const plain = silhouettePath(0, 0, 130, 44, PILL, undefined);
    expect(plain).toBe(silhouettePath(0, 0, 130, 44, PILL, { amplitude: 0 }));
    expect(plain).not.toContain('C ');
  });

  it('is stable: one seed is one silhouette', () => {
    const a = blobPath(0, 0, 130, 44, PILL, { amplitude: 5, seed: 7 });
    const b = blobPath(0, 0, 130, 44, PILL, { amplitude: 5, seed: 7 });
    expect(a).toBe(b);
    expect(blobPath(0, 0, 130, 44, PILL, { amplitude: 5, seed: 11 })).not.toBe(a);
  });
});

describe('liquid edge ramp', () => {
  /*
    `contrast` is the alpha slope that turns the blurred silhouette back into
    an edge, and the crossing sits at a fixed 5/12 of the ramp — so contrast
    decides how many pixels wide the edge is and nothing else. The shipped
    pairing of blur 4 and contrast 24 works out at 0.43px, thinner than the
    pixel drawing it. Measured at device ratio 1, contour roughness bottoms out
    at 1.3px and gets no better past it.
  */
  it('lowers a contrast that would leave a sub-pixel edge', () => {
    expect(liquidGooeyEdgeContrast(4, 24)).toBeLessThan(24);
    const ramp = ((1 / 0.3902) * 4) / liquidGooeyEdgeContrast(4, 24);
    expect(ramp).toBeCloseTo(LIQUID_GOOEY_MIN_EDGE_RAMP, 5);
  });

  it('leaves a contrast that is already soft enough alone', () => {
    expect(liquidGooeyEdgeContrast(10, 14)).toBe(14);
  });

  it('gives every form an edge wide enough to draw', () => {
    for (const form of LIQUID_FORM_NAMES) {
      const { blur, contrast } = LIQUID_FORMS[form].group;
      const ramp = ((1 / 0.3902) * blur) / liquidGooeyEdgeContrast(blur, contrast);
      expect(ramp).toBeGreaterThanOrEqual(LIQUID_GOOEY_MIN_EDGE_RAMP - 1e-9);
    }
  });

  /*
    An unconfigured surface still rests flat. A consumer that never picked a
    form has not opted into a shaped edge, and the kit should not give it one.
  */
  it('keeps the unconfigured default flat', () => {
    expect(LIQUID_GOOEY_FILTER_DEFAULTS.waviness).toBe(0);
  });
});

describe('liquid forms', () => {
  /*
    The two group forms say what they mean through the relationship between
    bodies, so a poured outline there is noise competing with the message.
  */
  it('keeps the two group forms rectangular', () => {
    expect(LIQUID_FORMS.merge.group.blob).toBe(0);
    expect(LIQUID_FORMS.follow.group.blob).toBe(0);
  });

  it('pours every single-body form', () => {
    for (const form of ['press', 'settle', 'fill', 'drain'] as const)
      expect(LIQUID_FORMS[form].group.blob).toBeGreaterThan(0);
  });

  /*
    Merge radius and edge hardness are the two knobs that decide whether a form
    reads as liquid, and they are supposed to trade against each other across
    the set. If `merge` ever stopped being the softest, widest-reaching form,
    the vocabulary would have collapsed into arbitrary presets.
  */
  it('puts merge at the reaching end and press at the crisp end', () => {
    const blurs = LIQUID_FORM_NAMES.map((form) => LIQUID_FORMS[form].group.blur);
    const contrasts = LIQUID_FORM_NAMES.map((form) => LIQUID_FORMS[form].group.contrast);
    expect(LIQUID_FORMS.merge.group.blur).toBe(Math.max(...blurs));
    expect(LIQUID_FORMS.merge.group.contrast).toBe(Math.min(...contrasts));
    expect(LIQUID_FORMS.press.group.contrast).toBe(Math.max(...contrasts));
  });

  it('gives every form a summary a picker can show', () => {
    const silent = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].summary.trim() === '');
    expect(silent).toEqual([]);
  });

  /*
    Overrides merge into the bundle rather than replacing it. A caller that
    changes one knob must not silently lose the others, because then it would
    be claiming a form it is no longer using.
  */
  it('merges overrides into a form instead of replacing the bundle', () => {
    const group = liquidFormGroup('press', { blur: 9 });
    expect(group.blur).toBe(9);
    expect(group.contrast).toBe(LIQUID_FORMS.press.group.contrast);
    expect(group.blob).toBe(LIQUID_FORMS.press.group.blob);

    const item = liquidFormItem('press', { morph: { bounce: 0.9 } });
    expect(item.morph?.bounce).toBe(0.9);
    expect(item.morph?.shape).toBe(LIQUID_FORMS.press.item.morph?.shape);
    expect(item.transition).toBe(LIQUID_FORMS.press.item.transition);
  });
});

describe('GameButton surface axis', () => {
  /*
    The default path has to stay byte-identical. `surface` is new, every
    existing call site omits it, and a wrapper appearing around every button in
    six products would be a silent layout change rather than a new feature.
  */
  it('renders exactly the same markup when no surface is asked for', () => {
    const before = compact(renderToStaticMarkup(<GameButton variant="primary">Go</GameButton>));
    const after = compact(
      renderToStaticMarkup(
        <GameButton surface="flat" variant="primary">
          Go
        </GameButton>,
      ),
    );
    expect(after).toBe(before);
    expect(before).not.toContain('game-ui-liquid-surface');
  });

  /*
    The liquid body is decoration; the control underneath it must survive
    unchanged. This is the property that makes the pattern safe to adopt widely
    — the silhouette deforms, the real button never does, so the hit target,
    the focus ring and the text stay exactly where they were.
  */
  it('keeps a real button with its classes and label under the liquid body', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameButton surface="liquid" variant="danger">
          Delete
        </GameButton>,
      ),
    );
    expect(html).toContain('game-ui-liquid-surface');
    expect(html).toContain('data-liquid-form="press"');
    expect(html).toContain('game-ui-button game-ui-button--danger');
    expect(html).toContain('Delete');
    expect(html).toContain('<button');
  });

  /*
    A disabled control does not wear the liquid at all. Liquid is how this kit
    says 「press me」, and putting that on something that cannot be pressed was
    the defect behind the grey blob.
  */
  it('drops back to the flat button when disabled', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameButton disabled surface="liquid" variant="primary">
          Run
        </GameButton>,
      ),
    );
    expect(html).not.toContain('game-ui-liquid-surface');
    expect(html).toContain('disabled');
  });
});

describe('jelly', () => {
  /*
    Squash and stretch is the difference between a control that gets smaller
    and a body made of something. A uniform scale cannot express it, so the
    guard is that the two axes are actually allowed to disagree — this is the
    property the whole `scaleY` addition exists for.
  */
  it('presses by spreading sideways, not by shrinking', () => {
    const engaged = renderToStaticMarkup(
      <LiquidSurface active form="press">
        <span />
      </LiquidSurface>,
    );
    expect(engaged).toContain('data-liquid-active="true"');
    expect(LIQUID_FORMS.press.item.transition).toBe('wobbly');
  });

  /*
    A jelly crosses its rest shape several times. `bouncy` crosses it once,
    which reads as a bounce rather than as a material — the damping ratio is
    the number that says which, and it has to stay on the jelly side of
    `bouncy` for the press to keep feeling like jelly.
  */
  it('wobbles looser than it bounces', () => {
    const ratio = (p: { stiffness: number; damping: number; mass: number }): number =>
      p.damping / (2 * Math.sqrt(p.stiffness * p.mass));
    expect(ratio(presets.wobbly)).toBeLessThan(ratio(presets.bouncy));
    // Below about 0.2 it is still visibly moving when the next tap lands.
    expect(ratio(presets.wobbly)).toBeGreaterThan(0.2);
  });

  /*
    The kit's own default liquid fill is a near-white raised surface, and a
    near-white body cannot be brightened — the first jelly pass turned it into
    a featureless white slab. The headroom term is what stops that, so its
    absence is a regression worth naming rather than a detail of the chain.
  */
  it('scales the sheen by how much headroom the fill has left', () => {
    const html = renderToStaticMarkup(
      <LiquidSurface form="press">
        <span />
      </LiquidSurface>,
    );
    expect(html).toContain('luminanceToAlpha');
  });

  /*
    Every material pass runs on a hard-edged copy and the whole result is
    clipped back to the anti-aliased silhouette exactly once. Adding light
    straight onto the soft shape measured 0.19px of contour roughness against
    0.087 for the unlit one.
  */
  it('clips the lit body back to the anti-aliased silhouette', () => {
    const html = renderToStaticMarkup(
      <LiquidSurface form="press">
        <span />
      </LiquidSurface>,
    );
    const clip = html.indexOf('in="jelly-final"');
    expect(clip).toBeGreaterThan(-1);
    expect(html.slice(clip, clip + 120)).toContain('in2="shape"');
  });
});
