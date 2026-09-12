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
      aria-invalid={props['aria-invalid'] ?? (invalid || undefined)}
      className={['game-ui-input', 'game-ui-select', className].filter(Boolean).join(' ')}
      data-invalid={invalid ? 'true' : undefined}
      ref={ref}
    />
  );
  if (!liquid) return select;
  return (
    <LiquidSurface
      className="game-ui-select-liquid"
      form="press"
      radius={16}
      {...(liquidFinish === undefined ? {} : { liquidFinish })}
    >
      {select}
    </LiquidSurface>
  );
});
