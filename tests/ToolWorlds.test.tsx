import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  BentoProgress,
  Checkbox,
  GlassCard,
  ManagerSheet,
  RoundAction,
  Switch,
  ToolLanding,
  ToolSidebar,
  ToolWindow,
} from '../src';

const markup = (node: ReactNode) => renderToStaticMarkup(node).replace(/\s+/g, ' ');

describe('Colour Worlds parts', () => {
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
