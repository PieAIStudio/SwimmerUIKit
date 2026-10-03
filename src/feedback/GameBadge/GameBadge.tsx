import { type ReactNode } from 'react';
import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { controlHue } from '../../tokens/hue';

export type GameBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'ai';

export interface GameBadgeProps {
  children: ReactNode;
  className?: string;
  tone?: GameBadgeTone;
}

export function GameBadge({ children, className, tone = 'neutral' }: GameBadgeProps): ReactNode {
  const classes = ['game-ui-badge', className].filter(Boolean).join(' ');
  return (
    <span
      className={classes}
      data-badge-tone={tone}
      data-game-ui-paint=""
      data-game-ui-meaning={tone !== 'neutral' && tone !== 'danger' ? 'true' : undefined}
      data-game-ui-danger={tone === 'danger' ? 'true' : undefined}
      style={controlHue(tone === 'success' ? 'leaf' : tone === 'warning' ? 'sun' : 'sky')}
    >
      <DropletSurface static maxWobble={1} />
      {children}
    </span>
  );
}
