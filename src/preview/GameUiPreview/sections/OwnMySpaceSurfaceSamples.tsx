import { type ReactNode } from 'react';

import { GameAssetLibrary } from '../../../game/assets/GameAssetLibrary/GameAssetLibrary';

import { GameFactList } from '../../../game/GameFactList/GameFactList';

import { GameMovementPad } from '../../../game/GameMovementPad/GameMovementPad';

import { GamePlacementToolbar } from '../../../game/placement/GamePlacementToolbar/GamePlacementToolbar';

import { GameShell } from '../../../containers/GameShell/GameShell';

export function OwnMySpaceSurfaceSamples(): ReactNode {
  return (
    <GameShell
      title="OwnMySpace island editor preview"
      hud={
        <GameFactList
          label="Island facts"
          facts={[
            { id: 'objects', icon: 'gem', label: 'Objects', value: '3/12' },
            { id: 'status', icon: 'check', label: 'Status', tone: 'success', value: 'Ready' },
            { id: 'position', icon: 'compass', label: 'Position', value: '0, 0, 0' },
          ]}
        />
      }
      movementPad={<GameMovementPad helpText="WASD or arrows" label="Move avatar" />}
      assetLibrary={
        <GameAssetLibrary
          label="Placeable assets"
          title="Assets"
          subtitle="Starter, generated, and imported assets stay visibly distinct but share one placement path."
          selectedAssetId="manual-chair"
          groups={[
            {
              id: 'starter',
              label: 'Starter',
              source: 'starter',
              assets: [
                {
                  assetId: 'starter-table',
                  source: 'starter',
                  title: 'Starter table',
                  description: 'Built-in',
                  status: 'ready',
                  icon: 'home',
                },
              ],
            },
            {
              id: 'generated',
              label: 'Generated',
              source: 'generated',
              assets: [
                {
                  assetId: 'generated-lamp',
                  source: 'generated',
                  title: 'Generated lamp',
                  description: 'Provider output',
                  status: 'ready',
                  icon: 'gem',
                },
              ],
            },
            {
              id: 'imported',
              label: 'Imported',
              source: 'imported',
              assets: [
                {
                  assetId: 'manual-chair',
                  source: 'imported',
                  title: 'Manual chair',
                  description: 'Manual fixture',
                  status: 'selected',
                  icon: 'shop',
                },
              ],
            },
          ]}
        />
      }
      bottomBar={
        <GamePlacementToolbar
          title="Placement"
          selectedTitle="Manual chair"
          placedObjects={3}
          maxObjects={12}
          statusTone="success"
          statusValue="Ready"
          actions={[
            {
              id: 'place',
              label: 'Place object',
              icon: 'check',
              tone: 'primary',
              shortcut: 'Enter',
            },
            { id: 'save', label: 'Save island', icon: 'copy' },
          ]}
          objectActions={[
            { id: 'rotate', label: 'Rotate object', icon: 'compass', shortcut: 'R' },
            { id: 'remove', label: 'Remove object', icon: 'close', tone: 'danger' },
          ]}
        />
      }
    >
      <div className="game-ui-surface-pack-demo-scene">
        <span>3D scene slot</span>
      </div>
    </GameShell>
  );
}
