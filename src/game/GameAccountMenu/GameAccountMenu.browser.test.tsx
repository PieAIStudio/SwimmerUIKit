import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { contrastRatio } from '../../../scripts/lib/contrast.mjs';
import { GAME_UI_STYLES } from '../../tokens/styles';
// Public path: @pieai/swimmer-ui-kit/liquid-presence (the repo's source equivalent).
import {
  GameAccountMenu,
  type GameAccountMenuProps,
  type GameAccountProduct,
} from '../../liquid-presence';
import { resetLiquidGooeyBudgetForTests } from '../../liquid/budget';
import '../../styles.css';
import '../../presence/presence.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const labels: GameAccountMenuProps['labels'] = {
  trigger: '账号：小鱼',
  siteTab: '小鱼的作品',
  productsTab: '全部产品',
  accountTab: '账号',
  current: '当前',
  manage: '管理账号与安全',
  signOut: '退出登录',
};
const products: GameAccountProduct[] = [
  {
    id: 'party',
    name: 'SwimmerParty',
    description: '派对游戏',
    href: 'https://party.example/',
    current: true,
  },
  { id: 'study', name: 'SwimmerStudy', href: 'https://study.example/' },
];

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  resetLiquidGooeyBudgetForTests();
  vi.restoreAllMocks();
});

function menu(overrides: Partial<GameAccountMenuProps> = {}): GameAccountMenuProps {
  return {
    user: { name: '小鱼', email: 'xiaoyu@example.com' },
    labels,
    site: <p>小鱼的站内内容</p>,
    products,
    accountHref: 'https://accounts.example/security',
    onSignOut: vi.fn(),
    ...overrides,
  };
}

async function render(props: GameAccountMenuProps): Promise<void> {
  await act(async () =>
    root.render(
      <StrictMode>
        <GameAccountMenu {...props} />
      </StrictMode>,
    ),
  );
}

function trigger(): HTMLButtonElement {
  return host.querySelector<HTMLButtonElement>('.game-ui-account-menu-trigger')!;
}

async function openPanel(): Promise<HTMLElement> {
  await act(async () => trigger().click());
  await expect.poll(() => document.activeElement?.textContent).toBe('小鱼');
  return document.querySelector<HTMLElement>('.game-ui-liquid-popover')!;
}

async function pressEscape(): Promise<void> {
  await act(async () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    ),
  );
  // Focus returns to the trigger on the next frame; wait so a reopen cannot race it.
  await expect.poll(() => document.activeElement).toBe(trigger());
}

function tabs(): HTMLButtonElement[] {
  return [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
}

/** The tab's visible label; the selection mark is a decorative check. */
function tabLabels(): (string | null | undefined)[] {
  return tabs().map((tab) => tab.textContent?.replace('✓', ''));
}

describe('GameAccountMenu trigger', () => {
  it('shows the avatar and a short name, with the full label as the accessible name', async () => {
    await render(menu({ user: { name: '一二三四五六七八九十十一十二十三' } }));
    expect(trigger().getAttribute('aria-label')).toBe(labels.trigger);
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().querySelector('.game-ui-account-menu-trigger-name')?.textContent).toBe(
      '一二三四五六七八九十十一…',
    );
    expect(trigger().querySelector('.game-ui-avatar')).not.toBeNull();
    expect(trigger().getAttribute('data-game-ui-size')).toBe('sm');
  });

  it('opens on click, focuses the panel title and names the dialog after it', async () => {
    await render(menu());
    const panel = await openPanel();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(panel.getAttribute('role')).toBe('dialog');
    const title = document.getElementById(panel.getAttribute('aria-labelledby')!);
    expect(title?.textContent).toBe('小鱼');
    expect(document.activeElement).toBe(title);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    await render(menu());
    await openPanel();
    await pressEscape();
    expect(document.querySelector('.game-ui-liquid-popover')).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    await expect.poll(() => document.activeElement).toBe(trigger());
  });
});

describe('GameAccountMenu panel', () => {
  it('keeps every tab wired to a real tabpanel and starts on the site tab', async () => {
    await render(menu());
    await openPanel();
    expect(tabLabels()).toEqual(['小鱼的作品', '全部产品', '账号']);
    expect(tabs()[0]!.getAttribute('aria-selected')).toBe('true');
    for (const tab of tabs()) {
      const panel = document.getElementById(tab.getAttribute('aria-controls')!);
      expect(panel?.getAttribute('role')).toBe('tabpanel');
      expect(panel?.getAttribute('aria-labelledby')).toBe(tab.id);
    }
    const site = document.getElementById(tabs()[0]!.getAttribute('aria-controls')!)!;
    expect(site.hidden).toBe(false);
    expect(site.textContent).toContain('小鱼的站内内容');
  });

  it('omits the site and products tabs when they are absent, leaving only the account content', async () => {
    await render(menu({ site: undefined, products: [] }));
    await openPanel();
    expect(document.querySelector('[role="tablist"]')).toBeNull();
    expect(document.querySelectorAll('[role="tab"]')).toHaveLength(0);
    expect(document.querySelectorAll('[role="tabpanel"]')).toHaveLength(0);
    expect(document.body.textContent).toContain(labels.manage);
  });

  it('keeps only the site and account tabs when there is no product list', async () => {
    await render(menu({ products: [] }));
    await openPanel();
    expect(tabLabels()).toEqual(['小鱼的作品', '账号']);
  });

  it('marks the current product as plain text and links the others', async () => {
    await render(menu());
    await openPanel();
    await act(async () => tabs()[1]!.click());
    const rows = [...document.querySelectorAll<HTMLElement>('.game-ui-account-menu-product')];
    expect(rows).toHaveLength(2);
    const current = rows[0]!;
    expect(current.querySelector('a')).toBeNull();
    expect(current.querySelector('[aria-current="true"]')?.textContent).toContain('当前');
    expect(current.textContent).toContain('SwimmerParty');
    const link = rows[1]!.querySelector<HTMLAnchorElement>('a')!;
    expect(link.getAttribute('href')).toBe('https://study.example/');
    expect(link.textContent).toContain('SwimmerStudy');
    expect(rows[1]!.querySelector('[aria-current]')).toBeNull();
  });

  it('keeps the chosen tab while open and resets it when reopened', async () => {
    await render(menu());
    await openPanel();
    await act(async () => tabs()[2]!.click());
    expect(tabs()[2]!.getAttribute('aria-selected')).toBe('true');
    await pressEscape();
    await openPanel();
    expect(tabs()[0]!.getAttribute('aria-selected')).toBe('true');
  });

  it('starts on defaultTab when that tab exists', async () => {
    await render(menu({ defaultTab: 'account' }));
    await openPanel();
    expect(tabs()[2]!.getAttribute('aria-selected')).toBe('true');
  });

  it('renders account actions as secondary buttons with the account link', async () => {
    await render(menu({ site: undefined, products: [] }));
    await openPanel();
    const manage = [...document.querySelectorAll<HTMLAnchorElement>('a')].find(
      (anchor) => anchor.textContent === labels.manage,
    );
    expect(manage?.getAttribute('href')).toBe('https://accounts.example/security');
    expect(manage?.className).toContain('game-ui-button--secondary');
  });
});

describe('GameAccountMenu sign-out', () => {
  async function accountSignOut(): Promise<HTMLButtonElement> {
    await openPanel();
    return [...document.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) => button.textContent === labels.signOut,
    )!;
  }

  it('calls the product handler once and never disables the button', async () => {
    const onSignOut = vi.fn();
    await render(menu({ onSignOut }));
    const button = await accountSignOut();
    await act(async () => button.click());
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(false);
  });

  it('shows the pending state and ignores clicks while the product is signing out', async () => {
    const onSignOut = vi.fn();
    await render(menu({ onSignOut, signingOut: true }));
    const button = await accountSignOut();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.disabled).toBe(false);
    await act(async () => button.click());
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it('blocks a second click that lands before the pending state renders', async () => {
    const onSignOut = vi.fn(() => new Promise<void>(() => {}));
    await render(menu({ onSignOut }));
    const button = await accountSignOut();
    await act(async () => {
      button.click();
      button.click();
    });
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});

describe('GameAccountMenu avatar', () => {
  it('renders only an https image and falls back to initials otherwise', async () => {
    await render(menu({ user: { name: '小鱼', avatarUrl: 'javascript:alert(1)' } }));
    expect(trigger().querySelector('img')).toBeNull();
    expect(trigger().querySelector('.game-ui-avatar-initials')?.textContent).toBe('小');
    await render(menu({ user: { name: '小鱼', avatarUrl: 'http://cdn.example/a.png' } }));
    expect(trigger().querySelector('img')).toBeNull();
    await render(menu({ user: { name: '小鱼', avatarUrl: 'https://cdn.example/a.png' } }));
    expect(trigger().querySelector('img')?.getAttribute('src')).toBe('https://cdn.example/a.png');
  });
});

describe('GameAccountMenu tabs layout and contrast', () => {
  it('keeps the three tabs on one row at 360 px, equal in width, with truncating labels', async () => {
    const original = { width: innerWidth, height: innerHeight };
    await page.viewport(360, 720);
    try {
      await render(
        menu({
          labels: {
            ...labels,
            siteTab: 'This site',
            productsTab: 'All products',
            accountTab: 'Account',
          },
        }),
      );
      await openPanel();
      const rects = tabs().map((tab) => tab.getBoundingClientRect());
      expect(rects).toHaveLength(3);
      expect(new Set(rects.map((rect) => Math.round(rect.top))).size).toBe(1);
      const widths = rects.map((rect) => rect.width);
      expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
      for (const tab of tabs()) {
        const label = tab.querySelector<HTMLElement>('.game-ui-tab-label')!;
        const css = getComputedStyle(label);
        expect(css.whiteSpace).toBe('nowrap');
        expect(css.textOverflow).toBe('ellipsis');
      }
      // Only the selected tab reserves room for its check mark.
      const unselected = tabs().find((tab) => tab.getAttribute('aria-selected') === 'false')!;
      expect(getComputedStyle(unselected.querySelector('.game-ui-selection-mark')!).display).toBe(
        'none',
      );
    } finally {
      await page.viewport(original.width, original.height);
    }
  });

  it('keeps the selected tab label readable on its fill in every built-in style and mode', async () => {
    const context = document.createElement('canvas').getContext('2d')!;
    // Any computed colour, including color(srgb ...), as 8-bit RGB.
    const rgb = (value: string) => {
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
    };
    await render(menu());
    for (const style of GAME_UI_STYLES)
      for (const theme of ['light', 'dark']) {
        host.setAttribute('data-game-ui-style', style);
        host.setAttribute('data-game-ui-theme', theme);
        await openPanel();
        const selected = document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')!;
        const foreground = rgb(getComputedStyle(selected).color);
        // The painted face is the droplet path; the tab's own background is transparent.
        const fill = rgb(getComputedStyle(selected.querySelector('.game-ui-droplet path')!).fill);
        expect(contrastRatio(foreground, fill), `${style} ${theme}`).toBeGreaterThanOrEqual(4.5);
        await pressEscape();
      }
  });
});
