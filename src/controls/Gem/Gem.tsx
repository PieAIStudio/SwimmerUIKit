import type { ReactNode } from 'react';

export interface GemProps {
  children?: ReactNode;
  className?: string;
  label?: string;
  size?: 'sm' | 'lg';
}

/** A small glossy world-colour icon holder. It is decorative unless labelled. */
export function Gem({ children, className, label, size = 'sm' }: GemProps): ReactNode {
  return (
    <span
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={['game-ui-gem', `game-ui-gem--${size}`, className].filter(Boolean).join(' ')}
      role={label ? 'img' : undefined}
    >
      {children}
    </span>
  );
}
