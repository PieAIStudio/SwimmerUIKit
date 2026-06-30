import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  GameActionGrid,
  GameAssetCard,
  GameAssetLibrary,
  GameFactList,
  GameMovementPad,
  GamePlacementToolbar,
  GameShell,
} from './GameSurfacePack';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('OwnMySpace game surface pack', () => {
  it('renders a reusable game shell with named HUD, library, movement, and toolbar slots', () => {
    const html = compact(renderToStaticMarkup(
      <GameShell
        title="OwnMySpace surface"
        hud={<GameFactList label="World facts" facts={[{ id: 'position', label: 'Position', value: '0,0,0' }]} />}
        assetLibrary={<span>Library slot</span>}
        movementPad={<GameMovementPad label="Move avatar" />}
        bottomBar={<GamePlacementToolbar title="Placement" selectedTitle="Crystal chair" />}
      >
        <canvas aria-label="3D scene" />
      </GameShell>,
    ));

    expect(html).toContain('aria-label="OwnMySpace surface"');
    expect(html).toContain('game-ui-shell-hud');
    expect(html).toContain('game-ui-shell-library');
    expect(html).toContain('game-ui-shell-movement');
    expect(html).toContain('game-ui-shell-bottom-bar');
    expect(html).toContain('aria-label="3D scene"');
  });

  it('renders movement controls with accessible labels, keyboard shortcuts, and dense variant hooks', () => {
    const html = compact(renderToStaticMarkup(<GameMovementPad density="dense" helpText="Use WASD or arrows." label="Move avatar" />));

    expect(html).toContain('aria-label="Move avatar"');
    expect(html).toContain('data-density="dense"');
    expect(html).toContain('aria-label="Move forward"');
    expect(html).toContain('aria-label="Move left"');
    expect(html).toContain('W / ↑');
    expect(html).toContain('S / ↓');
    expect(html).toContain('tabIndex="0"');
  });

  it('clearly distinguishes starter, generated, and imported assets in asset cards and library counts', () => {
    const html = compact(renderToStaticMarkup(
      <GameAssetLibrary
        label="Placeable assets"
        title="Assets"
        selectedAssetId="manual-chair"
        groups={[
          {
            id: 'starter',
            label: 'Starter assets',
            source: 'starter',
            assets: [{ assetId: 'starter-table', source: 'starter', title: 'Starter table', description: 'Built in', status: 'ready' }],
          },
          {
            id: 'generated',
            label: 'Generated assets',
            source: 'generated',
            assets: [{ assetId: 'gen-lamp', source: 'generated', title: 'Generated lamp', description: 'Provider output', status: 'generating' }],
          },
          {
            id: 'imported',
            label: 'Imported assets',
            source: 'imported',
            assets: [{ assetId: 'manual-chair', source: 'imported', title: 'Manual chair', description: 'Local fixture', status: 'selected' }],
          },
        ]}
      />,
    ));

    expect(html).toContain('Starter 1');
    expect(html).toContain('Generated 1');
    expect(html).toContain('Imported 1');
    expect(html).toContain('data-asset-source="starter"');
    expect(html).toContain('data-asset-source="generated"');
    expect(html).toContain('data-asset-source="imported"');
    expect(html).toContain('aria-pressed="true"');
  });

  it('renders official rail layout hooks for compressed asset libraries', () => {
    const html = compact(renderToStaticMarkup(
      <GameAssetLibrary
        cardLayout="rail"
        density="dense"
        label="Rail assets"
        title="Build"
        selectedAssetId="generated-crate"
        groups={[
          {
            id: 'generated',
            label: 'Generated assets',
            source: 'generated',
            assets: [{ assetId: 'generated-crate', source: 'generated', title: 'Generated crate', status: 'selected', icon: 'gem' }],
          },
        ]}
      />,
    ));

    expect(html).toContain('data-card-layout="rail"');
    expect(html).toContain('data-asset-card-layout="rail"');
    expect(html).toContain('Generated crate');
    expect(html).toContain('aria-pressed="true"');
  });

  it('renders asset cards as selectable buttons with source and status badges', () => {
    const html = compact(renderToStaticMarkup(
      <GameAssetCard
        assetId="generated-crate"
        source="generated"
        status="placed"
        title="Generated crate"
        description="Ready for placement"
        facts={[{ id: 'size', label: 'Size', value: '1x1' }]}
      />,
    ));

    expect(html).toContain('<button');
    expect(html).toContain('aria-label="Generated crate"');
    expect(html).toContain('data-asset-card-layout="list"');
    expect(html).toContain('Generated');
    expect(html).toContain('placed');
    expect(html).toContain('Generated crate');
    expect(html).toContain('game-ui-asset-card-icon');
    expect(html).toContain('Size');
  });

  it('supports official rail asset cards without host apps hiding internal copy', () => {
    const html = compact(renderToStaticMarkup(
      <GameAssetLibrary
        cardLayout="rail"
        label="Rail assets"
        title="Rail"
        groups={[
          {
            id: 'starter',
            label: 'Starter assets',
            source: 'starter',
            assets: [{ assetId: 'starter-chair', source: 'starter', title: 'Starter chair', icon: 'shop', status: 'selected' }],
          },
        ]}
      />,
    ));

    expect(html).toContain('data-card-layout="rail"');
    expect(html).toContain('data-asset-card-layout="rail"');
    expect(html).toContain('aria-label="Starter chair"');
    expect(html).toContain('game-ui-asset-card-copy');
  });

  it('renders placement and action toolbars with labels suitable for a11y and icon-only controls', () => {
    const html = compact(renderToStaticMarkup(
      <GamePlacementToolbar
        title="Placement toolbar"
        selectedTitle="Generated crate"
        placedObjects={3}
        maxObjects={12}
        statusValue="Placed"
        actions={[{ id: 'place', label: 'Place object', icon: 'check', tone: 'primary', shortcut: 'Enter' }]}
        objectActions={[{ id: 'rotate', label: 'Rotate object', icon: 'compass', shortcut: 'R' }]}
      />,
    ));

    expect(html).toContain('Placement toolbar');
    expect(html).toContain('Generated crate');
    expect(html).toContain('Placed');
    expect(html).toContain('aria-label="Placement toolbar actions"');
    expect(html).toContain('aria-label="Rotate object"');
    expect(html).toContain('Enter');
    expect(html).toContain('R');
  });

  it('renders a generic action grid using the official action pattern', () => {
    const html = compact(renderToStaticMarkup(
      <GameActionGrid
        label="Object actions"
        style="icon"
        actions={[
          { id: 'save', label: 'Save island', icon: 'check', selected: true },
          { id: 'delete', label: 'Delete object', icon: 'close', disabled: true },
        ]}
      />,
    ));

    expect(html).toContain('aria-label="Object actions"');
    expect(html).toContain('aria-label="Save island"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-label="Delete object"');
    expect(html).toContain('disabled=""');
  });
});
