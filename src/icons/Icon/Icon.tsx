import type { SVGProps } from 'react';
import { GAME_ICONS, type IconName } from '../registry';
import type { IconData } from '../types';

export interface IconProps extends Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'width' | 'height' | 'aria-label' | 'role'
> {
  icon: IconName | IconData;
  size?: 'sm' | 'md' | 'lg';
  /** A meaningful image needs a label; decorative icons remain hidden from AT. */
  label?: string;
}

export function Icon({ icon, size = 'md', label, className, ...props }: IconProps) {
  const data = typeof icon === 'string' ? GAME_ICONS[icon] : icon;
  const pixels = { sm: 16, md: 20, lg: 24 }[size];
  return (
    <svg
      {...props}
      className={['game-ui-icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 24 24"
      width={pixels}
      height={pixels}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      data-icon={data.name}
      data-icon-size={size}
    >
      {data.paths.map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  );
}
