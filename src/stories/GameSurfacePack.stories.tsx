import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  GameActionGrid,
  GameAssetLibrary,
  GameFactList,
  GameMovementPad,
  GamePlacementToolbar,
  GameShell,
} from '../index';

const meta = {
  title: 'Clay/Game Surface Pack/OwnMySpace',
  component: GameShell,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'OwnMySpace 官方游戏界面包。用于 canvas/3D runtime 周围的 HUD、移动、资产库、放置工具栏与动作网格；组件只接收 props 和 callbacks，不导入宿主 App runtime。',
      },
    },
  },
} satisfies Meta<typeof GameShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const starterAssets = [
  { assetId: 'starter-table', source: 'starter' as const, title: 'Starter table', description: 'Built-in placement asset', status: 'ready' as const, icon: 'home' as const },
  { assetId: 'starter-tree', source: 'starter' as const, title: 'Starter tree', description: 'Ready to place', status: 'ready' as const, icon: 'lucky' as const },
];

const generatedAssets = [
  { assetId: 'generated-lamp', source: 'generated' as const, title: 'Generated lamp', description: 'Local dry-run provider output', status: 'ready' as const, icon: 'gem' as const },
];

const importedAssets = [
  { assetId: 'manual-chair', source: 'imported' as const, title: 'Manual crystal chair', description: 'Manual fixture import', status: 'selected' as const, icon: 'shop' as const },
];

export const GameSurface: Story = {
  args: {
    title: 'Island editor',
    hud: (
      <GameFactList
        label="Island facts"
        facts={[
          { id: 'objects', label: 'Objects', value: '3/12', icon: 'gem' },
          { id: 'status', label: 'Status', value: 'Ready', icon: 'check', tone: 'success' },
          { id: 'position', label: 'Position', value: '0, 0, 0', icon: 'compass' },
        ]}
      />
    ),
    movementPad: <GameMovementPad helpText="WASD or arrow keys" label="Move avatar" />,
    assetLibrary: (
      <GameAssetLibrary
        label="Placeable assets"
        title="Assets"
        subtitle="Starter, generated, and imported assets share the same placement path."
        selectedAssetId="manual-chair"
        groups={[
          { id: 'starter', label: 'Starter', source: 'starter', assets: starterAssets },
          { id: 'generated', label: 'Generated', source: 'generated', assets: generatedAssets },
          { id: 'imported', label: 'Imported', source: 'imported', assets: importedAssets },
        ]}
      />
    ),
    bottomBar: (
      <GamePlacementToolbar
        title="Placement"
        selectedTitle="Manual crystal chair"
        placedObjects={3}
        maxObjects={12}
        statusValue="Ready"
        statusTone="success"
        actions={[
          { id: 'place', label: 'Place object', icon: 'check', tone: 'primary', shortcut: 'Enter' },
          { id: 'save', label: 'Save island', icon: 'copy', tone: 'secondary' },
        ]}
        objectActions={[
          { id: 'rotate', label: 'Rotate object', icon: 'compass', shortcut: 'R' },
          { id: 'delete', label: 'Delete object', icon: 'close', tone: 'danger' },
        ]}
      />
    ),
    children: <div className="game-ui-surface-pack-demo-scene"><span>3D scene slot</span></div>,
  },
};

export const DenseMobile: Story = {
  args: {
    ...GameSurface.args,
    density: 'dense',
    layout: 'mobile',
    title: 'Island editor mobile',
    movementPad: <GameMovementPad density="dense" helpText="WASD" label="Move avatar" />,
    bottomBar: (
      <GamePlacementToolbar
        density="dense"
        title="Placement"
        selectedTitle="Manual crystal chair"
        placedObjects={3}
        maxObjects={12}
        statusValue="Ready"
        actions={[{ id: 'place', label: 'Place object', icon: 'check', tone: 'primary', shortcut: 'Enter' }]}
        objectActions={[{ id: 'rotate', label: 'Rotate object', icon: 'compass', shortcut: 'R' }]}
      />
    ),
  },
};

export const RailCompressed: StoryObj<typeof GameAssetLibrary> = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 74 }}>
      <GameAssetLibrary
        density="dense"
        label="Compressed rail assets"
        title="Build"
        variant="rail"
        selectedAssetId="starter-chair"
        groups={[
          {
            id: 'starter',
            label: 'Starter',
            source: 'starter',
            assets: [
              { assetId: 'starter-platform', source: 'starter', title: 'Platform', status: 'ready', icon: 'portal' },
              { assetId: 'starter-chair', source: 'starter', title: 'Chair', status: 'selected', icon: 'shop' },
              { assetId: 'starter-bookcase', source: 'starter', title: 'Bookcase', status: 'ready', icon: 'scroll' },
            ],
          },
          {
            id: 'generated',
            label: 'Generated',
            source: 'generated',
            assets: [{ assetId: 'generated-lamp', source: 'generated', title: 'Generated lamp', status: 'ready', icon: 'gem' }],
          },
        ]}
      />
    </div>
  ),
};

export const ActionPattern: StoryObj<typeof GameActionGrid> = {
  render: () => (
    <GameActionGrid
      label="Official object actions"
      actions={[
        { id: 'place', label: 'Place', icon: 'check', tone: 'primary', shortcut: 'Enter' },
        { id: 'rotate', label: 'Rotate', icon: 'compass', shortcut: 'R' },
        { id: 'remove', label: 'Remove', icon: 'close', tone: 'danger', disabled: true },
      ]}
    />
  ),
};
