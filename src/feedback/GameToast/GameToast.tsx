import { type ReactNode } from 'react';
import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { controlHue } from '../../tokens/hue';

export interface GameToastProps {
  children: ReactNode;
  tone?: 'info' | 'success' | 'danger';
}

export function GameToast({ children, tone = 'info' }: GameToastProps): ReactNode {
  return (
    <div
      className="game-ui-toast"
      data-toast-tone={tone}
      data-game-ui-paint=""
      data-game-ui-meaning={tone === 'success' ? 'true' : undefined}
      data-game-ui-danger={tone === 'danger' ? 'true' : undefined}
      style={controlHue(tone === 'success' ? 'leaf' : 'sky')}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <DropletSurface static />
      {children}
    </div>
  );
}
