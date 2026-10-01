import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { type ClayIconName } from '../../icons/assets';
import { GameAssetIcon } from '../../icons/GameAssetIcon/GameAssetIcon';
import { GameBadge } from '../../feedback/GameBadge/GameBadge';

export interface GameStageTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  badge?: string;
  icon?: ClayIconName;
  kicker: string;
  selected?: boolean;
  summary: string;
  title: string;
  tone?: 'daily' | 'portal' | 'host' | 'danger';
}

export function GameStageTile({
  badge,
  className,
  icon,
  kicker,
  selected = false,
  summary,
  title,
  tone = 'daily',
  type = 'button',
  ...props
}: GameStageTileProps): ReactNode {
  const classes = ['game-ui-stage-tile', className].filter(Boolean).join(' ');
  return (
    <button
      aria-pressed={selected}
      className={classes}
      data-stage-tone={tone}
      type={type}
      {...props}
    >
      {icon ? <GameAssetIcon icon={icon} size="xl" /> : null}
      <span className="game-ui-stage-tile-copy">
        <small>{kicker}</small>
        <strong>{title}</strong>
        <span>{summary}</span>
      </span>
      {badge ? <GameBadge tone={selected ? 'success' : 'neutral'}>{badge}</GameBadge> : null}
    </button>
  );
}
