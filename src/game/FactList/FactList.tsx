import type { ReactNode } from 'react';

import { Icon } from '../../icons/Icon/Icon';

import { Badge, type BadgeTone } from '../../feedback/Badge/Badge';

import type { IconName } from '../../icons/registry';
import { type SurfaceDensity } from '../../containers/shared/surfaceTypes';

export interface FactItem {
  icon?: IconName;
  id: string;
  label: string;
  meta?: string;
  tone?: BadgeTone;
  value: ReactNode;
}

export interface FactListProps {
  className?: string;
  density?: SurfaceDensity;
  facts: readonly FactItem[];
  label: string;
  variant?: 'facts' | 'stats';
}

export function FactList({
  className,
  density = 'comfortable',
  facts,
  label,
  variant = 'facts',
}: FactListProps): ReactNode {
  const classes = ['game-ui-fact-list', className].filter(Boolean).join(' ');
  return (
    <section aria-label={label} className={classes} data-density={density} data-variant={variant}>
      {facts.map((fact) => (
        <article className="game-ui-fact" key={fact.id}>
          {fact.icon ? <Icon icon={fact.icon} size={density === 'dense' ? 'sm' : 'md'} /> : null}
          <span className="game-ui-fact-copy">
            <small>{fact.label}</small>
            <strong>{fact.value}</strong>
            {fact.meta ? <em>{fact.meta}</em> : null}
          </span>
          {fact.tone ? (
            <Badge tone={fact.tone}>{variant === 'stats' ? fact.label : fact.value}</Badge>
          ) : null}
        </article>
      ))}
    </section>
  );
}
