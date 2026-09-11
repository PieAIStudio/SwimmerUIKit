import { useMemo, type CSSProperties, type ReactNode } from 'react';

import { LiquidGroup } from './LiquidGroup';
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
  // A finger is pushing it in, and it spreads.
  press: { scale: 1.05, scaleY: 0.9, y: 2 },
  // It has just landed, so engaged is rest and the spring does the arriving.
  settle: { scale: 1, scaleY: 1, y: 0 },
  // The level is owned by the caller's own geometry, not by a press state.
  fill: { scale: 1, scaleY: 1, y: 0 },
  // Leaving: it slumps and spreads before it goes.
  drain: { scale: 1.08, scaleY: 0.84, y: 4 },
  // Present for exhaustiveness; these two are group-level forms.
  merge: { scale: 1, scaleY: 1, y: 0 },
  follow: { scale: 1, scaleY: 1, y: 0 },
};

/** Where a form starts from before it is engaged, when that differs from rest. */
const AT_REST: Readonly<Partial<Record<LiquidForm, Pose>>> = {
  // Stretched thin on the way down, the way a falling drop is.
  settle: { scale: 0.94, scaleY: 1.08, y: -8 },
};

export interface LiquidSurfaceProps {
  children: ReactNode;
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
  const group = useMemo(() => liquidFormGroup(form), [form]);
  const item = useMemo(() => liquidFormItem(form), [form]);
  const engaged = active && !reducedMotion;
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
      data-liquid-active={engaged ? 'true' : 'false'}
      style={style}
    >
      <LiquidGroup
        aria-hidden="true"
        blur={group.blur}
        className="game-ui-liquid-surface__body"
        contrast={group.contrast}
        gloss={group.gloss}
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
