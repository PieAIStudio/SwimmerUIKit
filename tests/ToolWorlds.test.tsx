import { readFileSync } from 'node:fs';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Checkbox } from '../src';
import {
  BentoProgress,
  GlassCard,
  ManagerSheet,
  RoundAction,
  Switch,
  ToolLanding,
  ToolSidebar,
  ToolWindow,
} from '../src/tool-worlds';

const markup = (node: ReactNode) => renderToStaticMarkup(node).replace(/\s+/g, ' ');

describe('Colour Worlds parts', () => {
  it('uses one short fading divider for both sidebar modes without a sidebar fill', () => {
    const css = readFileSync('src/containers/ToolWindow/component.css', 'utf8');
    expect(css).not.toContain('border-right: 1px solid var(--swimmer-tool-line)');
    expect(css).toContain('.game-ui-tool-window-sidebar::after');
    expect(css).toContain('top: 20%');
    expect(css).toContain('height: 60%');
    expect(css).toContain('background: linear-gradient');
  });

  it('keeps the world, transparent sidebar and rail state explicit', () => {
    const html = markup(
      <ToolWindow
        sidebar={
          <ToolSidebar
            items={[{ id: 'home', icon: <span />, label: 'Home', selected: true }]}
            mode="rail"
          />
        }
        sidebarMode="rail"
        title="ClaudeSync"
        world="violet"
      >
        <ToolLanding
          art={<span>art</span>}
          features={[{ id: 'one', icon: <span />, title: 'One' }]}
          lead="Lead"
          title="Landing"
        />
        <RoundAction promise="Nothing moves until you confirm" state="stop">
          Stop
        </RoundAction>
      </ToolWindow>,
    );

    expect(html).toContain('data-tool-world="violet"');
    expect(html).toContain('data-tool-sidebar-mode="rail"');
    expect(html).toContain('data-tool-sidebar="true"');
    expect(html).toContain('data-tool-main-action="true"');
    expect(html).toContain('data-tool-round-state="stop"');
    expect(html).toContain('Nothing moves until you confirm');
  });

  it('uses real checkbox and search inputs under manager-sheet paint', () => {
    const html = markup(
      <ManagerSheet
        actionLabel="Restore"
        groups={[{ id: 'photos', icon: <span />, label: 'Photos', selected: true, badge: 2 }]}
        rows={[{ id: 'photo', checked: true, icon: <span />, name: 'Weekend.jpg', size: '4 MB' }]}
        selectedCount="1 selected"
        selectedSize="4 MB"
        sortLabel="Recent"
        title="Restore files"
      />,
    );

    expect(html).toContain('data-tool-sheet="true"');
    expect(html).toContain('type="search"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('data-tool-checkbox="true"');
    expect(html).toContain('data-tool-action-pill="true"');
  });

  it.each(['light', 'dark'] as const)('accepts host labels with the %s theme', (theme) => {
    const html = markup(
      <ManagerSheet
        actionLabel="Restore"
        backLabel="Retour"
        groups={[]}
        onRowOpen={() => {}}
        rows={[{ id: 'photo', name: <strong>Weekend.jpg</strong>, label: 'Photo du week-end' }]}
        searchLabel="Rechercher"
        sortLabel="Date"
        sortPrefix="Trier : "
        theme={theme}
        title="Fichiers"
      />,
    );

    expect(html).toContain('>Retour</span>');
    expect(html).toContain('aria-label="Rechercher"');
    expect(html).toContain('>Trier : </span>');
    expect(html).toContain('aria-label="Select Photo du week-end"');
    expect(html).toContain('aria-label="Open Photo du week-end"');
    expect(html).toContain('<strong>Weekend.jpg</strong>');
    expect(html).not.toContain('[object Object]');
  });

  it.each([
    ['light', 'Back', 'Sort by: '],
    ['dark', '返回', '排序：'],
  ] as const)('keeps existing %s label defaults', (theme, backLabel, sortPrefix) => {
    const html = markup(
      <ManagerSheet
        actionLabel="Restore"
        groups={[]}
        onRowOpen={() => {}}
        rows={[{ id: 'photo', name: 'Weekend.jpg' }]}
        theme={theme}
        title="Files"
      />,
    );

    expect(html).toContain(`>${backLabel}</span>`);
    expect(html).toContain('aria-label="Search"');
    expect(html).toContain(`>${sortPrefix}</span>`);
    expect(html).toContain('aria-label="Select Weekend.jpg"');
    expect(html).toContain('aria-label="Open Weekend.jpg"');
  });

  it('covers the static card, progress and switch states', () => {
    const html = markup(
      <>
        <GlassCard title="Found items" variant="big" />
        <BentoProgress
          tiles={[
            { id: 'done', label: 'Done', state: 'done', value: '2' },
            { id: 'now', label: 'Now', state: 'now' },
            { id: 'wait', label: 'Waiting', state: 'waiting' },
          ]}
        />
        <Checkbox label="Select item" tool defaultChecked />
        <Switch label="Retry" defaultChecked />
      </>,
    );

    expect(html).toContain('data-tool-card-variant="big"');
    expect(html).toContain('data-state="done"');
    expect(html).toContain('data-state="now"');
    expect(html).toContain('data-state="waiting"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('game-ui-switch-track');
  });
});
