import { type CSSProperties, type ReactNode } from 'react';

import { GameBadge } from '../../../feedback/GameBadge/GameBadge';

import { GameAssetLibrary } from '../../../game/assets/GameAssetLibrary/GameAssetLibrary';

const ASSET_REPRO_GROUPS = [
  {
    id: 'starter',
    label: 'Starter pieces',
    source: 'starter' as const,
    assets: [
      {
        assetId: 'asset-repro-platform',
        source: 'starter' as const,
        title: 'Starter platform',
        status: 'ready' as const,
        icon: 'portal' as const,
        'data-testid': 'asset-repro-platform',
      },
      {
        assetId: 'asset-repro-chair',
        source: 'starter' as const,
        title: 'Starter chair',
        status: 'selected' as const,
        icon: 'shop' as const,
        'data-testid': 'asset-repro-chair',
      },
      {
        assetId: 'asset-repro-table',
        source: 'starter' as const,
        title: 'Starter table',
        status: 'ready' as const,
        icon: 'card' as const,
        'data-testid': 'asset-repro-table',
      },
    ],
  },
];

export function AssetCompressionRepro(): ReactNode {
  return (
    <div className="game-ui-asset-compression-repro" aria-label="Asset card compression repro">
      {[
        { id: 'comfortable', label: 'Comfortable library', width: '320px' },
        { id: 'narrow', label: 'Narrow library', width: '156px' },
        { id: 'rail', label: 'Rail library', width: '64px' },
      ].map((surface) => (
        <article
          className="game-ui-asset-compression-repro-surface"
          data-repro-surface={surface.id}
          key={surface.id}
          style={{ '--repro-width': surface.width } as CSSProperties}
        >
          <GameBadge>{surface.label}</GameBadge>
          <GameAssetLibrary
            density="dense"
            groups={ASSET_REPRO_GROUPS}
            label={`${surface.label} assets`}
            selectedAssetId="asset-repro-chair"
            title="Build"
          />
        </article>
      ))}
    </div>
  );
}
