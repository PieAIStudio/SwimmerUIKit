import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { LanguageMenu, type LanguageMenuProps } from './LanguageMenu';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type Option = LanguageMenuProps['options'][number];

const routes: Option[] = [
  {
    id: 'en',
    label: 'English',
    meta: 'English',
    href: '/en',
    hrefLang: 'en',
    lang: 'en',
    dir: 'ltr',
    current: true,
  },
  {
    id: 'zh',
    label: '简体中文',
    meta: 'Chinese (Simplified)',
    href: '/zh',
    hrefLang: 'zh-Hans',
    lang: 'zh-Hans',
    dir: 'ltr',
    target: '_blank',
    rel: 'alternate',
  },
  {
    id: 'ar',
    label: 'العربية',
    meta: 'Arabic',
    href: '/ar',
    hrefLang: 'ar',
    lang: 'ar',
    dir: 'rtl',
  },
];

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
  vi.restoreAllMocks();
});

async function render(props: Partial<LanguageMenuProps> = {}): Promise<void> {
  await act(async () =>
    root.render(
      <LanguageMenu currentLabel="English" label="Choose a language" options={routes} {...props} />,
    ),
  );
}

function trigger(): HTMLButtonElement {
  return host.querySelector<HTMLButtonElement>('.game-ui-language-trigger')!;
}

function menu(): HTMLElement {
  return host.querySelector<HTMLElement>('[role="menu"]')!;
}

function options(): OptionElement[] {
  return [...host.querySelectorAll<OptionElement>('[role^="menuitem"]')];
}

type OptionElement = HTMLButtonElement | HTMLAnchorElement;

async function press(key: string): Promise<void> {
  const active = document.activeElement;
  expect(active).not.toBe(document.body);
  await act(async () =>
    active?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key })),
  );
}

async function openMenu(): Promise<void> {
  await act(async () => trigger().click());
  await expect.poll(() => document.activeElement?.getAttribute('role')).toMatch(/menuitem/);
  expect(document.activeElement?.textContent).toContain('English');
}

describe('LanguageMenu routed links', () => {
  it('keeps native link metadata and uses menu keyboard navigation', async () => {
    await render();
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    await openMenu();

    const links = options();
    expect(links).toHaveLength(3);
    expect(links[0]?.tagName).toBe('A');
    expect(links[0]?.getAttribute('href')).toBe('/en');
    expect(links[0]?.getAttribute('hreflang')).toBe('en');
    expect(links[0]?.getAttribute('lang')).toBe('en');
    expect(links[0]?.getAttribute('dir')).toBe('ltr');
    expect(links[0]?.getAttribute('aria-current')).toBe('page');
    expect(links[0]?.getAttribute('role')).toBe('menuitem');
    expect(links[0]?.getAttribute('aria-checked')).toBeNull();
    expect(links[1]?.getAttribute('target')).toBe('_blank');
    expect(links[1]?.getAttribute('rel')).toContain('alternate');
    expect(links[1]?.getAttribute('rel')).toContain('noopener');
    expect(links[2]?.getAttribute('dir')).toBe('rtl');

    await press('ArrowDown');
    expect(document.activeElement).toBe(links[1]);
    await press('End');
    expect(document.activeElement).toBe(links[2]);
    await press('Home');
    expect(document.activeElement).toBe(links[0]);
    await press('Escape');
    expect(host.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('does not cancel native link activation while notifying the host', async () => {
    const onSelect = vi.fn();
    await render({ onSelect });
    await openMenu();
    const link = options()[1] as HTMLAnchorElement;
    let preventedDuringCapture = false;
    link.addEventListener(
      'click',
      (event) => {
        preventedDuringCapture = event.defaultPrevented;
      },
      { capture: true, once: true },
    );
    // Stop the test fixture from navigating while checking that the component
    // itself did not cancel the native activation.
    document.addEventListener('click', (event) => event.preventDefault(), { once: true });
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    await act(async () => link.dispatchEvent(click));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('zh');
    expect(preventedDuringCapture).toBe(false);
    expect(host.querySelector('[role="menu"]')).toBeNull();
  });
});

describe('LanguageMenu callback mode', () => {
  it('keeps radio semantics, selection callbacks and focus return', async () => {
    const onSelect = vi.fn();
    await render({
      options: [
        { id: 'en', label: 'English', meta: 'EN' },
        { id: 'zh', label: '简体中文', meta: '中文' },
      ],
      onSelect,
    });
    await openMenu();
    const buttons = options();
    expect(buttons[0]?.getAttribute('role')).toBe('menuitemradio');
    expect(buttons[0]?.getAttribute('aria-checked')).toBe('true');
    await press('ArrowDown');
    expect(document.activeElement).toBe(buttons[1]);
    await act(async () => (buttons[1] as HTMLButtonElement).click());
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('zh');
    expect(host.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});

describe('LanguageMenu narrow route list', () => {
  it('keeps thirty route options scrollable and inside a phone viewport', async () => {
    await page.viewport(390, 844);
    const manyRoutes: Option[] = Array.from({ length: 30 }, (_, index) => ({
      id: `locale-${index}`,
      label: index === 0 ? 'English' : `Language ${index}`,
      meta: index === 0 ? 'English' : `Locale ${index}`,
      href: `/locale-${index}`,
      hrefLang: index === 0 ? 'en' : `x-locale-${index}`,
      lang: 'en',
      dir: 'ltr',
      current: index === 0,
    }));
    await render({ options: manyRoutes });
    await openMenu();
    const panel = menu();
    const bounds = panel.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(0);
    expect(bounds.right).toBeLessThanOrEqual(390);
    expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
    expect(options()).toHaveLength(30);
    await press('End');
    expect(document.activeElement).toBe(options()[29]);
  });
});
