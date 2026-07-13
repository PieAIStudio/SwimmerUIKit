import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameIconButton, GameTabs, GameTooltip } from './GameSurfaces';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('GameTooltip', () => {
  it('wires aria-describedby onto a single element trigger', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameTooltip label="Open settings">
          <GameIconButton label="Settings">⚙</GameIconButton>
        </GameTooltip>,
      ),
    );

    const describedByMatch = html.match(/aria-describedby="([^"]+)"/);
    expect(describedByMatch).not.toBeNull();
    expect(html).toContain('role="tooltip"');
    // The describedby value must match the tooltip span's own id.
    expect(html).toContain(`id="${describedByMatch?.[1]}"`);
  });

  it('renders text children unchanged without throwing', () => {
    const html = compact(
      renderToStaticMarkup(<GameTooltip label="Info">Plain text trigger</GameTooltip>),
    );
    expect(html).toContain('Plain text trigger');
    expect(html).toContain('role="tooltip"');
  });
});

describe('GameTabs', () => {
  it('wires aria-controls from panelId and gives each tab a predictable id', () => {
    const html = compact(
      renderToStaticMarkup(
        <GameTabs
          activeId="info"
          id="detail"
          tabs={[
            { id: 'info', label: 'Info', panelId: 'detail-panel-info' },
            { id: 'stats', label: 'Stats', panelId: 'detail-panel-stats' },
          ]}
        />,
      ),
    );

    expect(html).toContain('id="detail-info"');
    expect(html).toContain('id="detail-stats"');
    expect(html).toContain('aria-controls="detail-panel-info"');
    expect(html).toContain('aria-controls="detail-panel-stats"');
  });

  it('omits aria-controls when panelId is not provided (no breaking change)', () => {
    const html = compact(
      renderToStaticMarkup(<GameTabs activeId="a" tabs={[{ id: 'a', label: 'A' }]} />),
    );
    expect(html).not.toContain('aria-controls');
  });
});
