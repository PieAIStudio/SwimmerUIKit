import type { HTMLAttributes, ReactNode } from 'react';
import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { controlHue } from '../../tokens/hue';

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
  style,
  ...props
}: GameCalloutProps): ReactNode {
  const classes = ['game-ui-callout', `game-ui-callout--${tone}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      {...props}
      className={classes}
      role={props.role ?? 'note'}
      data-tone={tone}
      data-game-ui-paint=""
      data-game-ui-meaning={tone !== 'neutral' && tone !== 'danger' ? 'true' : undefined}
      data-game-ui-danger={tone === 'danger' ? 'true' : undefined}
      style={{
        ...controlHue(tone === 'success' ? 'leaf' : tone === 'warning' ? 'sun' : 'sky'),
        ...style,
      }}
    >
      <DropletSurface static />
      {heading ? <div className="game-ui-callout-title">{heading}</div> : null}
      <div className="game-ui-callout-body">{children}</div>
    </div>
  );
}
