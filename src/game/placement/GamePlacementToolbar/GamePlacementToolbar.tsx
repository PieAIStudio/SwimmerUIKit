import type { ReactNode } from 'react';

import { type GameBadgeTone } from '../../../feedback/GameBadge/GameBadge';

import { GameProgress } from '../../../feedback/GameProgress/GameProgress';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';
import { type GameUiAction, GameActionGrid } from '../../../controls/GameActionGrid/GameActionGrid';
import { type GameSurfaceDensity } from '../../../containers/shared/surfaceTypes';
import { type GameFactItem, GameFactList } from '../../GameFactList/GameFactList';

export interface GamePlacementToolbarProps {
  actions?: readonly GameUiAction[];
  capacityLabel?: string;
  className?: string;
  density?: GameSurfaceDensity;
  maxObjects?: number;
  objectActions?: readonly GameUiAction[];
  placedObjects?: number;
  selectedLabel?: string;
  selectedTitle?: string;
  statusLabel?: string;
  statusTone?: GameBadgeTone;
  statusValue?: string;
  title: string;
}

export function GamePlacementToolbar({
  actions = [],
  capacityLabel = 'Objects',
  className,
  density = 'comfortable',
  maxObjects,
  objectActions = [],
  placedObjects,
  selectedLabel = 'Selected',
  selectedTitle,
  statusLabel = 'Status',
  statusTone = 'neutral',
  statusValue = 'Idle',
  title,
}: GamePlacementToolbarProps): ReactNode {
  const classes = ['game-ui-placement-toolbar', className].filter(Boolean).join(' ');
  const hasCapacity = typeof placedObjects === 'number' && typeof maxObjects === 'number';
  const progressValue = hasCapacity && maxObjects > 0 ? Math.min(maxObjects, placedObjects) : 0;
  const factItems: GameFactItem[] = [
    { icon: 'gem', id: 'selected', label: selectedLabel, value: selectedTitle ?? 'None' },
    { icon: 'check', id: 'status', label: statusLabel, tone: statusTone, value: statusValue },
  ];

  return (
    <GamePanel className={classes} title={title} tone="strong">
      <div data-density={density}>
        <GameFactList density={density} facts={factItems} label={`${title} facts`} />
        {hasCapacity ? (
          <GameProgress
            label={capacityLabel}
            max={maxObjects}
            showValue
            tone={progressValue >= maxObjects ? 'warning' : 'success'}
            value={progressValue}
          />
        ) : null}
        {actions.length > 0 ? (
          <GameActionGrid actions={actions} density={density} label={`${title} actions`} />
        ) : null}
        {objectActions.length > 0 ? (
          <GameActionGrid
            actions={objectActions}
            density={density}
            label={`${title} object actions`}
            style="icon"
          />
        ) : null}
      </div>
    </GamePanel>
  );
}

export const GameObjectToolbar = GamePlacementToolbar;

export type GameObjectToolbarProps = GamePlacementToolbarProps;
