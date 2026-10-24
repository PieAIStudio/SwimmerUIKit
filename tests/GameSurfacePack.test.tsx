import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { FactList } from '../src/game/FactList/FactList';

import { MovementPad } from '../src/game/MovementPad/MovementPad';

import { Shell } from '../src/containers/Shell/Shell';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('OwnMySpace game surface pack', () => {
  it('renders a reusable game shell with named HUD, library, movement, and toolbar slots', () => {
    const html = compact(
      renderToStaticMarkup(
        <Shell
          title="OwnMySpace surface"
          hud={
            <FactList
              label="World facts"
              facts={[{ id: 'position', label: 'Position', value: '0,0,0' }]}
            />
          }
          assetLibrary={<span>Library slot</span>}
          movementPad={<MovementPad label="Move avatar" />}
          bottomBar={<span>Placement slot</span>}
        >
          <canvas aria-label="3D scene" />
        </Shell>,
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
        <MovementPad density="dense" helpText="Use WASD or arrows." label="Move avatar" />,
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
