import { type ReactNode } from 'react';

import { GameTerrainBuildToolbox } from '../../../game/terrain/GameTerrainBuildToolbox/GameTerrainBuildToolbox';

import {
  type GameBuildCategory,
  type GameTerrainBuildModeOption,
  type GameTerrainMaterialSwatch,
  type GameTerrainToolOption,
} from '../../../game/terrain/model';

const TERRAIN_PREVIEW_MODES: readonly GameTerrainBuildModeOption[] = [
  { id: 'terrain', label: 'Terrain', icon: 'portal' },
  { id: 'build', label: 'Build', icon: 'home' },
  { id: 'place', label: 'Place', icon: 'gem' },
];

const TERRAIN_PREVIEW_TOOLS: readonly GameTerrainToolOption[] = [
  { id: 'raise', label: 'Raise', shortcut: '1' },
  { id: 'lower', label: 'Lower', shortcut: '2' },
  { id: 'flatten', label: 'Flatten', shortcut: '3' },
  { id: 'smooth', label: 'Smooth', shortcut: '4' },
  { id: 'paint', label: 'Paint', shortcut: '5' },
];

const TERRAIN_PREVIEW_MATERIALS: readonly GameTerrainMaterialSwatch[] = [
  { id: 'grass', label: 'Grass', color: '#4f9d6b' },
  { id: 'soil', label: 'Soil', color: '#8a5a32' },
  { id: 'path', label: 'Path', color: '#b98d5d' },
];

const TERRAIN_PREVIEW_BUILD: readonly GameBuildCategory[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    icon: 'home',
    items: [{ id: 'floor-2x2', label: '2x2 floor', status: 'selected' }],
  },
  {
    id: 'wall',
    label: 'Walls',
    icon: 'card',
    items: [{ id: 'wall-solid', label: 'Solid wall', status: 'ready' }],
  },
];

export function TerrainBuildToolSamples(): ReactNode {
  return (
    <div className="game-ui-preview-two-up">
      <GameTerrainBuildToolbox
        activeBuildCategoryId="foundation"
        activeMaterialId="grass"
        activeModeId="terrain"
        activeToolId="raise"
        brush={{ radius: 2.75, strength: 0.45 }}
        buildCategories={TERRAIN_PREVIEW_BUILD}
        label="Desktop terrain and build tools"
        materials={TERRAIN_PREVIEW_MATERIALS}
        modes={TERRAIN_PREVIEW_MODES}
        selectedBuildItemId="floor-2x2"
        status={{
          label: 'Ready',
          tone: 'success',
          description: 'Brush edits are local and reversible.',
          progressLabel: 'Optimization',
          progressMax: 100,
          progressValue: 68,
        }}
        title="Island tools"
        tools={TERRAIN_PREVIEW_TOOLS}
        undoRedo={{ canRedo: false, canUndo: true }}
      />
      <GameTerrainBuildToolbox
        activeBuildCategoryId="foundation"
        activeMaterialId="path"
        activeModeId="terrain"
        activeToolId="paint"
        brush={{ radius: 1.5, strength: 0.3 }}
        buildCategories={TERRAIN_PREVIEW_BUILD}
        drawerOpen
        label="Small mobile terrain drawer"
        materials={TERRAIN_PREVIEW_MATERIALS}
        modes={TERRAIN_PREVIEW_MODES}
        selectedBuildItemId="floor-2x2"
        status={{
          label: 'Blocked',
          tone: 'warning',
          description: 'This edit would bury a placed object.',
        }}
        title="Tools"
        tools={TERRAIN_PREVIEW_TOOLS}
        undoRedo={{ canRedo: true, canUndo: true }}
        variant="small-mobile"
      />
    </div>
  );
}
