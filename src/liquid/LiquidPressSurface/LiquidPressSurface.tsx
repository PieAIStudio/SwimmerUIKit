import { useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';
import { LiquidSurface } from '../LiquidSurface/LiquidSurface';
import { observePress } from './observePress';
import { TIDE_FILL } from '../material/weight';

/** Stable structural slot: decoration may change, the native button may not.
 * The ordinary frame uses display:contents, so native layout classes still
 * participate in the host layout. Only a CTA needs a positioned liquid frame. */
export function LiquidPressSurface({
  children,
  control,
  controlIdentity,
  enabled,
  static: isStatic = false,
  fullWidth = false,
}: {
  children: ReactNode;
  control: RefObject<HTMLElement | null>;
  controlIdentity?: unknown;
  enabled: boolean;
  static?: boolean;
  fullWidth?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  useLayoutEffect(() => {
    setPressed(false);
    if (!enabled || isStatic || !control.current) return;
    let mounted = true;
    const dispose = observePress(control.current, (value) => {
      if (mounted) setPressed(value);
    });
    return () => {
      mounted = false;
      dispose();
    };
  }, [control, controlIdentity, enabled, isStatic]);
  return (
    <span
      className="game-ui-button-frame"
      data-liquid={enabled ? 'true' : undefined}
      data-full-width={fullWidth ? 'true' : undefined}
    >
      {enabled ? (
        <LiquidSurface
          key="decoration"
          active={pressed && !isStatic}
          form="press"
          fill={TIDE_FILL}
          className="game-ui-cta-decoration"
        >
          {null}
        </LiquidSurface>
      ) : null}
      {children}
    </span>
  );
}
