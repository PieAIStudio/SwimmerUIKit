import { forwardRef, type ReactNode } from 'react';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';
import { controlHue, type UiHue } from '../../tokens/hue';
import { NativeAction, type ActionElement, type ActionProps } from '../NativeAction/NativeAction';

export type IconButtonProps = ActionProps & {
  children: ReactNode;
  label: string;
  hue?: UiHue;
  size?: 'md' | 'sm';
};
export const IconButton = forwardRef<ActionElement, IconButtonProps>(function IconButton(
  { children, className, label, hue, size = 'md', style, ...props },
  ref,
) {
  return (
    <NativeAction
      {...props}
      ref={ref}
      aria-label={label}
      className={['game-ui-icon-button', className].filter(Boolean).join(' ')}
      data-game-ui-paint=""
      data-game-ui-size={size}
      style={{ ...controlHue(hue), ...style }}
    >
      <DropletSurface />
      {children}
      {props['aria-pressed'] !== undefined ? <SelectionMark /> : null}
    </NativeAction>
  );
});
