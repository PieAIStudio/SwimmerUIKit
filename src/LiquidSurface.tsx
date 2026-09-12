import { useMemo, type CSSProperties, type ReactNode } from 'react';

import { LiquidGroup } from './LiquidGroup';
import { liquidFinishGloss, type LiquidFinish } from './liquidGooeyFinish';
import { useSystemReducedMotion } from './reducedMotion';
import { LIQUID_FORMS, liquidFormGroup, liquidFormItem, type LiquidForm } from './liquidGooeyForms';

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
 * pressed jelly. It is not fully volume-preserving — 0.90 vertical would want
 * 1.11 horizontal and that much sideways travel on a 44px control reads as a
 * glitch rather than as squash.
 */
const ENGAGED: Readonly<Record<LiquidForm, Pose>> = {
  // Firming up: one small contraction as it commits, and then it is furniture.
  // The visible change is the group swap — no pour, hard rim, no volume.
  set: { scale: 0.99, scaleY: 0.99, y: 0 },
  // A finger is pushing it in, and it spreads.
  press: { scale: 1.05, scaleY: 0.9, y: 2 },
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
      'with liquidFormGroup() instead; LiquidSurface will render a body that never moves.',
  );
}

export interface LiquidSurfaceProps {
  children: ReactNode;
  /** Omitted keeps the form's existing lighting; matte and glossy share the same motion. */
  liquidFinish?: LiquidFinish;
  /** Which named look. Defaults to the press form, the one a control wants. */
  form?: LiquidForm;
  /**
   * Whether the form is engaged: pressed for `press`, landed for `settle`,
   * leaving for `drain`. Ignored by forms with no engaged state.
   */
  active?: boolean;
  /** Silhouette paint. Defaults to the kit's raised surface token. */
  fill?: string;
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
  liquidFinish,
  form = 'press',
  active = false,
  fill = 'var(--game-ui-liquid-surface-fill, var(--game-ui-surface-raised))',
  stroke,
  shadow: shadowOverride,
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
  const target = engaged ? ENGAGED[form] : (AT_REST[form] ?? { scale: 1, scaleY: 1, y: 0 });
  /*
   * The ground under the body.
   *
   * The form is the default and an explicit `shadow` wins, including
   * `shadow="none"` for a caller that genuinely wants a floating body. The
   * engaged variant is what makes it a cast shadow rather than a decoration:
   * these forms move vertically, and a shadow that does not answer that move
   * is a sticker of a shadow. It transitions with the body because it is a
   * CSS `filter` on the silhouette and that is an animatable property.
   */
  const formShadow = engaged ? (group.shadowEngaged ?? group.shadow) : group.shadow;
  const shadow = shadowOverride ?? formShadow;

  return (
    <span
      className={['game-ui-liquid-surface', className].filter(Boolean).join(' ')}
      data-liquid-form={form}
      data-liquid-finish={liquidFinish}
      data-liquid-active={engaged ? 'true' : 'false'}
      style={style}
    >
      <LiquidGroup
        aria-hidden="true"
        blur={group.blur}
        className="game-ui-liquid-surface__body"
        contrast={group.contrast}
        gloss={liquidFinishGloss(liquidFinish, group.gloss)}
        fill={fill}
        filterPadding={Math.max(group.filterPadding, Math.ceil(group.blob) + 8)}
        motion={reducedMotion ? 'reduced' : 'auto'}
        {...(shadow === undefined ? {} : { shadow })}
        {...(stroke === undefined ? {} : { stroke })}
      >
        <LiquidGroup.Item
          {...(group.blob > 0 ? { blob: { amplitude: group.blob, lobes: group.lobes } } : {})}
          className="game-ui-liquid-surface__shape"
          {...(item.effect === undefined ? {} : { effect: item.effect })}
          {...(item.morph === undefined ? {} : { morph: item.morph })}
          {...(item.dissolve === undefined ? {} : { dissolve: item.dissolve && engaged })}
          radius={radius}
          scale={target.scale}
          scaleY={target.scaleY}
          {...(item.transition === undefined ? {} : { transition: item.transition })}
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
