import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameFactList } from '../src/game/GameFactList/GameFactList';

import { GameMovementPad } from '../src/game/GameMovementPad/GameMovementPad';

import { GameShell } from '../src/containers/GameShell/GameShell';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('OwnMySpace game surface pack', () => {
  it('renders a reusable game shell with named HUD, library, movement, and toolbar slots', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameShell
          title="OwnMySpace surface"
          hud={
            <GameFactList
              label="World facts"
              facts={[{ id: 'position', label: 'Position', value: '0,0,0' }]}
            />
          }
          assetLibrary={<span>Library slot</span>}
          movementPad={<GameMovementPad label="Move avatar" />}
          bottomBar={<span>Placement slot</span>}
        >
          <canvas aria-label="3D scene" />
        </GameShell>,
      ),
    );

    expect(html).toContain('aria-label="OwnMySpace surface"');
    expect(html).toContain('game-ui-shell-hud');
    expect(html).toContain('game-ui-shell-library');
    expect(html).toContain('game-ui-shell-movement');
    expect(html).toContain('game-ui-shell-bottom-bar');
    expect(html).toContain('aria-label="3D scene"');
  });

  it('renders movement controls with accessible labels, keyboard shortcuts, and dense variant hooks', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameMovementPad density="dense" helpText="Use WASD or arrows." label="Move avatar" />,
      ),
    );

    expect(html).toContain('aria-label="Move avatar"');
    expect(html).toContain('data-density="dense"');
    expect(html).toContain('aria-label="Move forward"');
    expect(html).toContain('aria-label="Move left"');
    expect(html).toContain('W / ↑');
    expect(html).toContain('S / ↓');
    expect(html).toContain('tabindex="0"');
  });
});
