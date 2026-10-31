import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ToolSidebar, type ToolSidebarItem } from './ToolSidebar';

const icon = <svg aria-hidden="true" />;

function item(overrides: Partial<ToolSidebarItem> & { id: string }): ToolSidebarItem {
  return { icon, label: overrides.id, ...overrides };
}

describe('ToolSidebar', () => {
  it('renders link items as native links and marks only the selected one current', () => {
    const html = renderToStaticMarkup(
      <ToolSidebar
        items={[
          item({ id: 'home', href: '/home', selected: true }),
          item({ id: 'files', href: '/files' }),
        ]}
      />,
    );
    expect(html).toContain('href="/home"');
    expect(html).toContain('href="/files"');
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toMatch(/<a[^>]*aria-current="page"[^>]*data-tool-sidebar-item="home"/);
    // The selected item's icon sits in a gem; the others stay bare.
    expect(html.match(/class="game-ui-gem /g)).toHaveLength(1);
  });

  it('does not render a disabled link item as a live link', () => {
    // `disabled` is meaningless on <a>: the old output kept href, so the
    // "disabled" item still navigated on click and stayed in the tab order.
    const html = renderToStaticMarkup(
      <ToolSidebar items={[item({ id: 'billing', href: '/billing', disabled: true })]} />,
    );
    expect(html).not.toContain('href="/billing"');
    expect(html).not.toMatch(/<a[\s>]/);
    const button = /<button[^>]*>/.exec(html)?.[0] ?? '';
    expect(button).toContain('data-tool-sidebar-item="billing"');
    expect(button).toContain('disabled=""');
  });

  it('renders callback items as buttons and shows badges, app name and footer', () => {
    const html = renderToStaticMarkup(
      <ToolSidebar
        appName="MailWard"
        footer={<span>v1</span>}
        items={[item({ id: 'inbox', badge: 3 }), item({ id: 'spam', disabled: true })]}
        mode="rail"
        navLabel="Mail navigation"
      />,
    );
    expect(html).toContain('data-tool-sidebar-mode="rail"');
    expect(html).toContain('aria-label="Mail navigation"');
    expect(html).toContain('game-ui-tool-sidebar-app-name">MailWard<');
    expect(html).toContain('game-ui-tool-sidebar-badge">3<');
    expect(html).toContain('game-ui-tool-sidebar-footer"><span>v1</span>');
    expect(html.match(/<button/g)).toHaveLength(2);
    expect(html).toMatch(/<button[^>]*data-tool-sidebar-item="spam"[^>]*disabled=""/);
  });

  it('omits the app header when neither name nor icon is given', () => {
    const html = renderToStaticMarkup(<ToolSidebar />);
    expect(html).not.toContain('game-ui-tool-sidebar-app');
    expect(html).toContain('aria-label="Tool navigation"');
    expect(html).not.toContain('game-ui-tool-sidebar-footer');
  });
});
