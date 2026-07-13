import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { getClayAssetMode, setClayAssetMode } from './clay/assets';
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
  { id: 'terrain', label: 'Terrain', compactLabel: 'Land', icon: 'portal', meta: 'Shape land' },
  { id: 'build', label: 'Build', compactLabel: 'Build', icon: 'home' },
];

const tools: readonly GameTerrainToolOption[] = [
  { id: 'raise', label: 'Raise terrain', compactLabel: 'Raise' },
  { id: 'lower', label: 'Lower terrain', compactLabel: 'Lower' },
  { id: 'flatten', label: 'Flatten terrain', compactLabel: 'Flat' },
  { id: 'smooth', label: 'Smooth terrain', compactLabel: 'Soft' },
  { id: 'paint', label: 'Paint material', compactLabel: 'Paint' },
];

const materials: readonly GameTerrainMaterialSwatch[] = [
  { id: 'grass', label: 'Grass', compactLabel: 'Grass', color: '#4f9d6b', pattern: 'speckled', secondaryColor: '#8fd8a2' },
  { id: 'path', label: 'Path', compactLabel: 'Path', color: '#b98d5d', pattern: 'hatched', secondaryColor: '#795034' },
];

const categories: readonly GameBuildCategory[] = [
  { id: 'foundation', label: 'Foundation', compactLabel: 'Base', icon: 'home', items: [{ id: 'floor-2x2', label: '2x2 floor', compactLabel: '2x2', previewSrc: '/assets/floor.png', status: 'selected' }] },
  { id: 'wall', label: 'Wall', compactLabel: 'Wall', icon: 'card', items: [{ id: 'wall-solid', label: 'Solid wall', compactLabel: 'Wall', status: 'ready' }] },
];

describe('terrain/build tooling pack', () => {
  it('renders mode, tool, brush, material, and history hooks', () => {
    // undo/redo icons only resolve to real asset filenames in 'source' mode
    // (the default 'inline' mode renders self-contained SVG data URIs instead).
    const previousMode = getClayAssetMode();
    setClayAssetMode('source');
    let html: string;
    try {
      html = compact(renderToStaticMarkup(
        <>
          <GameTerrainModeControl activeModeId="terrain" label="Mode" modes={modes} />
          <GameTerrainToolStrip activeToolId="flatten" label="Terrain tools" tools={tools} variant="mobile" />
          <GameBrushControls state={{ radius: 3.5, strength: 0.45 }} />
          <GameMaterialSwatches activeMaterialId="path" label="Materials" materials={materials} />
          <GameUndoRedoActions canUndo label="Terrain history" />
        </>,
      ));
    } finally {
      setClayAssetMode(previousMode);
    }

    expect(html).toContain('data-ui-hook="terrain-mode-control"');
    expect(html).toContain('data-mode-id="terrain"');
    expect(html).toContain('data-ui-hook="terrain-tool-strip"');
    expect(html).toContain('data-active-tool="flatten"');
    expect(html).toContain('data-icon-label-mode="caption"');
    expect(html).toContain('Flat');
    expect(html).toContain('aria-label="Brush radius value"');
    expect(html).toContain('data-material-id="path"');
    expect(html).toContain('data-swatch-pattern="hatched"');
    expect(html).toContain('data-ui-hook="undo-redo-actions"');
    expect(html).toContain('back-v1.png');
    expect(html).toContain('refresh-v1.png');
  });

  it('renders build library and compact drawer with stable hooks', () => {
    const html = compact(renderToStaticMarkup(
      <>
        <GameBuildLibrary activeCategoryId="foundation" categories={categories} label="Build library" selectedItemId="floor-2x2" title="Build pieces" />
        <GameCompactGameDrawer label="Tools drawer" open panelId="terrain-drawer" title="Tools"><span>Visible tools</span></GameCompactGameDrawer>
      </>,
    ));

    expect(html).toContain('data-ui-hook="build-library"');
    expect(html).toContain('data-build-category-id="foundation"');
    expect(html).toContain('data-build-item-id="floor-2x2"');
    expect(html).toContain('data-build-item-status="selected"');
    expect(html).toContain('game-ui-build-item-preview');
    expect(html).toContain('data-ui-hook="compact-game-drawer"');
    expect(html).toContain('aria-controls="terrain-drawer"');
    expect(html).toContain('aria-expanded="true"');
  });

  it('renders closed and reopened compact drawer states without changing the panel id', () => {
    const closed = compact(renderToStaticMarkup(
      <GameCompactGameDrawer label="Tools drawer" open={false} panelId="stable-tools" title="Tools"><span>Hidden tools</span></GameCompactGameDrawer>,
    ));
    const reopened = compact(renderToStaticMarkup(
      <GameCompactGameDrawer label="Tools drawer" open panelId="stable-tools" title="Tools"><span>Visible tools</span></GameCompactGameDrawer>,
    ));

    expect(closed).toContain('data-open="false"');
    expect(closed).toContain('aria-expanded="false"');
    expect(closed).toContain('aria-hidden="true"');
    expect(reopened).toContain('data-open="true"');
    expect(reopened).toContain('aria-expanded="true"');
    expect(reopened).toContain('aria-controls="stable-tools"');
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
