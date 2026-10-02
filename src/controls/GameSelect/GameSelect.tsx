import { forwardRef, type SelectHTMLAttributes } from 'react';
import { controlHue, type GameUiHue } from '../../tokens/hue';

export interface GameSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  hue?: GameUiHue;
}
/** Native options, form reset, focus, mobile popup and multiple-selection stay
 * browser-owned. A field changes only its flat edge/fill, never its geometry. */
export const GameSelect = forwardRef<HTMLSelectElement, GameSelectProps>(function GameSelect(
  { className, invalid, hue, style, ...props },
  ref,
) {
  return (
    <span className="game-ui-select-frame">
      <select
        {...props}
        ref={ref}
        key="control"
        aria-invalid={props['aria-invalid'] ?? (invalid || undefined)}
        data-invalid={invalid ? 'true' : undefined}
        data-game-ui-paint=""
        style={{ ...controlHue(hue), ...style }}
        className={['game-ui-input', 'game-ui-select', className].filter(Boolean).join(' ')}
      />
    </span>
  );
});
