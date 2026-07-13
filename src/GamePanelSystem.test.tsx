import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GameCollapsiblePanel, GameModal, GameWindowPanel } from './GamePanelSystem';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('GameCollapsiblePanel', () => {
  it('renders an accessible disclosure with heading, chevron, and wired region', () => {
    const html = compact(renderToStaticMarkup(
      <GameCollapsiblePanel title="Inventory">
        <p>12 items</p>
      </GameCollapsiblePanel>,
    ));

    expect(html).toContain('game-ui-collapsible');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls=');
    expect(html).toContain('data-open="true"');
    expect(html).toContain('Inventory');
    expect(html).toContain('game-ui-collapsible-chevron');
  });

  it('respects defaultOpen=false and controlled open, and renders header actions', () => {
    const closed = compact(renderToStaticMarkup(
      <GameCollapsiblePanel defaultOpen={false} title="Quests">
        <p>hidden</p>
      </GameCollapsiblePanel>,
    ));
    expect(closed).toContain('data-open="false"');
    expect(closed).toContain('aria-expanded="false"');

    const controlled = compact(renderToStaticMarkup(
      <GameCollapsiblePanel
        actions={<button type="button">pin</button>}
        open={false}
        title="Quests"
      >
        <p>hidden</p>
      </GameCollapsiblePanel>,
    ));
    expect(controlled).toContain('data-open="false"');
    expect(controlled).toContain('game-ui-collapsible-actions');
  });
});

describe('GameWindowPanel', () => {
  it('renders titlebar, minimize/maximize buttons, and body content', () => {
    const html = compact(renderToStaticMarkup(
      <GameWindowPanel title="Crafting">
        <p>Recipes</p>
      </GameWindowPanel>,
    ));

    expect(html).toContain('data-window-state="normal"');
    expect(html).toContain('aria-label="Crafting"');
    expect(html).toContain('aria-label="Minimize"');
    expect(html).toContain('aria-label="Maximize"');
    expect(html).not.toContain('aria-label="Close"');
    expect(html).toContain('Recipes');
  });

  it('shows restore affordance when minimized and close button when onClose given', () => {
    const html = compact(renderToStaticMarkup(
      <GameWindowPanel
        defaultState="minimized"
        footer={<button type="button">Apply</button>}
        onClose={() => {}}
        title="Map"
      >
        <p>World map</p>
      </GameWindowPanel>,
    ));

    expect(html).toContain('data-window-state="minimized"');
    expect(html).toContain('aria-label="Restore"');
    expect(html).toContain('aria-label="Close"');
    expect(html).toContain('game-ui-window-footer');
  });

  it('supports hiding window controls and localized labels', () => {
    const html = compact(renderToStaticMarkup(
      <GameWindowPanel
        allowMaximize={false}
        allowMinimize={false}
        labels={{ close: '关闭' }}
        onClose={() => {}}
        title="设置"
      >
        <p>content</p>
      </GameWindowPanel>,
    ));

    expect(html).not.toContain('aria-label="Minimize"');
    expect(html).not.toContain('aria-label="Maximize"');
    expect(html).toContain('aria-label="关闭"');
  });
});

describe('GameModal', () => {
  it('renders a native dialog with labelled title, close button, and footer', () => {
    const html = compact(renderToStaticMarkup(
      <GameModal
        footer={<button type="button">OK</button>}
        onClose={() => {}}
        open
        size="sm"
        title="Confirm"
      >
        <p>Are you sure?</p>
      </GameModal>,
    ));

    expect(html).toContain('<dialog');
    expect(html).toContain('game-ui-modal');
    expect(html).toContain('data-size="sm"');
    expect(html).toContain('aria-labelledby=');
    expect(html).toContain('Confirm');
    expect(html).toContain('aria-label="Close"');
    expect(html).toContain('game-ui-modal-footer');
    expect(html).toContain('Are you sure?');
  });

  it('does not render body content while closed', () => {
    const html = compact(renderToStaticMarkup(
      <GameModal onClose={() => {}} open={false} title="Hidden">
        <p>expensive content</p>
      </GameModal>,
    ));

    expect(html).not.toContain('expensive content');
    expect(html).toContain('Hidden');
  });

  it('defaults to a centered position and accepts a bottom-sheet variant', () => {
    const centered = compact(renderToStaticMarkup(
      <GameModal onClose={() => {}} open title="Centered">
        <p>content</p>
      </GameModal>,
    ));
    expect(centered).toContain('data-position="center"');

    const sheet = compact(renderToStaticMarkup(
      <GameModal onClose={() => {}} open position="bottom" title="Sheet">
        <p>content</p>
      </GameModal>,
    ));
    expect(sheet).toContain('data-position="bottom"');
  });
});
