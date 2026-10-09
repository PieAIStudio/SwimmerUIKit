import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';

import { LiquidGroup } from '../LiquidGroup/LiquidGroup';

import { type LiquidFill } from '../LiquidGroup/fill';
import { useSystemReducedMotion } from '../../tokens/reducedMotion';
import { LIQUID_FORMS, liquidFormGroup, liquidFormItem, type LiquidForm } from '../forms';
import { resolveTransition, type Transition } from '../spring';

/*
 * A liquid body behind ordinary content.
 *
 * This is the shape the only production use of the gooey engine converged on,
 * lifted here so the next surface does not have to rediscover it: a
 * non-interactive silhouette is drawn behind, and the real DOM — the button,
 * its label, its focus ring, its hit target — sits on top and never transforms.
 * That separation is the whole reason the pattern is safe. Scaling the control
 * itself would shrink the tap target and blur live text on every press, which
 * is exactly what a design system should not ship as its signature look.
 *
 * Forms that need more than one participating item (`merge`, `follow`) are not
 * expressible here and deliberately not faked: they describe a relationship
 * between siblings, so they belong to a `LiquidGroup` the caller arranges. This
 * component owns the single-body forms.
 */

interface Pose {
  scale: number;
  scaleY: number;
  y: number;
  /**
   * Horizontal travel. Only `reach` uses it, and that is the whole point of
   * `reach`: a stretch that stays centred is a body getting wider, and a body
   * getting wider is not reaching for anything.
   */
  x?: number;
}

/*
 * How each form looks when it is engaged, relative to its rest shape.
 *
 * The two axes disagree on purpose. A uniform scale is a thing getting
 * smaller; a body that spreads sideways as it is pushed down is a body made of
 * something, and that is the whole difference between a pressed button and a
 * pressed jelly. It is not fully volume-preserving — 0.87 vertical would want
 * about 1.15 horizontal, and 1.06 spreads less than that on purpose: more
 * sideways travel on a 32–44px control reads as a glitch rather than as squash.
 * The press holds for MIN_PRESS_HOLD_MS, so this pose is seen even on a tap.
 */
const ENGAGED: Readonly<Record<LiquidForm, Pose>> = {
  // Firming up: one small contraction as it commits, and then it is furniture.
  // The visible change is the group swap — no pour, hard rim, no volume.
  set: { scale: 0.99, scaleY: 0.99, y: 0 },
  // A finger is pushing it in, and it spreads. Deeper than before (0.90 to
  // 0.87, and y 2 to 3) so a 32–44px CTA reads as jelly, not as a nudge.
  press: { scale: 1.06, scaleY: 0.87, y: 3 },
  // Nothing is touching it, so nothing squashes it. It inflates.
  swell: { scale: 1.07, scaleY: 1.07, y: 0 },
  // It has just landed, so engaged is rest and the spring does the arriving.
  settle: { scale: 1, scaleY: 1, y: 0 },
  // The level is owned by the caller's own geometry, not by a press state.
  fill: { scale: 1, scaleY: 1, y: 0 },
  // Stretching after something: longer, thinner, and its centre goes with it.
  reach: { scale: 1.26, scaleY: 0.88, x: 12, y: 0 },
  // A shudder, not a deformation. Small, and the `wobbly` spring does the rest.
  ripple: { scale: 1.04, scaleY: 0.96, y: 0 },
  // Leaving: it slumps and spreads before it goes.
  drain: { scale: 1.08, scaleY: 0.84, y: 4 },
  /*
   * The group forms have no single-body pose, and this is not exhaustiveness
   * padding: `LiquidSurface` cannot express a relationship between siblings,
   * so a caller that lands here has picked the wrong tool and gets told rather
   * than getting a body that quietly never moves.
   */
  follow: { scale: 1, scaleY: 1, y: 0 },
  merge: { scale: 1, scaleY: 1, y: 0 },
  split: { scale: 1, scaleY: 1, y: 0 },
  bead: { scale: 1, scaleY: 1, y: 0 },
};

/** Where a form starts from before it is engaged, when that differs from rest. */
const AT_REST: Readonly<Partial<Record<LiquidForm, Pose>>> = {
  // Stretched thin on the way down, the way a falling drop is.
  settle: { scale: 0.94, scaleY: 1.08, y: -8 },
};

/*
 * Pending breath: rest, then a 4% swell, then rest again, about 1.2 s a cycle.
 * Each half cycle is one ordinary engine motion, so the loop claims the same
 * animation budget as a press and the engine stops it when that budget is spent.
 */
const BREATH_POSE: Pose = { scale: 1.04, scaleY: 1.04, y: 0 };
const BREATH_HALF_CYCLE_MS = 600;
const BREATH_TRANSITION: Transition = { duration: BREATH_HALF_CYCLE_MS, ease: 'ease-in-out' };

/**
 * The breath clock belongs to the component, so it stops with it. A release from
 * a press keeps the form's own spring for its rebound: `rebounding` lasts as long
 * as that spring takes, and only then does the breath curve resume.
 */
function useBreath(running: boolean, engaged: boolean, reboundMs: number) {
  const [swollen, setSwollen] = useState(false);
  const [wasEngaged, setWasEngaged] = useState(engaged);
  const [rebounding, setRebounding] = useState(false);
  if (wasEngaged !== engaged) {
    setWasEngaged(engaged);
    if (wasEngaged) setRebounding(true);
  }
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSwollen((value) => !value), BREATH_HALF_CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (!rebounding) return;
    const timer = window.setTimeout(() => setRebounding(false), reboundMs);
    return () => window.clearTimeout(timer);
  }, [rebounding, reboundMs]);
  return { swollen: running && swollen, rebounding };
}

/**
 * Say so, once, when a group form is handed to the single-body component.
 *
 * It renders a correct-looking body that simply never moves, which is the
 * worst failure mode a design system has: nothing is broken, so nobody looks.
 *
 * Not gated on a build-mode flag, for the reason written at length in
 * `scripts/check-warnings-survive-build.mjs`: a library cannot see the
 * consuming app's build, so `import.meta.env.DEV` — and `process.env.NODE_ENV`
 * with it — resolves against *this* package and bakes the warning out of the
 * published artifact. That has already happened here three times. Once per
 * form, because a shelf rendering all twelve would otherwise print a wall.
 */
const warnedForms = new Set<LiquidForm>();

function warnGroupForm(form: LiquidForm): void {
  if (warnedForms.has(form)) return;
  warnedForms.add(form);
  console.warn(
    `LiquidSurface cannot express the '${form}' form: it describes a relationship ` +
      'between sibling items, not one body. Arrange the items in a <LiquidGroup> ' +
      'with explicit group props instead; LiquidSurface will render a body that never moves.',
  );
}

export interface LiquidSurfaceProps {
  children: ReactNode;
  /** Which motion. All forms share one thin liquid material. */
  form?: LiquidForm;
  /**
   * Whether the form is engaged: pressed for `press`, landed for `settle`,
   * leaving for `drain`. Ignored by forms with no engaged state.
   */
  active?: boolean;
  /**
   * Breathe slowly while work is pending: rest, a 4% swell, rest, about 1.2 s a
   * cycle. Yields to `active` and holds rest under reduced motion.
   */
  breathing?: boolean;
  /** Silhouette paint. Defaults to the kit's raised surface token. */
  fill?: LiquidFill;
  /**
   * Advanced primitive override. Defaults to the shared thin material;
   * ordinary controls do not expose a second material selector.
   */
  gloss?: number;
  /**
   * The rest outline's lobing, overriding the form's own: `amplitude` in px
   * swells outward, `lobes` is how many go round (2 lazy, 5 busy).
   */
  outline?: { readonly amplitude: number; readonly lobes?: number };
  stroke?: string;
  /** Overrides the form's own cast shadow. `none` removes it. */
  shadow?: string;
  /** Corner radius of the body, in px. 999 gives a pill. */
  radius?: number;
  className?: string;
  style?: CSSProperties;
}

export function LiquidSurface({
  children,
  form = 'press',
  active = false,
  breathing = false,
  fill = 'var(--game-ui-liquid-surface-fill, var(--game-ui-surface-raised))',
  stroke,
  shadow: shadowOverride,
  gloss: glossOverride,
  outline,
  radius = 999,
  className,
  style,
}: LiquidSurfaceProps): ReactNode {
  const reducedMotion = useSystemReducedMotion();
  const engaged = active && !reducedMotion;
  /*
   * `set` is the one form that changes its group knobs mid-gesture, because it
   * is the one form whose subject is stopping being liquid. The swap snaps —
   * `blob` is path data and `gloss` is a filter pass, neither tweens — and for
   * this form that snap is the gesture.
   */
  const group = useMemo(
    () => liquidFormGroup(form, engaged ? LIQUID_FORMS[form].groupEngaged : undefined),
    [form, engaged],
  );
  const item = useMemo(() => liquidFormItem(form), [form]);
  if (LIQUID_FORMS[form].kind === 'group') warnGroupForm(form);
  const running = breathing && !engaged && !reducedMotion;
  const breath = useBreath(running, engaged, resolveTransition(item.transition).duration);
  const target = engaged
    ? ENGAGED[form]
    : breath.swollen
      ? BREATH_POSE
      : (AT_REST[form] ?? { scale: 1, scaleY: 1, y: 0 });
  // A breath step eases gently; a release from a press keeps the form's spring.
  const transition = running && !breath.rebounding ? BREATH_TRANSITION : item.transition;
  const shadow = shadowOverride ?? group.shadow;
  const blob = outline
    ? { amplitude: outline.amplitude, lobes: outline.lobes ?? group.lobes }
    : { amplitude: group.blob, lobes: group.lobes };

  return (
    <span
      className={['game-ui-liquid-surface', className].filter(Boolean).join(' ')}
      data-liquid-form={form}
      data-liquid-active={engaged ? 'true' : 'false'}
      data-liquid-breathing={running ? 'true' : undefined}
      style={style}
    >
      <LiquidGroup
        aria-hidden="true"
        blur={group.blur}
        className="game-ui-liquid-surface__body"
        contrast={group.contrast}
        gloss={glossOverride ?? group.gloss}
        fill={fill}
        filterPadding={Math.max(group.filterPadding, Math.ceil(blob.amplitude) + 8)}
        motion={reducedMotion ? 'reduced' : 'auto'}
        {...(shadow === undefined ? {} : { shadow })}
        {...(stroke === undefined ? {} : { stroke })}
      >
        <LiquidGroup.Item
          {...(blob.amplitude > 0 ? { blob } : {})}
          className="game-ui-liquid-surface__shape"
          {...(item.effect === undefined ? {} : { effect: item.effect })}
          {...(item.morph === undefined ? {} : { morph: item.morph })}
          radius={radius}
          scale={target.scale}
          scaleY={target.scaleY}
          {...(transition === undefined ? {} : { transition })}
          {...(target.x === undefined ? {} : { x: target.x })}
          y={target.y}
        >
          <span className="game-ui-liquid-surface__fill" />
        </LiquidGroup.Item>
      </LiquidGroup>
      <span className="game-ui-liquid-surface__content">{children}</span>
    </span>
  );
}

/** The one-line description of each form, for pickers and documentation. */
export function liquidFormSummary(form: LiquidForm): string {
  return LIQUID_FORMS[form].summary;
}
