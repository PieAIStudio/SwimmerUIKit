import type { HTMLAttributes, ReactNode } from 'react';

export type GameCalloutTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

export interface GameCalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Visible heading (not HTML title attribute). */
  readonly heading?: ReactNode;
  readonly children: ReactNode;
  readonly tone?: GameCalloutTone;
}

/**
 * Compact product notice (wallet pitch, soft warnings, onboarding hints).
 * Token-driven; products may still override cinema theme in host CSS.
 */
export function GameCallout({
  heading,
  children,
  tone = 'info',
  className,
  ...props
}: GameCalloutProps): ReactNode {
  const classes = ['game-ui-callout', `game-ui-callout--${tone}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} role="note" data-tone={tone} {...props}>
      {heading ? <div className="game-ui-callout-title">{heading}</div> : null}
      <div className="game-ui-callout-body">{children}</div>
    </div>
  );
}
