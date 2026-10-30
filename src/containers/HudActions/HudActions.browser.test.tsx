import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { Badge, Button, HudActions, Panel } from '../../index';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const products = [
  {
    id: 'break',
    name: 'BREAK',
    action: 'Watch the build',
    status: 'In development',
    href: 'https://break.swiminai.com',
  },
  {
    id: 'university',
    name: 'University',
    action: 'Explore lessons',
    status: 'Listed',
    href: 'https://university.swiminai.com',
  },
  {
    id: 'directing',
    name: 'Directing',
    action: 'Explore filmmaking',
    status: 'Alpha',
    href: 'https://directing.swiminai.com',
  },
  {
    id: 'swimmerparty',
    name: 'SWIMMER PARTY',
    action: 'Meet the actors',
    status: 'Listed',
    href: 'https://swimmerparty.swiminai.com',
  },
] as const;

let host: HTMLDivElement;
let root: Root;
let viewport: { width: number; height: number };

beforeEach(() => {
  viewport = { width: innerWidth, height: innerHeight };
  host = document.createElement('div');
  host.style.width = 'calc(100% - 32px)';
  host.style.boxSizing = 'border-box';
  host.style.padding = '16px';
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  await page.viewport(viewport.width, viewport.height);
});

function entries() {
  return [...host.querySelectorAll<HTMLAnchorElement>('.official-product-entry[href]')];
}

async function render(): Promise<void> {
  await act(async () =>
    root.render(
      <Panel title="Product entries">
        <HudActions label="Product entries" style={{ gap: 12, alignItems: 'stretch' }}>
          {products.map((product) => (
            <Button
              aria-label={`${product.name} — ${product.action} — ${product.status}`}
              className="official-product-entry"
              data-product-id={product.id}
              dir="ltr"
              href={product.href}
              key={product.id}
              lang="en"
              style={{ flex: '1 1 240px', justifyContent: 'space-between', minWidth: 0 }}
            >
              <span style={{ display: 'grid', minWidth: 0, textAlign: 'start' }}>
                <strong>{product.name}</strong>
                <span>{product.action}</span>
              </span>
              <Badge tone={product.status === 'Listed' ? 'neutral' : 'warning'}>
                {product.status}
              </Badge>
            </Button>
          ))}
        </HudActions>
      </Panel>,
    ),
  );
}

describe('official product entry composition', () => {
  it('renders four native links in one labeled navigation region', async () => {
    await render();
    const nav = host.querySelector('nav[aria-label="Product entries"]')!;
    const links = entries();
    expect(links).toHaveLength(4);
    expect(links.map((link) => link.dataset.productId)).toEqual([
      'break',
      'university',
      'directing',
      'swimmerparty',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      products.map((product) => product.href),
    );
    expect(links.every((link) => link.getAttribute('lang') === 'en')).toBe(true);
    expect(links.every((link) => link.getAttribute('dir') === 'ltr')).toBe(true);
    expect(links.every((link) => link.getBoundingClientRect().height >= 44)).toBe(true);
    expect(nav.querySelectorAll('[data-game-ui-cta="true"]')).toHaveLength(0);
  });

  it('wraps the four entries without horizontal overflow on a phone', async () => {
    await page.viewport(390, 844);
    await render();
    const links = entries();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
    expect(new Set(links.map((link) => Math.round(link.getBoundingClientRect().top))).size).toBe(4);
    for (const link of links) {
      const bounds = link.getBoundingClientRect();
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(390);
      expect(bounds.height).toBeGreaterThanOrEqual(44);
    }
  });
});
