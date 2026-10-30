import type { ReactNode } from 'react';
import { joinClasses } from '../shared/classes';

export type GlassCardVariant = 'normal' | 'big' | 'kept';

export interface GlassCardProps {
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
  variant?: GlassCardVariant;
}

/** A dark glass result card, including the wide kept-row treatment. */
export function GlassCard({
  actions,
  children,
  className,
  description,
  icon,
  title,
  variant = 'normal',
}: GlassCardProps): ReactNode {
  return (
    <article
      className={joinClasses('game-ui-glass-card', className)}
      data-tool-card="true"
      data-tool-card-variant={variant}
    >
      {variant === 'kept' ? <div className="game-ui-glass-card-kept-icon">{icon}</div> : null}
      {variant !== 'kept' && icon ? <div className="game-ui-glass-card-icon">{icon}</div> : null}
      <div className="game-ui-glass-card-copy">
        {title ? <h2>{title}</h2> : null}
        {description ? <p>{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="game-ui-glass-card-actions">{actions}</div> : null}
    </article>
  );
}
