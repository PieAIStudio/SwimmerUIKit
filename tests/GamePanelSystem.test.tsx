import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CollapsiblePanel } from '../src/containers/CollapsiblePanel/CollapsiblePanel';

import { Modal } from '../src/containers/Modal/Modal';

import { WindowPanel } from '../src/containers/WindowPanel/WindowPanel';

function compact(markup: string): string {
  return markup.replace(/\s+/g, ' ');
}

describe('CollapsiblePanel', () => {
  it('renders an accessible disclosure with heading, chevron, and wired region', () => {
    const html = compact(
      renderToStaticMarkup(
        <CollapsiblePanel title="Inventory">
          <p>12 items</p>
        </CollapsiblePanel>,
      ),
    );

    expect(html).toContain('game-ui-collapsible');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls=');
    expect(html).toContain('data-open="true"');
    expect(html).toContain('Inventory');
    expect(html).toContain('game-ui-collapsible-chevron');
  });

  it('respects defaultOpen=false and controlled open, and renders header actions', () => {
    const closed = compact(
      renderToStaticMarkup(
        <CollapsiblePanel defaultOpen={false} title="Quests">
          <p>hidden</p>
        </CollapsiblePanel>,
      ),
    );
    expect(closed).toContain('data-open="false"');
    expect(closed).toContain('aria-expanded="false"');

    const controlled = compact(
      renderToStaticMarkup(
        <CollapsiblePanel actions={<button type="button">pin</button>} open={false} title="Quests">
          <p>hidden</p>
        </CollapsiblePanel>,
      ),
    );
    expect(controlled).toContain('data-open="false"');
    expect(controlled).toContain('game-ui-collapsible-actions');
  });
});

describe('WindowPanel', () => {
  it('renders titlebar, minimize/maximize buttons, and body content', () => {
    const html = compact(
      renderToStaticMarkup(
        <WindowPanel title="Crafting">
          <p>Recipes</p>
        </WindowPanel>,
      ),
    );

    expect(html).toContain('data-window-state="normal"');
    expect(html).toContain('aria-label="Crafting"');
    expect(html).toContain('aria-label="Minimize"');
    expect(html).toContain('aria-label="Maximize"');
    expect(html).not.toContain('aria-label="Close"');
    expect(html).toContain('Recipes');
  });

  it('shows restore affordance when minimized and close button when onClose given', () => {
    const html = compact(
      renderToStaticMarkup(
        <WindowPanel
          defaultState="minimized"
          footer={<button type="button">Apply</button>}
          onClose={() => {}}
          title="Map"
        >
          <p>World map</p>
        </WindowPanel>,
      ),
    );

    expect(html).toContain('data-window-state="minimized"');
    expect(html).toContain('aria-label="Restore"');
    expect(html).toContain('aria-label="Close"');
    expect(html).toContain('game-ui-window-footer');
  });

  it('supports hiding window controls and localized labels', () => {
    const html = compact(
      renderToStaticMarkup(
        <WindowPanel
          allowMaximize={false}
          allowMinimize={false}
          labels={{ close: '关闭' }}
          onClose={() => {}}
          title="设置"
        >
          <p>content</p>
        </WindowPanel>,
      ),
    );

    expect(html).not.toContain('aria-label="Minimize"');
    expect(html).not.toContain('aria-label="Maximize"');
    expect(html).toContain('aria-label="关闭"');
  });
});

describe('Modal', () => {
  it('renders a native dialog with labelled title, close button, and footer', () => {
    const html = compact(
      renderToStaticMarkup(
        <Modal
          footer={<button type="button">OK</button>}
          onClose={() => {}}
          open
          size="sm"
          title="Confirm"
        >
          <p>Are you sure?</p>
        </Modal>,
      ),
    );

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
    const html = compact(
      renderToStaticMarkup(
        <Modal onClose={() => {}} open={false} title="Hidden">
          <p>expensive content</p>
        </Modal>,
      ),
    );

    expect(html).not.toContain('expensive content');
    expect(html).toContain('Hidden');
  });

  it('keeps closed body content mounted and inert when requested', () => {
    const html = compact(
      renderToStaticMarkup(
        <Modal keepMounted onClose={() => {}} open={false} title="Preserved">
          <input aria-label="unfinished answer" defaultValue="draft" />
        </Modal>,
      ),
    );

    expect(html).toContain('unfinished answer');
    expect(html).toContain('value="draft"');
    expect(html).toContain('inert');
  });

  it('defaults to a centered position and accepts a bottom-sheet variant', () => {
    const centered = compact(
      renderToStaticMarkup(
        <Modal onClose={() => {}} open title="Centered">
          <p>content</p>
        </Modal>,
      ),
    );
    expect(centered).toContain('data-position="center"');

    const sheet = compact(
      renderToStaticMarkup(
        <Modal onClose={() => {}} open position="bottom" title="Sheet">
          <p>content</p>
        </Modal>,
      ),
    );
    expect(sheet).toContain('data-position="bottom"');
  });
});
