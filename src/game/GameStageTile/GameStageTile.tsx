import { DropletSurface, SelectionMark } from '../../controls/DropletSurface/DropletSurface';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { type GameIconName } from '../../icons/registry';
import { GameIcon } from '../../icons/GameIcon/GameIcon';
import { GameBadge } from '../../feedback/GameBadge/GameBadge';

export interface GameStageTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  badge?: string;
  icon?: GameIconName;
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
      data-game-ui-paint=""
    >
      <DropletSurface />
      {icon ? <GameIcon icon={icon} size="lg" /> : null}
      <span className="game-ui-stage-tile-copy">
        <small>{kicker}</small>
        <strong>{title}</strong>
        <span>{summary}</span>
      </span>
      {badge ? <GameBadge tone={selected ? 'success' : 'neutral'}>{badge}</GameBadge> : null}
      <SelectionMark />
    </button>
  );
}
