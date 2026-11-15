import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { SpriteIcon, spriteIconFromManifest } from '../../tool-worlds';
import '../../styles.css';
import filesAct96 from './fixtures/files/act-96.webp';
import filesAct192 from './fixtures/files/act-192.webp';
import filesManifest from './fixtures/files/manifest.json';
import filesStill96 from './fixtures/files/still-96.webp';
import filesStill192 from './fixtures/files/still-192.webp';
import filesStill512 from './fixtures/files/still-512.webp';
import type { SpriteIconSource } from './types';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const FILES_ASSETS: Record<string, string> = {
  'still-96.webp': filesStill96,
  'still-192.webp': filesStill192,
  'still-512.webp': filesStill512,
  'act-96.webp': filesAct96,
  'act-192.webp': filesAct192,
};

const FILES_ICON: SpriteIconSource = spriteIconFromManifest(
  filesManifest,
  (file) => FILES_ASSETS[file] ?? file,
);

function makeStateClipsSource(): SpriteIconSource {
  const tiers = (name: string) => ({
    96: `/${name}-96.webp`,
    192: `/${name}-192.webp`,
    512: `/${name}-512.webp`,
  });
  return {
    still: tiers('still'),
    clips: {
      idle: {
        sheets: tiers('idle'),
        frames: 40,
        fps: 10,
        cols: 7,
        rows: 6,
        loop: true,
        seconds: 4,
      },
      hover: { sheets: tiers('hover'), frames: 18, fps: 15, cols: 5, rows: 4, loop: false },
      syncing: { sheets: tiers('syncing'), frames: 21, fps: 15, cols: 5, rows: 5, loop: false },
      done: { sheets: tiers('done'), frames: 15, fps: 15, cols: 4, rows: 4, loop: false },
      problem: { sheets: tiers('problem'), frames: 21, fps: 15, cols: 5, rows: 5, loop: false },
      act: { sheets: tiers('act'), frames: 21, fps: 15, cols: 5, rows: 5, loop: false },
    },
  };
}

let corner: HTMLDivElement;
let host: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  corner = document.createElement('div');
  corner.style.cssText = 'position:fixed;top:0;left:0;width:8px;height:8px;';
  document.body.append(corner);
  await userEvent.hover(corner);

  host = document.createElement('div');
  host.style.marginTop = '40px';
  document.body.append(host);
  root = createRoot(host);
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  corner.remove();
  vi.restoreAllMocks();
});

describe('SpriteIcon in Chromium', () => {
  it('picks 96 / 192 / 512 tiers from size and DPR and updates when resized', async () => {
    await act(async () =>
      root.render(
        <div>
          <SpriteIcon data-test="a" dpr={1} icon={FILES_ICON} size={28} />
          <SpriteIcon data-test="b" dpr={2} icon={FILES_ICON} size={64} />
          <SpriteIcon data-test="c" dpr={2} icon={FILES_ICON} size={128} />
        </div>,
      ),
    );

    const a = host.querySelector<HTMLElement>('[data-test="a"]')!;
    const b = host.querySelector<HTMLElement>('[data-test="b"]')!;
    const c = host.querySelector<HTMLElement>('[data-test="c"]')!;

    expect(a.dataset.spriteTier).toBe('96');
    expect(b.dataset.spriteTier).toBe('192');
    expect(c.dataset.spriteTier).toBe('512');
    expect(
      a.querySelector<HTMLElement>('.game-ui-sprite-icon-frame')!.style.backgroundImage,
    ).toContain('still-96');
    expect(
      b.querySelector<HTMLElement>('.game-ui-sprite-icon-frame')!.style.backgroundImage,
    ).toContain('still-192');
    expect(
      c.querySelector<HTMLElement>('.game-ui-sprite-icon-frame')!.style.backgroundImage,
    ).toContain('still-512');

    // Resizing via CSS triggers ResizeObserver and upgrades tier from 96 -> 192 at DPR 1.
    await act(async () => {
      a.style.width = '128px';
      a.style.height = '128px';
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(a.dataset.spriteTier).toBe('192');
  });

  it('plays act clip once on hover, focus and selection, and ends cleanly on the rest still', async () => {
    const onClipEnd = vi.fn();
    await act(async () =>
      root.render(
        <button type="button">
          <SpriteIcon dpr={1} icon={FILES_ICON} onClipEnd={onClipEnd} selected={false} size={64} />
          <span>Files</span>
        </button>,
      ),
    );

    const button = host.querySelector('button')!;
    const icon = host.querySelector<HTMLElement>('.game-ui-sprite-icon')!;
    const frame = host.querySelector<HTMLElement>('.game-ui-sprite-icon-frame')!;

    expect(icon.dataset.spriteState).toBe('rest');
    expect(frame.style.animationName).toBe('none');
    expect(frame.style.backgroundImage).toContain('still-96');

    // Hover on the enclosing button triggers the act clip with steps() keyframes.
    await act(async () => {
      button.dispatchEvent(new PointerEvent('pointerenter', { pointerType: 'mouse' }));
    });
    expect(icon.dataset.spriteState).toBe('act');
    expect(frame.style.backgroundImage).toContain('act-96');
    expect(frame.style.backgroundSize).toBe('500% 500%');
    expect(frame.style.animationName).toBe('swimmer-sprite-c5-r5-f21');
    expect(frame.style.animationDuration).toBe('1.4s');
    const styleSheet = document.head.querySelector(
      'style[data-swimmer-sprite-keyframes]',
    )?.textContent;
    expect(styleSheet).toContain('steps(5, jump-none)');

    await act(async () => {
      frame.dispatchEvent(new Event('animationend', { bubbles: true }));
    });
    expect(onClipEnd).toHaveBeenCalledWith('act');
    expect(icon.dataset.spriteState).toBe('rest');
    expect(frame.style.animationName).toBe('none');
    expect(frame.style.backgroundImage).toContain('still-96');

    // Keyboard focus plays once and settles back to rest.
    await act(async () => {
      button.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    });
    expect(icon.dataset.spriteState).toBe('act');
    await act(async () => {
      frame.dispatchEvent(new Event('animationend', { bubbles: true }));
    });
    expect(icon.dataset.spriteState).toBe('rest');

    // Selection false -> true plays once and settles on rest.
    await act(async () =>
      root.render(
        <button type="button">
          <SpriteIcon dpr={1} icon={FILES_ICON} onClipEnd={onClipEnd} selected={true} size={64} />
          <span>Files</span>
        </button>,
      ),
    );
    expect(icon.dataset.spriteState).toBe('act');
    await act(async () => {
      frame.dispatchEvent(new Event('animationend', { bubbles: true }));
    });
    expect(icon.dataset.spriteState).toBe('rest');
  });

  it('supports hero-only idle and all named state clips (hover, syncing, done, problem, act)', async () => {
    const heroIcon = makeStateClipsSource();
    await act(async () =>
      root.render(<SpriteIcon dpr={1} hero={false} icon={heroIcon} size={64} />),
    );
    const nonHero = host.querySelector<HTMLElement>('.game-ui-sprite-icon')!;
    expect(nonHero.dataset.spriteState).toBe('rest');

    await act(async () => root.render(<SpriteIcon dpr={1} hero icon={heroIcon} size={64} />));
    expect(nonHero.dataset.spriteState).toBe('idle');
    const frame = host.querySelector<HTMLElement>('.game-ui-sprite-icon-frame')!;
    expect(frame.style.animationIterationCount).toBe('infinite');

    for (const clip of ['hover', 'syncing', 'done', 'problem', 'act'] as const) {
      await act(async () =>
        root.render(<SpriteIcon dpr={1} hero icon={heroIcon} size={64} state={clip} />),
      );
      expect(nonHero.dataset.spriteState, clip).toBe(clip);
      expect(frame.style.backgroundImage, clip).toContain(`/${clip}-96.webp`);
      await act(async () => {
        frame.dispatchEvent(new Event('animationend', { bubbles: true }));
      });
      expect(nonHero.dataset.spriteState, `${clip} ends on rest`).toBe('rest');
      expect(frame.style.backgroundImage, `${clip} rest still`).toContain('/still-96.webp');
    }
  });

  it('shows only rest still under prefers-reduced-motion and clears active playback immediately', async () => {
    let matches = true;
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const originalMatchMedia = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return {
          matches,
          media: query,
          onchange: null,
          addEventListener: (_: string, cb: EventListenerOrEventListenerObject) => {
            if (typeof cb === 'function') listeners.add(cb as (event: MediaQueryListEvent) => void);
          },
          removeEventListener: (_: string, cb: EventListenerOrEventListenerObject) => {
            if (typeof cb === 'function')
              listeners.delete(cb as (event: MediaQueryListEvent) => void);
          },
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true,
        } as unknown as MediaQueryList;
      }
      return originalMatchMedia(query);
    });

    const heroIcon = makeStateClipsSource();
    await act(async () =>
      root.render(<SpriteIcon dpr={1} hero icon={heroIcon} size={64} state="syncing" />),
    );
    const icon = host.querySelector<HTMLElement>('.game-ui-sprite-icon')!;
    const frame = host.querySelector<HTMLElement>('.game-ui-sprite-icon-frame')!;

    expect(icon.dataset.spriteReducedMotion).toBe('true');
    expect(icon.dataset.spriteState).toBe('rest');
    expect(frame.style.animationName).toBe('none');
    expect(frame.style.backgroundImage).toContain('/still-96.webp');

    // Enabling motion mid-session allows syncing playback; re-enabling reduced motion stops it.
    matches = false;
    await act(async () => {
      for (const listener of listeners) {
        listener({ matches: false } as MediaQueryListEvent);
      }
    });
    expect(icon.dataset.spriteReducedMotion).toBeUndefined();
    expect(icon.dataset.spriteState).toBe('syncing');

    matches = true;
    await act(async () => {
      for (const listener of listeners) {
        listener({ matches: true } as MediaQueryListEvent);
      }
    });
    expect(icon.dataset.spriteReducedMotion).toBe('true');
    expect(icon.dataset.spriteState).toBe('rest');
    expect(frame.style.animationName).toBe('none');
    expect(frame.style.backgroundImage).toContain('/still-96.webp');
  });

  it('falls back to 192 clip sheets at 512 tier, auto-idles role=hero, and restarts same-grid clip/icon transitions', async () => {
    await act(async () =>
      root.render(<SpriteIcon dpr={2} icon={FILES_ICON} size={128} state="rest" />),
    );
    const icon = host.querySelector<HTMLElement>('.game-ui-sprite-icon')!;
    const frame = host.querySelector<HTMLElement>('.game-ui-sprite-icon-frame')!;
    expect(icon.dataset.spriteTier).toBe('512');
    expect(frame.style.backgroundImage).toContain('still-512');

    await act(async () =>
      root.render(<SpriteIcon dpr={2} icon={FILES_ICON} size={128} state="act" />),
    );
    expect(icon.dataset.spriteState).toBe('act');
    expect(icon.dataset.spriteTier).toBe('192');
    expect(frame.style.backgroundImage).toContain('act-192');
    await act(async () => {
      frame.dispatchEvent(new Event('animationend', { bubbles: true }));
    });
    expect(icon.dataset.spriteState).toBe('rest');
    expect(icon.dataset.spriteTier).toBe('512');
    expect(frame.style.backgroundImage).toContain('still-512');

    const heroIcon: SpriteIconSource = { role: 'hero', ...makeStateClipsSource() };
    await act(async () => root.render(<SpriteIcon dpr={1} icon={heroIcon} size={64} />));
    expect(icon.dataset.spriteHero).toBe('true');
    expect(icon.dataset.spriteState).toBe('idle');

    await act(async () =>
      root.render(<SpriteIcon dpr={1} icon={heroIcon} size={64} state="syncing" />),
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 120));
    });
    await act(async () =>
      root.render(<SpriteIcon dpr={1} icon={heroIcon} size={64} state="problem" />),
    );
    expect(icon.dataset.spriteState).toBe('problem');
    expect(frame.style.backgroundImage).toContain('/problem-96.webp');
    const activeAnim = frame.getAnimations()[0];
    expect(activeAnim).toBeDefined();
    expect(Number(activeAnim?.currentTime ?? 999)).toBeLessThan(80);

    const iconA: SpriteIconSource = {
      role: 'ordinary',
      still: { 96: '/a-still-96.webp' },
      clips: { act: { sheets: { 96: '/a-act-96.webp' }, frames: 21, fps: 15, cols: 5, rows: 5 } },
    };
    const iconB: SpriteIconSource = {
      role: 'ordinary',
      still: { 96: '/b-still-96.webp' },
      clips: { act: { sheets: { 96: '/b-act-96.webp' }, frames: 21, fps: 15, cols: 5, rows: 5 } },
    };
    await act(async () => root.render(<SpriteIcon dpr={1} icon={iconA} size={64} state="act" />));
    await act(async () => {
      frame.dispatchEvent(new Event('animationend', { bubbles: true }));
    });
    expect(icon.dataset.spriteState).toBe('rest');
    await act(async () => root.render(<SpriteIcon dpr={1} icon={iconB} size={64} state="act" />));
    expect(icon.dataset.spriteState).toBe('act');
    expect(frame.style.backgroundImage).toContain('/b-act-96.webp');
  });
});
