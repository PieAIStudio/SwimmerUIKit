import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameBadge, type GameBadgeTone } from '../../../feedback/GameBadge/GameBadge';

import type { ClayIconName } from '../../../icons/assets';
import { type GameAssetCardLayout } from '../../../containers/shared/surfaceTypes';

export type GameAssetSource = 'starter' | 'generated' | 'imported';

export type GameAssetStatus = 'ready' | 'generating' | 'missing' | 'placed' | 'selected' | 'error';

export interface GameAssetFact {
  id: string;
  label: string;
  value: string;
}

export interface GameAssetBadge {
  label: string;
  tone?: GameBadgeTone;
}

export interface GameAssetCardProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'onSelect'
> {
  assetId: string;
  badges?: readonly GameAssetBadge[];
  cardLayout?: Exclude<GameAssetCardLayout, 'auto'>;
  description?: string;
  facts?: readonly GameAssetFact[];
  icon?: ClayIconName;
  onSelect?: (assetId: string) => void;
  selected?: boolean;
  source: GameAssetSource;
  sourceLabel?: string;
  status?: GameAssetStatus;
  statusLabel?: string;
  thumbnailAlt?: string;
  thumbnailSrc?: string;
  title: string;
}

export const ASSET_SOURCE_LABELS: Readonly<Record<GameAssetSource, string>> = {
  generated: 'Generated',
  imported: 'Imported',
  starter: 'Starter',
};

export const ASSET_SOURCE_TONES: Readonly<Record<GameAssetSource, GameBadgeTone>> = {
  generated: 'ai',
  imported: 'warning',
  starter: 'neutral',
};

const ASSET_STATUS_TONES: Readonly<Record<GameAssetStatus, GameBadgeTone>> = {
  error: 'danger',
  generating: 'ai',
  missing: 'danger',
  placed: 'success',
  ready: 'neutral',
  selected: 'success',
};

export function GameAssetCard({
  assetId,
  badges = [],
  cardLayout = 'list',
  className,
  description,
  disabled,
  facts = [],
  icon = 'gem',
  onClick,
  onSelect,
  selected = false,
  source,
  sourceLabel,
  status = 'ready',
  statusLabel,
  thumbnailAlt = '',
  thumbnailSrc,
  title,
  type = 'button',
  ...props
}: GameAssetCardProps): ReactNode {
  const { 'aria-label': ariaLabel, ...buttonProps } = props;
  const classes = ['game-ui-asset-card', className].filter(Boolean).join(' ');
  const resolvedSourceLabel = sourceLabel ?? ASSET_SOURCE_LABELS[source];
  const resolvedStatusLabel = statusLabel ?? status;
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented) onSelect?.(assetId);
  };

  return (
    <button
      aria-label={ariaLabel ?? title}
      aria-pressed={selected}
      className={classes}
      data-asset-card-layout={cardLayout}
      data-asset-source={source}
      data-asset-status={status}
      disabled={disabled}
      onClick={handleClick}
      type={type}
      {...buttonProps}
    >
      <span className="game-ui-asset-card-preview">
        {thumbnailSrc ? (
          <img alt={thumbnailAlt} src={thumbnailSrc} />
        ) : (
          <GameAssetIcon className="game-ui-asset-card-icon" icon={icon} size="xl" />
        )}
      </span>
      <span className="game-ui-asset-card-copy">
        <span className="game-ui-asset-card-badges">
          <GameBadge tone={ASSET_SOURCE_TONES[source]}>{resolvedSourceLabel}</GameBadge>
          <GameBadge tone={ASSET_STATUS_TONES[status]}>{resolvedStatusLabel}</GameBadge>
          {badges.map((badge) => (
            <GameBadge key={badge.label} tone={badge.tone ?? 'neutral'}>
              {badge.label}
            </GameBadge>
          ))}
        </span>
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
        {facts.length > 0 ? (
          <span className="game-ui-asset-card-facts">
            {facts.map((fact) => (
              <span key={fact.id}>
                <small>{fact.label}</small>
                <b>{fact.value}</b>
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </button>
  );
}
