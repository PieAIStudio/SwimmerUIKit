import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { RadialLiquidMenu, type RadialLiquidMenuItem } from './RadialLiquidMenu';

const ITEMS: readonly RadialLiquidMenuItem[] = [
  { id: 'one', label: 'One', icon: <span>1</span> },
  { id: 'two', label: 'Two', icon: <span>2</span> },
  { id: 'three', label: 'Three', icon: <span>3</span> },
];

describe('RadialLiquidMenu', () => {
  it('renders a labelled trigger and an open liquid action arc', () => {
    const html = renderToStaticMarkup(
      <RadialLiquidMenu
        defaultOpen
        items={ITEMS}
        label="Quick actions"
        theme="blossom"
        trigger={<span>+</span>}
        triggerLabel="Open quick actions"
      />,
    );
    expect(html.match(/<button\b/g)).toHaveLength(4);
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-label="Quick actions"');
    expect(html).toContain('data-v12-theme="blossom"');
    expect(html).toContain('game-ui-v12-radial-menu__pill');
  });

  it('keeps a closed menu out of the action tab order', () => {
    const html = renderToStaticMarkup(
      <RadialLiquidMenu
        items={ITEMS}
        label="Quick actions"
        trigger={<span>+</span>}
        triggerLabel="Open quick actions"
      />,
    );
    expect(html.match(/<button\b/g)).toHaveLength(1);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('game-ui-v12-radial-menu__items');
  });
});
