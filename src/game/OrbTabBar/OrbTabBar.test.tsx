import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { OrbTabBar, type OrbTabSlots } from './OrbTabBar';

const TABS: OrbTabSlots = [
  { id: 'home', label: 'Home', icon: <span>H</span> },
  { id: 'map', label: 'Map', icon: <span>M</span> },
  { id: 'log', label: 'Log', icon: <span>L</span> },
  { id: 'more', label: 'More', icon: <span>⋯</span> },
];

describe('OrbTabBar', () => {
  it('renders four tabs plus one centre orb, and a selected tab', () => {
    const html = renderToStaticMarkup(
      <OrbTabBar
        activeId="map"
        orb={<span>+</span>}
        orbLabel="Open game menu"
        tabs={TABS}
        theme="graphite"
      />,
    );
    expect(html.match(/role="tab"/g)).toHaveLength(4);
    expect(html.match(/class="game-ui-v12-orb-tab-bar__orb"/g)).toHaveLength(1);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Open game menu"');
    expect(html).toContain('data-v12-theme="graphite"');
  });

  it('gives only the active tab a tab stop', () => {
    const html = renderToStaticMarkup(
      <OrbTabBar activeId="map" orb={<span>+</span>} orbLabel="Open game menu" tabs={TABS} />,
    );
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html.match(/tabindex="-1"/g)).toHaveLength(3);
  });
});
