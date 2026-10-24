import { forwardRef, type SelectHTMLAttributes } from 'react';
import { controlHue, type UiHue } from '../../tokens/hue';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  hue?: UiHue;
}
/** Native options, form reset, focus, mobile popup and multiple-selection stay
 * browser-owned. A field changes only its flat edge/fill, never its geometry. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
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
