import { type ReactNode } from 'react';

export interface GameToastProps {
  children: ReactNode;
  tone?: 'info' | 'success' | 'danger';
}

export function GameToast({ children, tone = 'info' }: GameToastProps): ReactNode {
  return (
    <div
      className="game-ui-toast"
      data-toast-tone={tone}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
}
