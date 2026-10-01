import type { ReactNode } from 'react';

import { GameBadge } from '../../../feedback/GameBadge/GameBadge';

import { GameEmptyState } from '../../../feedback/GameEmptyState/GameEmptyState';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';
import {
  type GameAssetCardProps,
  type GameAssetSource,
  ASSET_SOURCE_TONES,
  ASSET_SOURCE_LABELS,
  GameAssetCard,
} from '../GameAssetCard/GameAssetCard';
import {
  type GameAssetCardLayout,
  type GameSurfaceDensity,
} from '../../../containers/shared/surfaceTypes';

export interface GameAssetGroup {
  assets: readonly Omit<GameAssetCardProps, 'onSelect' | 'selected'>[];
  id: string;
  label: string;
  source?: GameAssetSource;
}

export interface GameAssetLibraryProps {
  cardLayout?: GameAssetCardLayout;
  className?: string;
  density?: GameSurfaceDensity;
  emptyAction?: ReactNode;
  emptyDescription?: string;
  emptyTitle?: string;
  groups: readonly GameAssetGroup[];
  label: string;
  onSelectAsset?: (assetId: string) => void;
  selectedAssetId?: string;
  subtitle?: string;
  title: string;
}

export function GameAssetLibrary({
  cardLayout = 'auto',
  className,
  density = 'comfortable',
  emptyAction,
  emptyDescription = 'Assets will appear here when they are ready to place.',
  emptyTitle = 'No assets ready',
  groups,
  label,
  onSelectAsset,
  selectedAssetId,
  subtitle,
  title,
}: GameAssetLibraryProps): ReactNode {
  const classes = ['game-ui-asset-library', className].filter(Boolean).join(' ');
  const totalAssets = groups.reduce((sum, group) => sum + group.assets.length, 0);
  const sourceCounts = groups.reduce<Record<GameAssetSource, number>>(
    (counts, group) => {
      group.assets.forEach((asset) => {
        counts[asset.source] += 1;
      });
      return counts;
    },
    { generated: 0, imported: 0, starter: 0 },
  );

  return (
    <GamePanel className={classes} data-card-layout={cardLayout} title={title} tone="strong">
      <section aria-label={label} data-density={density}>
        {subtitle ? <p className="game-ui-asset-library-subtitle">{subtitle}</p> : null}
        <div aria-label="Asset source counts" className="game-ui-asset-library-counts">
          {Object.entries(sourceCounts).map(([source, count]) => (
            <GameBadge key={source} tone={ASSET_SOURCE_TONES[source as GameAssetSource]}>
              {ASSET_SOURCE_LABELS[source as GameAssetSource]} {count}
            </GameBadge>
          ))}
        </div>
        {totalAssets === 0 ? (
          <GameEmptyState
            action={emptyAction}
            description={emptyDescription}
            icon="gem"
            title={emptyTitle}
          />
        ) : (
          <div className="game-ui-asset-library-groups">
            {groups.map((group) => (
              <section
                aria-label={group.label}
                className="game-ui-asset-library-group"
                data-asset-source={group.source}
                key={group.id}
              >
                <header>
                  <strong>{group.label}</strong>
                  {group.source ? (
                    <GameBadge tone={ASSET_SOURCE_TONES[group.source]}>
                      {ASSET_SOURCE_LABELS[group.source]}
                    </GameBadge>
                  ) : null}
                </header>
                <div className="game-ui-asset-library-grid">
                  {group.assets.map((asset) => {
                    const resolvedCardLayout =
                      cardLayout === 'auto' ? asset.cardLayout : cardLayout;

                    return (
                      <GameAssetCard
                        key={asset.assetId}
                        {...asset}
                        {...(resolvedCardLayout ? { cardLayout: resolvedCardLayout } : {})}
                        {...(onSelectAsset ? { onSelect: onSelectAsset } : {})}
                        selected={asset.assetId === selectedAssetId}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </GamePanel>
  );
}
