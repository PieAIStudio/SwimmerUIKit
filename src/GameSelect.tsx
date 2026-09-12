import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import type { GameButtonSurface } from './GameButton';
import type { LiquidFinish } from './liquidGooeyFinish';
import { LiquidSurface } from './LiquidSurface';

export interface GameSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  surface?: GameButtonSurface;
  liquidFinish?: LiquidFinish;
}

/**
 * Native select, not a custom listbox state machine. Options/optgroups, form
 * submission, reset, keyboard and the mobile picker remain browser-owned.
 * Liquid paints only the closed single-select field. Disabled/multiple/list
 * modes use the ordinary surface; we do not pretend to animate an OS popup.
 */
export const GameSelect = forwardRef<HTMLSelectElement, GameSelectProps>(function GameSelect(
  { className, invalid, surface = 'flat', liquidFinish, ...props },
  ref,
): ReactNode {
  const liquid =
    surface === 'liquid' && !props.disabled && !props.multiple && (props.size ?? 1) <= 1;
  const select = (
    <select
      {...props}
      key="control"
      aria-invalid={props['aria-invalid'] ?? (invalid || undefined)}
      className={['game-ui-input', 'game-ui-select', className].filter(Boolean).join(' ')}
      data-invalid={invalid ? 'true' : undefined}
      ref={ref}
    />
  );
  // Keep the native element at one React position. Replacing a select with a
  // LiquidSurface wrapper on disabled/material/size changes remounts it and
  // silently resets uncontrolled values, validity, focus and the forwarded ref.
  // Only the decoration may come and go; the browser continues owning the field.
  return (
    <span
      className={['game-ui-select-frame', liquid && 'game-ui-select-liquid']
        .filter(Boolean)
        .join(' ')}
    >
      {liquid ? (
        <LiquidSurface
          key="decoration"
          className="game-ui-select-decoration"
          form="press"
          radius={16}
          {...(liquidFinish === undefined ? {} : { liquidFinish })}
        >
          {null}
        </LiquidSurface>
      ) : null}
      {select}
    </span>
  );
});
