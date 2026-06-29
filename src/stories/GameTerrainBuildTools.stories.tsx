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
  { id: 'terrain', label: 'Terrain', compactLabel: 'Land', icon: 'portal' },
  { id: 'build', label: 'Build', compactLabel: 'Build', icon: 'home' },
  { id: 'place', label: 'Place', compactLabel: 'Place', icon: 'gem' },
  { id: 'inspect', label: 'Inspect', compactLabel: 'Info', icon: 'compass' },
];

const tools: readonly GameTerrainToolOption[] = [
  { id: 'raise', label: 'Raise terrain', compactLabel: 'Raise', shortcut: '1' },
  { id: 'lower', label: 'Lower terrain', compactLabel: 'Lower', shortcut: '2' },
  { id: 'flatten', label: 'Flatten terrain', compactLabel: 'Flat', shortcut: '3' },
  { id: 'smooth', label: 'Smooth terrain', compactLabel: 'Soft', shortcut: '4' },
  { id: 'paint', label: 'Paint material', compactLabel: 'Paint', shortcut: '5' },
];

const longTools: readonly GameTerrainToolOption[] = [
  { id: 'raise', label: 'Raise terrain upward', compactLabel: 'Raise', shortcut: '1' },
  { id: 'lower', label: 'Lower shoreline down', compactLabel: 'Lower', shortcut: '2' },
  { id: 'flatten', label: 'Flatten building pad', compactLabel: 'Flat', shortcut: '3' },
  { id: 'smooth', label: 'Smooth sculpted ridge', compactLabel: 'Soft', shortcut: '4' },
  { id: 'paint', label: 'Paint terrain material', compactLabel: 'Paint', shortcut: '5' },
];

const materials: readonly GameTerrainMaterialSwatch[] = [
  { id: 'grass', label: 'Grass', compactLabel: 'Grass', color: '#4f9d6b', pattern: 'speckled', secondaryColor: '#8fd8a2' },
  { id: 'soil', label: 'Soil', compactLabel: 'Soil', color: '#8a5a32', pattern: 'speckled', secondaryColor: '#c08a58' },
  { id: 'path', label: 'Path', compactLabel: 'Path', color: '#b98d5d', pattern: 'hatched', secondaryColor: '#7d573b' },
  { id: 'sand', label: 'Sand', compactLabel: 'Sand', color: '#dcc27a', pattern: 'speckled', secondaryColor: '#f8e3a5' },
  { id: 'stone', label: 'Stone', compactLabel: 'Stone', color: '#848077', pattern: 'grid', secondaryColor: '#b9b2a4' },
  { id: 'water-edge', label: 'Water edge', compactLabel: 'Water', color: '#4b96a8', pattern: 'grid', secondaryColor: '#9bd4df' },
];

const categories: readonly GameBuildCategory[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    compactLabel: 'Base',
    icon: 'home',
    meta: 'snap grid',
    items: [
      { id: 'floor-2x2', label: '2x2 floor', compactLabel: '2x2', status: 'selected', badges: [{ label: 'snap' }] },
      { id: 'floor-4x4', label: '4x4 foundation slab', compactLabel: '4x4', status: 'ready', badges: [{ label: 'wide' }] },
    ],
  },
  {
    id: 'wall',
    label: 'Walls',
    compactLabel: 'Wall',
    icon: 'card',
    items: [
      { id: 'wall-solid', label: 'Solid wall', compactLabel: 'Solid', status: 'ready' },
      { id: 'wall-window', label: 'Wall with window opening', compactLabel: 'Window', status: 'ready' },
      { id: 'wall-door', label: 'Door opening wall', compactLabel: 'Door', status: 'locked', meta: 'unlock after foundation' },
    ],
  },
  {
    id: 'roof',
    label: 'Roof',
    compactLabel: 'Roof',
    icon: 'crown',
    items: [
      { id: 'roof-gable', label: 'Gable roof', compactLabel: 'Gable', status: 'progress', meta: 'optimizing' },
      { id: 'roof-flat', label: 'Flat roof cap', compactLabel: 'Flat', status: 'ready' },
    ],
  },
  {
    id: 'prop',
    label: 'Outdoor props',
    compactLabel: 'Props',
    icon: 'gem',
    items: [
      { id: 'deck-stairs', label: 'Deck stairs', compactLabel: 'Stairs', status: 'ready' },
      { id: 'garden-fence-long-name', label: 'Very long garden fence segment', compactLabel: 'Fence', status: 'ready' },
    ],
  },
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

export const IconOnlyMobileA11y: Story = {
  args: {
    ...baseArgs,
    drawerOpen: true,
    title: 'Tools',
    toolCompactLabelMode: 'hidden',
    variant: 'small-mobile',
  },
  parameters: {
    docs: {
      description: {
        story: 'For teams that choose icon-only mobile controls, every icon button still keeps the full accessible label from the action label.',
      },
    },
  },
};

export const ResponsiveMatrix: StoryObj = {
  render: () => {
    const frames = [
      { id: 'desktop', label: 'Desktop 1440', width: 1180, variant: 'desktop' as const, drawerOpen: false },
      { id: 'tablet', label: 'Tablet 768', width: 768, variant: 'dense' as const, drawerOpen: false },
      { id: 'mobile', label: 'Mobile landscape 844', width: 844, variant: 'mobile' as const, drawerOpen: true },
      { id: 'small-mobile', label: 'Small mobile 360', width: 360, variant: 'small-mobile' as const, drawerOpen: true },
    ];
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {frames.map((frame) => (
          <section key={frame.id} style={{ display: 'grid', gap: 8, maxWidth: '100%', overflowX: 'auto' }}>
            <strong>{frame.label}</strong>
            <div style={{ border: '1px dashed rgba(92,60,39,.32)', borderRadius: 18, padding: 10, width: frame.width }}>
              <GameTerrainBuildToolbox
                {...baseArgs}
                brush={{ radius: 7.75, strength: 0.95 }}
                drawerOpen={frame.drawerOpen}
                title={frame.variant === 'small-mobile' ? 'Tools' : 'Island tools'}
                tools={longTools}
                variant={frame.variant}
              />
            </div>
          </section>
        ))}
      </div>
    );
  },
};

export const BuildLibraryOverflow: StoryObj = {
  render: () => (
    <GameBuildLibrary
      activeCategoryId="wall"
      categories={categories}
      label="Build library"
      selectedItemId="wall-window"
      title="Build pieces"
      variant="small-mobile"
    />
  ),
};

export const DrawerClosed: StoryObj = {
  render: () => (
    <GameCompactGameDrawer label="Compact build drawer" open={false} panelId="story-terrain-tools" title="Build" variant="small-mobile">
      <GameBuildLibrary activeCategoryId="wall" categories={categories} label="Build library" selectedItemId="wall-solid" title="Build pieces" variant="small-mobile" />
    </GameCompactGameDrawer>
  ),
};

export const InteractiveDrawer: StoryObj = {
  render: function InteractiveDrawerStory() {
    const [open, setOpen] = useState(true);
    return (
      <GameCompactGameDrawer label="Interactive terrain drawer" onOpenChange={setOpen} open={open} panelId="interactive-terrain-tools" title="Tools" variant="small-mobile">
        <GameTerrainBuildToolbox {...baseArgs} title="Nested tools" variant="desktop" />
      </GameCompactGameDrawer>
    );
  },
};
