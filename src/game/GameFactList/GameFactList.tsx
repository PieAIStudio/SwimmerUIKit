import type { ReactNode } from 'react';

import { GameIcon } from '../../icons/GameIcon/GameIcon';

import { GameBadge, type GameBadgeTone } from '../../feedback/GameBadge/GameBadge';

import type { GameIconName } from '../../icons/registry';
import { type GameSurfaceDensity } from '../../containers/shared/surfaceTypes';

export interface GameFactItem {
  icon?: GameIconName;
  id: string;
  label: string;
  meta?: string;
  tone?: GameBadgeTone;
  value: ReactNode;
}

export interface GameFactListProps {
  className?: string;
  density?: GameSurfaceDensity;
  facts: readonly GameFactItem[];
  label: string;
  variant?: 'facts' | 'stats';
}

export function GameFactList({
  className,
  density = 'comfortable',
  facts,
  label,
  variant = 'facts',
}: GameFactListProps): ReactNode {
  const classes = ['game-ui-fact-list', className].filter(Boolean).join(' ');
  return (
    <section aria-label={label} className={classes} data-density={density} data-variant={variant}>
      {facts.map((fact) => (
        <article className="game-ui-fact" key={fact.id}>
          {fact.icon ? (
            <GameIcon icon={fact.icon} size={density === 'dense' ? 'sm' : 'md'} />
          ) : null}
          <span className="game-ui-fact-copy">
            <small>{fact.label}</small>
            <strong>{fact.value}</strong>
            {fact.meta ? <em>{fact.meta}</em> : null}
          </span>
          {fact.tone ? (
            <GameBadge tone={fact.tone}>{variant === 'stats' ? fact.label : fact.value}</GameBadge>
          ) : null}
        </article>
      ))}
    </section>
  );
}
