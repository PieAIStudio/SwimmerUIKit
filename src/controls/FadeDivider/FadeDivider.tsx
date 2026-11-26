import type { CSSProperties, ReactNode } from 'react';
type V12Theme = 'lagoon' | 'lagoon-light' | 'blossom' | 'graphite' | 'paper';

export interface FadeDividerProps {
  orientation?: 'horizontal' | 'vertical';
  theme?: V12Theme;
  className?: string;
  style?: CSSProperties;
}

export function FadeDivider({
  className,
  orientation = 'horizontal',
  style,
  theme = 'lagoon',
}: FadeDividerProps): ReactNode {
  return (
    <span
      aria-orientation={orientation}
      className={['game-ui-v12-fade-divider', 'game-ui-v12-fade-divider--' + orientation, className]
        .filter(Boolean)
        .join(' ')}
      data-v12-theme={theme}
      role="separator"
      style={style}
    />
  );
}
