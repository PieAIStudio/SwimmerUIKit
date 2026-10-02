import { readComponentStyles } from './helpers/styles';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameIconButton } from '../src/controls/GameIconButton/GameIconButton';

import { GameTabs } from '../src/controls/GameTabs/GameTabs';

import { GameToggle } from '../src/controls/GameToggle/GameToggle';

import { GameTooltip } from '../src/feedback/GameTooltip/GameTooltip';

const stylesCss = readComponentStyles();

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

/** The toggle track's unconditional rule body, and its `aria-checked` one. */
function trackRules(css: string): { base: string; checked: string | undefined } {
  const body = (selector: string): string | undefined =>
    css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1];
  return {
    base: body('\\.game-ui-toggle-thumb') ?? '',
    checked: body("\\.game-ui-toggle\\[aria-checked='true'\\] \\.game-ui-toggle-thumb"),
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
    expect(track.checked).toBeDefined();
    // The bead sits left when off and right when on. Position is the half of
    // the state that survives both palettes and both kinds of colour vision.
    expect(track.base).toMatch(/left:\s*2px/);
    expect(track.checked).toMatch(/translate:\s*16px 0/);
    // A reserved visible check and the semantic selected fill reinforce state,
    // without using an inset shadow as a fake second bead in 3.0.
    // Claude's S4 amendment: the thumb reads its style token, not black text ink.
    expect(track.base).toContain('background: var(--game-ui-control-on-edge)');
    expect(stylesCss).toContain('background: var(--game-ui-control-disabled-fill)');
    expect(track.base).not.toContain('box-shadow');
    expect(stylesCss).toContain('--game-ui-paint-fill: var(--game-ui-control-on-fill)');
    expect(stylesCss).toMatch(
      /aria-checked='true'[\s\S]*?game-ui-selection-mark\s*\{\s*visibility:\s*visible/,
    );
  });
});
