import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  GameBrushControls,
  GameBuildLibrary,
  GameCompactGameDrawer,
  GameMaterialSwatches,
  GameTerrainBuildToolbox,
  GameTerrainModeControl,
  GameTerrainToolStrip,
  GameUndoRedoActions,
  type GameBuildCategory,
  type GameTerrainBuildModeOption,
  type GameTerrainMaterialSwatch,
  type GameTerrainToolOption,
} from './GameTerrainBuildTools';

const compact = (markup: string): string => markup.replace(/\s+/g, ' ');

const modes: readonly GameTerrainBuildModeOption[] = [
  { id: 'terrain', label: 'Terrain', icon: 'portal', meta: 'Shape land' },
  { id: 'build', label: 'Build', icon: 'home' },
];

const tools: readonly GameTerrainToolOption[] = [
  { id: 'raise', label: 'Raise' },
  { id: 'lower', label: 'Lower' },
  { id: 'flatten', label: 'Flatten' },
  { id: 'smooth', label: 'Smooth' },
  { id: 'paint', label: 'Paint' },
];

const materials: readonly GameTerrainMaterialSwatch[] = [
  { id: 'grass', label: 'Grass', color: '#4f9d6b' },
  { id: 'path', label: 'Path', color: '#b98d5d' },
];

const categories: readonly GameBuildCategory[] = [
  { id: 'foundation', label: 'Foundation', icon: 'home', items: [{ id: 'floor-2x2', label: '2x2 floor', status: 'selected' }] },
  { id: 'wall', label: 'Wall', icon: 'card', items: [{ id: 'wall-solid', label: 'Solid wall', status: 'ready' }] },
];

describe('terrain/build tooling pack', () => {
  it('renders mode, tool, brush, material, and history hooks', () => {
    const html = compact(renderToStaticMarkup(
      <>
        <GameTerrainModeControl activeModeId="terrain" label="Mode" modes={modes} />
        <GameTerrainToolStrip activeToolId="flatten" label="Terrain tools" tools={tools} variant="mobile" />
        <GameBrushControls state={{ radius: 3.5, strength: 0.45 }} />
        <GameMaterialSwatches activeMaterialId="path" label="Materials" materials={materials} />
        <GameUndoRedoActions canUndo label="Terrain history" />
      </>,
    ));

    expect(html).toContain('data-ui-hook="terrain-mode-control"');
    expect(html).toContain('data-mode-id="terrain"');
    expect(html).toContain('data-ui-hook="terrain-tool-strip"');
    expect(html).toContain('data-active-tool="flatten"');
    expect(html).toContain('aria-label="Brush radius value"');
    expect(html).toContain('data-material-id="path"');
    expect(html).toContain('data-ui-hook="undo-redo-actions"');
    expect(html).toContain('back-v1.png');
    expect(html).toContain('refresh-v1.png');
  });

  it('renders build library and compact drawer with stable hooks', () => {
    const html = compact(renderToStaticMarkup(
      <>
        <GameBuildLibrary activeCategoryId="foundation" categories={categories} label="Build library" selectedItemId="floor-2x2" title="Build pieces" />
        <GameCompactGameDrawer label="Tools drawer" open title="Tools"><span>Visible tools</span></GameCompactGameDrawer>
      </>,
    ));

    expect(html).toContain('data-ui-hook="build-library"');
    expect(html).toContain('data-build-category-id="foundation"');
    expect(html).toContain('data-build-item-id="floor-2x2"');
    expect(html).toContain('data-build-item-status="selected"');
    expect(html).toContain('data-ui-hook="compact-game-drawer"');
    expect(html).toContain('aria-expanded="true"');
  });

  it('renders composite small-mobile toolbox with status, progress, and build pieces', () => {
    const html = compact(renderToStaticMarkup(
      <GameTerrainBuildToolbox
        activeBuildCategoryId="foundation"
        activeMaterialId="grass"
        activeModeId="terrain"
        activeToolId="raise"
        brush={{ radius: 2, strength: 0.5 }}
        buildCategories={categories}
        drawerOpen
        label="Terrain and build tools"
        materials={materials}
        modes={modes}
        selectedBuildItemId="floor-2x2"
        status={{ label: 'Ready', tone: 'success', progressLabel: 'Optimization', progressMax: 100, progressValue: 72 }}
        title="Tools"
        tools={tools}
        undoRedo={{ canRedo: false, canUndo: true }}
        variant="small-mobile"
      />,
    ));

    expect(html).toContain('data-ui-hook="compact-game-drawer"');
    expect(html).toContain('data-variant="small-mobile"');
    expect(html).toContain('Optimization');
    expect(html).toContain('data-ui-hook="build-library"');
  });
});
