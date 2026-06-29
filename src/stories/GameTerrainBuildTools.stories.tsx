import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  GameBuildLibrary,
  GameCompactGameDrawer,
  GameTerrainBuildToolbox,
  type GameBuildCategory,
  type GameTerrainBuildModeOption,
  type GameTerrainMaterialSwatch,
  type GameTerrainToolOption,
} from '../index';

const meta = {
  title: 'Clay/Game Surface Pack/Terrain Build Tools',
  component: GameTerrainBuildToolbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Official terrain/build controls for game surfaces. Host apps own state, runtime commands, persistence, and layout glue.',
      },
    },
  },
} satisfies Meta<typeof GameTerrainBuildToolbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const modes: readonly GameTerrainBuildModeOption[] = [
  { id: 'terrain', label: 'Terrain', icon: 'portal' },
  { id: 'build', label: 'Build', icon: 'home' },
  { id: 'place', label: 'Place', icon: 'gem' },
];

const tools: readonly GameTerrainToolOption[] = [
  { id: 'raise', label: 'Raise', shortcut: '1' },
  { id: 'lower', label: 'Lower', shortcut: '2' },
  { id: 'flatten', label: 'Flatten', shortcut: '3' },
  { id: 'smooth', label: 'Smooth', shortcut: '4' },
  { id: 'paint', label: 'Paint', shortcut: '5' },
];

const materials: readonly GameTerrainMaterialSwatch[] = [
  { id: 'grass', label: 'Grass', color: '#4f9d6b' },
  { id: 'soil', label: 'Soil', color: '#8a5a32' },
  { id: 'path', label: 'Path', color: '#b98d5d' },
];

const categories: readonly GameBuildCategory[] = [
  { id: 'foundation', label: 'Foundation', icon: 'home', items: [{ id: 'floor-2x2', label: '2x2 floor', status: 'selected' }] },
  { id: 'wall', label: 'Walls', icon: 'card', items: [{ id: 'wall-solid', label: 'Solid wall', status: 'ready' }] },
  { id: 'roof', label: 'Roof', icon: 'crown', items: [{ id: 'roof-gable', label: 'Gable roof', status: 'progress' }] },
];

const baseArgs = {
  activeBuildCategoryId: 'foundation',
  activeMaterialId: 'grass',
  activeModeId: 'terrain',
  activeToolId: 'raise',
  brush: { radius: 2.75, strength: 0.45 },
  buildCategories: categories,
  label: 'Terrain and build tools',
  materials,
  modes,
  selectedBuildItemId: 'floor-2x2',
  status: { label: 'Ready', tone: 'success' as const, description: 'Brush edits are local and reversible.', progressLabel: 'Optimization', progressMax: 100, progressValue: 68 },
  title: 'Island tools',
  tools,
  undoRedo: { canRedo: false, canUndo: true },
};

export const Desktop: Story = { args: { ...baseArgs, variant: 'desktop' } };
export const Dense: Story = { args: { ...baseArgs, density: 'dense', variant: 'dense' } };
export const MobileDrawer: Story = { args: { ...baseArgs, drawerOpen: true, title: 'Tools', variant: 'mobile' } };
export const SmallMobileDrawer: Story = { args: { ...baseArgs, drawerOpen: true, title: 'Tools', variant: 'small-mobile' } };

export const BuildOnly: StoryObj = {
  render: () => (
    <GameCompactGameDrawer label="Compact build drawer" open title="Build">
      <GameBuildLibrary activeCategoryId="wall" categories={categories} label="Build library" selectedItemId="wall-solid" title="Build pieces" variant="small-mobile" />
    </GameCompactGameDrawer>
  ),
};

export const InteractiveDrawer: StoryObj = {
  render: function InteractiveDrawerStory() {
    const [open, setOpen] = useState(true);
    return (
      <GameCompactGameDrawer label="Interactive terrain drawer" onOpenChange={setOpen} open={open} title="Tools" variant="small-mobile">
        <GameTerrainBuildToolbox {...baseArgs} title="Nested tools" variant="desktop" />
      </GameCompactGameDrawer>
    );
  },
};
