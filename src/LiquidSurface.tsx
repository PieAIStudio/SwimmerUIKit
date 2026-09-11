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

/** How each form looks when it is engaged, relative to its rest shape. */
const ENGAGED: Readonly<Record<LiquidForm, { scale: number; y: number }>> = {
  // A finger is pushing it in.
  press: { scale: 0.95, y: 1.5 },
  // It has just landed, so engaged is rest and the spring does the arriving.
  settle: { scale: 1, y: 0 },
  // The level is owned by the caller's own geometry, not by a press state.
  fill: { scale: 1, y: 0 },
  // Leaving: give the body a little collapse to go with the dissolve.
  drain: { scale: 0.92, y: 0 },
  // Present for exhaustiveness; these two are group-level forms.
  merge: { scale: 1, y: 0 },
  follow: { scale: 1, y: 0 },
};

/** Where a form starts from before it is engaged, when that differs from rest. */
const AT_REST: Readonly<Partial<Record<LiquidForm, { scale: number; y: number }>>> = {
  settle: { scale: 0.97, y: -6 },
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
  shadow,
  radius = 999,
  className,
  style,
}: LiquidSurfaceProps): ReactNode {
  const reducedMotion = useSystemReducedMotion();
  const group = useMemo(() => liquidFormGroup(form), [form]);
  const item = useMemo(() => liquidFormItem(form), [form]);
  const engaged = active && !reducedMotion;
  const target = engaged ? ENGAGED[form] : (AT_REST[form] ?? { scale: 1, y: 0 });

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
