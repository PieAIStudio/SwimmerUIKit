import type { ReactNode } from 'react';

/** Up to two uppercase initials from a display name, for the avatar fallback. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.slice(0, 2).map((part) => part[0] ?? '');
  return letters.join('').toUpperCase();
}

export interface GameAvatarProps {
  /** Optional copper frame; omitted keeps the existing avatar surface. */
  surface?: 'flat' | 'plaque';
  /** Display name — used as image alt text and for the initials fallback. */
  name: string;
  /** Optional image URL; when missing, initials are shown instead. */
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Presence dot; 'none' hides it. */
  status?: 'none' | 'online' | 'busy' | 'away';
  className?: string;
}

export function GameAvatar({
  className,
  name,
  size = 'md',
  src,
  status = 'none',
  surface = 'flat',
}: GameAvatarProps): ReactNode {
  const classes = ['game-ui-avatar', className].filter(Boolean).join(' ');
  return (
    <span
      className={classes}
      data-avatar-size={size}
      data-avatar-status={status}
      data-game-ui-surface={surface === 'plaque' ? 'plaque' : undefined}
    >
      {src ? (
        <img alt={name} src={src} />
      ) : (
        <>
          <span aria-hidden="true" className="game-ui-avatar-initials">
            {initialsFromName(name)}
          </span>
          <span className="game-ui-sr-only">{name}</span>
        </>
      )}
      {status !== 'none' ? <span aria-hidden="true" className="game-ui-avatar-status" /> : null}
    </span>
  );
}
