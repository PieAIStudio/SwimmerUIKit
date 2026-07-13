import type { ReactNode } from 'react';

import { GameAssetIcon } from './ClayComponents';
import type { ClayIconName } from './clay/assets';

/** Up to two uppercase initials from a display name, for the avatar fallback. */
function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.slice(0, 2).map((part) => part[0] ?? '');
  return letters.join('').toUpperCase();
}

export interface GameAvatarProps {
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
}: GameAvatarProps): ReactNode {
  const classes = ['game-ui-avatar', className].filter(Boolean).join(' ');
  return (
    <span className={classes} data-avatar-size={size} data-avatar-status={status}>
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

export interface GameProgressProps {
  /** Current value, between 0 and `max`. */
  value: number;
  max?: number;
  /** Accessible label for the progress bar. */
  label: string;
  tone?: 'accent' | 'success' | 'danger' | 'warning';
  /** Show the rounded percentage next to the bar. */
  showValue?: boolean;
  className?: string;
}

export function GameProgress({
  className,
  label,
  max = 100,
  showValue = false,
  tone = 'accent',
  value,
}: GameProgressProps): ReactNode {
  const safeMax = max <= 0 ? 100 : max;
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  const classes = ['game-ui-progress', className].filter(Boolean).join(' ');
  return (
    <div className={classes} data-progress-tone={tone}>
      <div
        aria-label={label}
        aria-valuemax={safeMax}
        aria-valuemin={0}
        aria-valuenow={value}
        className="game-ui-progress-track"
        role="progressbar"
      >
        <div className="game-ui-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      {showValue ? <span className="game-ui-progress-value">{Math.round(pct)}%</span> : null}
    </div>
  );
}

export interface GameEmptyStateProps {
  /** Optional clay icon shown above the title. */
  icon?: ClayIconName;
  title: string;
  description?: string;
  /** Optional call-to-action node (e.g. a GameButton). */
  action?: ReactNode;
  className?: string;
}

export function GameEmptyState({
  action,
  className,
  description,
  icon,
  title,
}: GameEmptyStateProps): ReactNode {
  const classes = ['game-ui-empty-state', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {icon ? <GameAssetIcon icon={icon} size="xl" /> : null}
      <strong className="game-ui-empty-state-title">{title}</strong>
      {description ? <p className="game-ui-empty-state-body">{description}</p> : null}
      {action ? <div className="game-ui-empty-state-action">{action}</div> : null}
    </div>
  );
}
