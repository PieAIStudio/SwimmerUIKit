import { DropletSurface, SelectionMark } from '../../controls/DropletSurface/DropletSurface';
import { type ButtonHTMLAttributes, type ReactNode } from 'react';

import { type IconName } from '../../icons/registry';
import { Icon } from '../../icons/Icon/Icon';
import { Badge } from '../../feedback/Badge/Badge';

export interface StageTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  badge?: string;
  icon?: IconName;
  kicker: string;
  selected?: boolean;
  summary: string;
  title: string;
  tone?: 'daily' | 'portal' | 'host' | 'danger';
}

export function StageTile({
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
}: StageTileProps): ReactNode {
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
      {icon ? <Icon icon={icon} size="lg" /> : null}
      <span className="game-ui-stage-tile-copy">
        <small>{kicker}</small>
        <strong>{title}</strong>
        <span>{summary}</span>
      </span>
      {badge ? <Badge tone={selected ? 'success' : 'neutral'}>{badge}</Badge> : null}
      <SelectionMark />
    </button>
  );
}
