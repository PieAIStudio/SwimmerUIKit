import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameIconButton, GameTabs, GameToggle, GameTooltip } from './GameSurfaces';

const stylesCss = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'styles.css'), 'utf8');

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

/** The toggle track's unconditional rule body, and its `aria-checked` one. */
function trackRules(css: string): { base: string; checked: string | undefined } {
  const body = (selector: string): string | undefined =>
    css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1];
  return {
    base: body('\\.game-ui-toggle-track') ?? '',
    checked: body("\\.game-ui-toggle\\[aria-checked='true'\\] \\.game-ui-toggle-track"),
  };
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

describe('GameToggle', () => {
  it('reports its state to assistive technology', () => {
    expect(compact(renderToStaticMarkup(<GameToggle checked={false} label="Sound" />))).toContain(
      'aria-checked="false"',
    );
    expect(compact(renderToStaticMarkup(<GameToggle checked label="Sound" />))).toContain(
      'aria-checked="true"',
    );
  });

  it('renders that state visibly, in position as well as colour', () => {
    /*
      Regression, and the reason this file now reads CSS. `.game-ui-toggle-track`
      shipped with one unconditional rule — an always-on accent fill with the
      bead parked right — and no selector anywhere keyed on `aria-checked`, so
      on and off were pixel-identical in every theme for every consumer. The
      assertions above passed the whole time: the switch told screen readers
      the truth and told everyone else nothing.

      Position is asserted alongside colour because a state carried only by hue
      is a state some readers cannot see, and because the bead's inset offset is
      exactly what a future edit is most likely to drop.
    */
    const track = trackRules(stylesCss);
    expect(track.base).toMatch(/box-shadow:\s*inset 8px /);
    expect(track.checked).toBeDefined();
    expect(track.checked).toMatch(/box-shadow:\s*inset -8px /);
    expect(track.checked).toMatch(/background:\s*var\(--game-ui-secondary\)/);
    expect(track.base).not.toMatch(/background:\s*var\(--game-ui-secondary\)/);
  });
});
