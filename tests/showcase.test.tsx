import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DemoPanel } from '../src/showcase/DemoPanel';
import { FlowStrip } from '../src/showcase/FlowStrip';
import { KitCard } from '../src/showcase/KitCard';
import { ShowcaseShell } from '../src/showcase/ShowcaseShell';
import { StatusList } from '../src/showcase/StatusList';
import type { KitManifest } from '../src/showcase/types';

const kit: KitManifest = {
  name: 'FixtureKit',
  tagline: { en: 'Fixture', zh: '样例' },
  consumers: { en: 'Teams', zh: '团队' },
  type: 'visual',
  version: '1.0.0',
  status: { label: { en: 'State', zh: '状态' }, value: 'Ready', tone: 'success' },
  lastRelease: '2026-11-13',
  what: { en: 'One line', zh: '一句话' },
  updates: [{ date: '2026-11-13', text: { en: 'New', zh: '新' } }],
  code: ['one', 'two', 'three'],
};

describe('showcase parts', () => {
  it('renders the five-block shell and localized rail', () => {
    const html = renderToStaticMarkup(
      <ShowcaseShell
        kit={kit}
        language="zh"
        demo={
          <DemoPanel label="输入" runLabel="运行" resultLabel="结果">
            <FlowStrip steps={[{ label: 'A' }, { label: 'B' }, { label: 'C' }]} />
          </DemoPanel>
        }
      />,
    );
    expect(html).toContain('FixtureKit');
    expect(html).toContain('如何接入');
    expect(html).toContain('更新');
    expect(html).toContain('game-ui-showcase-flow');
    expect(html).toContain('FixtureKit · v1.0.0');
    expect(html).not.toContain('FixtureKit · 样例');
  });
  it('keeps cards and status independently reusable', () => {
    expect(renderToStaticMarkup(<KitCard kit={kit} />)).toContain('FixtureKit');
    expect(renderToStaticMarkup(<StatusList kit={kit} />)).toContain('Ready');
  });
});

describe('board-level showcase parts', () => {
  it('AppBar keeps primary pages inline and marks the active page', async () => {
    const { AppBar, AppBarAction } = await import('../src/showcase/AppBar');
    const html = renderToStaticMarkup(
      <AppBar
        brand="HQ"
        navLabel="Pages"
        moreLabel="More"
        activeId="kits"
        onSelect={() => undefined}
        items={[
          { id: 'progress', label: 'Progress', primary: true },
          { id: 'kits', label: 'Kits' },
        ]}
        actions={<AppBarAction label="Theme">Dark</AppBarAction>}
      />,
    );
    expect(html).toContain('aria-label="Pages"');
    // The inline link list holds only primary pages; the trigger names the active overflow page.
    expect(html.match(/class="game-ui-app-bar-link"/g)).toHaveLength(1);
    expect(html).toContain('data-overflow-active="true"');
    expect(html).toMatch(/game-ui-app-bar-trigger-wide">Kits</);
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).not.toContain('role="menu"');
    expect(html).toContain('aria-label="Theme"');
  });

  it('DisclosureRow renders its body only while open', async () => {
    const { DisclosureRow } = await import('../src/showcase/DisclosureRow');
    const row = (open: boolean) =>
      renderToStaticMarkup(
        <DisclosureRow
          title="Side line"
          summary="Now"
          tone="attention"
          open={open}
          onToggle={() => undefined}
        >
          <p>Body</p>
        </DisclosureRow>,
      );
    expect(row(false)).toContain('aria-expanded="false"');
    expect(row(false)).not.toContain('Body');
    expect(row(true)).toContain('aria-expanded="true"');
    expect(row(true)).toContain('Body');
    expect(row(true)).toContain('data-tone="attention"');
  });

  it('ChipNav renders native anchors with counts', async () => {
    const { ChipNav } = await import('../src/showcase/ChipNav');
    const html = renderToStaticMarkup(
      <ChipNav
        label="Groups"
        activeId="code"
        items={[
          { id: 'visual', label: 'Visual', href: '#visual', count: 7 },
          { id: 'code', label: 'Code', href: '#code' },
        ]}
      />,
    );
    expect(html).toContain('href="#visual"');
    expect(html.match(/game-ui-chip-nav-count/g)).toHaveLength(1);
    expect(html.match(/aria-current="location"/g)).toHaveLength(1);
  });

  it('ChipNav with onSelect renders filter buttons and marks the chosen one pressed', async () => {
    const { ChipNav } = await import('../src/showcase/ChipNav');
    const html = renderToStaticMarkup(
      <ChipNav
        label="Groups"
        activeId="all"
        onSelect={() => {}}
        items={[
          { id: 'all', label: 'All', count: 9 },
          { id: 'code', label: 'Code', count: 2 },
        ]}
      />,
    );
    expect(html).toContain('role="group"');
    expect(html).not.toContain('<a ');
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(1);
  });

  it('AppBar lists primary pages first in its menu', async () => {
    const { appBarMenuOrder } = await import('../src/showcase/AppBar');
    const order = appBarMenuOrder([
      { id: 'a', label: 'A', primary: true },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C', primary: true },
    ]);
    expect(order.map((item) => item.id)).toEqual(['a', 'c', 'b']);
  });

  it('PageHeader renders one h1 and optional parts', async () => {
    const { PageHeader } = await import('../src/showcase/PageHeader');
    const html = renderToStaticMarkup(<PageHeader title="Kits" kicker="Board" titleId="t" />);
    expect(html).toContain('<h1 id="t">Kits</h1>');
    expect(html).toContain('game-ui-page-header-kicker');
    expect(html).not.toContain('game-ui-page-header-lead');
  });

  it('KitCard uses host labels, hides an empty version and shows the action only on links', () => {
    const base = { ...kit, version: '' };
    const linked = renderToStaticMarkup(
      <KitCard
        kit={base}
        href="/kits/x/"
        labels={{ status: '已上线', type: '视觉', action: '打开展示' }}
      />,
    );
    expect(linked).toContain('已上线');
    expect(linked).toContain('视觉');
    expect(linked).not.toContain(' · v');
    expect(linked).toContain('打开展示');
    const plain = renderToStaticMarkup(<KitCard kit={kit} labels={{ action: 'Open' }} />);
    expect(plain).toContain('visual · v1.0.0');
    expect(plain).not.toContain('game-ui-showcase-kit-card__action');
    const waiting = renderToStaticMarkup(
      <KitCard kit={kit} labels={{ action: 'Open', unavailable: 'No showcase yet' }} />,
    );
    expect(waiting).toContain('No showcase yet');
    expect(linked).not.toContain('game-ui-showcase-kit-card__unavailable');
    const noTypeWithVersion = renderToStaticMarkup(
      <KitCard kit={kit} labels={{ type: '', unavailable: 'No showcase yet' }} />,
    );
    expect(noTypeWithVersion).toContain('<small>v1.0.0</small>');
    expect(noTypeWithVersion).not.toContain(' · ');
    const noTypeNoVersion = renderToStaticMarkup(
      <KitCard kit={base} labels={{ type: '', unavailable: 'No showcase yet' }} />,
    );
    expect(noTypeNoVersion).not.toContain('<small>');
  });
});
