import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Tabs, type TabItem } from './Tabs';

const TABS: readonly TabItem[] = [
  { id: 'map', label: 'Map' },
  { id: 'bag', label: 'Bag', hue: 'leaf' },
  { id: 'log', label: 'Log' },
];

function tabStops(html: string): string[] {
  return [...html.matchAll(/<button[^>]*tabindex="0"[^>]*>/g)].map(
    (match) => /id="([^"]+)"/.exec(match[0])?.[1] ?? '',
  );
}

describe('Tabs', () => {
  it('makes only the active tab a tab stop and marks it selected', () => {
    const html = renderToStaticMarkup(<Tabs activeId="bag" id="inv" tabs={TABS} />);
    expect(tabStops(html)).toEqual(['inv-bag']);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-selected="true"[^>]*id="inv-bag"/);
  });

  it('keeps the tab list reachable by keyboard when no tab matches activeId', () => {
    // With every tab at tabindex=-1 the Tab key skips the whole tab list, so
    // the arrow-key handler (which already starts at the first tab) is unreachable.
    const html = renderToStaticMarkup(<Tabs activeId="missing" id="inv" tabs={TABS} />);
    expect(tabStops(html)).toEqual(['inv-map']);
    expect(html).not.toContain('aria-selected="true"');
  });

  it('applies the per-tab hue before the shared hue', () => {
    const html = renderToStaticMarkup(<Tabs activeId="map" hue="coral" id="inv" tabs={TABS} />);
    expect(html).toContain('--hue:var(--swimmer-hue-leaf)');
    expect(html.match(/--hue:var\(--swimmer-hue-coral\)/g)).toHaveLength(2);
  });

  it('only declares vertical orientation when asked', () => {
    const horizontal = renderToStaticMarkup(<Tabs activeId="map" tabs={TABS} />);
    expect(horizontal).not.toContain('aria-orientation');
    const vertical = renderToStaticMarkup(
      <Tabs activeId="map" aria-label="Inventory" orientation="vertical" tabs={TABS} />,
    );
    expect(vertical).toContain('aria-orientation="vertical"');
    expect(vertical).toContain('aria-label="Inventory"');
  });
});
