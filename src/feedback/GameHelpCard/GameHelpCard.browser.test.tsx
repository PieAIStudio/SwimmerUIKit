import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { contrastRatio } from '../../../scripts/lib/contrast.mjs';
import { GameHelpCard, type GameHelpCardTopic, type GameHelpMedia } from './GameHelpCard';
import { GameButton } from '../../controls/GameButton/GameButton';
import helpDemoWebm from './assets/help-demo.webm';
import helpDemoMp4 from './assets/help-demo.mp4';
import helpDemoPoster from './assets/help-demo-poster.png';
import helpDemoStill from './assets/help-demo-still.png';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let host: HTMLElement | undefined;

afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = undefined;
  host = undefined;
  vi.restoreAllMocks();
});

async function mount(ui: ReactNode, dialog = false): Promise<HTMLElement> {
  host = document.createElement(dialog ? 'dialog' : 'div');
  document.body.append(host);
  root = createRoot(host);
  if (host instanceof HTMLDialogElement) host.showModal();
  await act(async () => root!.render(ui));
  return host;
}

const card = () => document.querySelector<HTMLElement>('[role="dialog"]');
/** Any computed colour, including color(srgb ...), as 8-bit RGB. */
const rgb = (value: string): number[] => {
  const context = document.createElement('canvas').getContext('2d')!;
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
};
/** The title's ink against the droplet face that actually paints the card. */
function expectReadable(frame: HTMLElement, name: string) {
  const title = frame.querySelector<HTMLElement>('.game-ui-help-card-title')!;
  const face = frame.querySelector<SVGPathElement>('.game-ui-droplet path')!;
  expect(
    contrastRatio(rgb(getComputedStyle(title).color), rgb(getComputedStyle(face).fill)),
    name,
  ).toBeGreaterThanOrEqual(4.5);
}
// Floating UI's hover and dismiss timers update React state, so every user
// action and every wait runs inside act. Assertions read the settled DOM.
const settle = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));
const hover = (element: Element) => act(() => userEvent.hover(element));
const tab = () => act(() => userEvent.tab());
const press = (key: string) => act(() => userEvent.keyboard(key));
const videoMedia: GameHelpMedia = {
  kind: 'video',
  sources: [
    { src: helpDemoWebm, type: 'video/webm' },
    { src: helpDemoMp4, type: 'video/mp4' },
  ],
  poster: helpDemoPoster,
  alt: '点一下保存按钮，右上角出现对勾。',
  width: 480,
  height: 270,
};
const save: GameHelpCardTopic = {
  id: 'save',
  label: '保存',
  title: '点一下就保存',
  body: '作品会保存在这台设备上。\n之后可以随时继续编辑。',
  media: videoMedia,
};
const restore: GameHelpCardTopic = {
  id: 'restore',
  label: '恢复',
  title: '从备份恢复',
  body: '选择一个备份后恢复。',
  media: { kind: 'image', src: helpDemoStill, alt: '按下的瞬间', width: 480, height: 270 },
};
const share: GameHelpCardTopic = {
  id: 'share',
  label: '分享',
  title: '分享前先检查',
  body: '分享的是当前版本。',
};

it('does not request media or open the card before the first open', async () => {
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[save]}>
      <GameButton>怎么用</GameButton>
    </GameHelpCard>,
  );
  // Asset imports are module requests; only the media elements fetch the clip.
  const mediaRequested = () =>
    performance
      .getEntriesByType('resource')
      .some(
        (entry) =>
          (entry as PerformanceResourceTiming).initiatorType === 'video' &&
          entry.name.includes('help-demo'),
      );
  expect(card()).toBeNull();
  expect(container.querySelector('video')).toBeNull();
  expect(mediaRequested()).toBe(false);
  await hover(container.querySelector('button')!);
  await settle(600);
  expect(card()).not.toBeNull();
  // The clip is fetched after the element mounts; poll the timeline, not React.
  await expect.poll(mediaRequested, { timeout: 3000 }).toBe(true);
});

it('opens on hover only after the intent delay, and closes after the pointer leaves', async () => {
  const container = await mount(
    <>
      <p>别处</p>
      <GameHelpCard label="怎么用" topics={[share]} openDelay={300}>
        <GameButton>怎么用</GameButton>
      </GameHelpCard>
    </>,
  );
  await hover(container.querySelector('button')!);
  await settle(120);
  expect(card()).toBeNull();
  await settle(500);
  expect(card()).not.toBeNull();
  await hover(container.querySelector('p')!);
  await settle(600);
  expect(card()).toBeNull();
});

it('keyboard focus opens without moving focus, Tab enters the link, Escape returns focus', async () => {
  const container = await mount(
    <>
      <input aria-label="之前的输入" />
      <GameHelpCard
        label="怎么用"
        topics={[share]}
        link={{ href: '#guide', label: '查看完整指南' }}
      >
        <GameButton>怎么用</GameButton>
      </GameHelpCard>
    </>,
  );
  await act(() => userEvent.click(container.querySelector('input')!));
  await tab();
  const trigger = container.querySelector('button')!;
  expect(document.activeElement).toBe(trigger);
  expect(card()).not.toBeNull();
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  await tab();
  expect(card()!.contains(document.activeElement)).toBe(true);
  expect(document.activeElement?.textContent).toBe('查看完整指南');
  await press('{Escape}');
  expect(card()).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it('Escape with focus elsewhere closes the card without moving focus or closing a dialog', async () => {
  const container = await mount(
    <>
      <input aria-label="其他控件" />
      <GameHelpCard label="怎么用" topics={[share]}>
        <GameButton>怎么用</GameButton>
      </GameHelpCard>
    </>,
    true,
  );
  const input = container.querySelector('input')!;
  await hover(container.querySelector('button')!);
  await settle(600);
  expect(card()).not.toBeNull();
  input.focus();
  const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
  await act(async () => input.dispatchEvent(escape));
  expect(escape.defaultPrevented).toBe(true);
  expect(card()).toBeNull();
  expect(document.activeElement).toBe(input);
  expect((container as HTMLDialogElement).open).toBe(true);
});

it('touch: the first tap opens and prevents the action, the second tap performs it', async () => {
  const onAction = vi.fn();
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[share]}>
      <GameButton onClick={onAction}>怎么用</GameButton>
    </GameHelpCard>,
  );
  const button = container.querySelector('button')!;
  const tap = () => {
    let click!: MouseEvent;
    act(() => {
      button.dispatchEvent(
        new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true, cancelable: true }),
      );
      click = new MouseEvent('click', { bubbles: true, cancelable: true });
      button.dispatchEvent(click);
    });
    return click;
  };
  const first = tap();
  expect(first.defaultPrevented).toBe(true);
  expect(onAction).not.toHaveBeenCalled();
  expect(card()).not.toBeNull();
  const second = tap();
  expect(second.defaultPrevented).toBe(false);
  expect(onAction).toHaveBeenCalledTimes(1);
});

it('touch: a link trigger does not navigate on the first tap', async () => {
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[share]}>
      <a href="#help-card-first-tap" aria-label="怎么用">
        帮助
      </a>
    </GameHelpCard>,
  );
  const link = container.querySelector('a')!;
  let click!: MouseEvent;
  act(() => {
    link.dispatchEvent(
      new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true, cancelable: true }),
    );
    click = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(click);
  });
  expect(click.defaultPrevented).toBe(true);
  expect(location.hash).not.toBe('#help-card-first-tap');
  expect(card()).not.toBeNull();
});

it('a mouse click on the trigger keeps its own action', async () => {
  const onAction = vi.fn();
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[share]}>
      <GameButton onClick={onAction}>怎么用</GameButton>
    </GameHelpCard>,
  );
  await act(() => userEvent.click(container.querySelector('button')!));
  expect(onAction).toHaveBeenCalledTimes(1);
});

it('tabs switch topics, the chosen tab lasts while open and resets on reopen', async () => {
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[save, restore, share]} openDelay={0}>
      <GameButton>怎么用</GameButton>
    </GameHelpCard>,
  );
  const trigger = container.querySelector('button')!;
  await hover(trigger);
  await settle(50);
  const visiblePanelTitle = () =>
    card()!.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden]) h3')?.textContent;
  expect(visiblePanelTitle()).toBe('点一下就保存');
  const tabs = card()!.querySelectorAll<HTMLButtonElement>('[role="tab"]');
  expect(tabs).toHaveLength(3);
  await act(() => userEvent.click(tabs[1]!));
  expect(visiblePanelTitle()).toBe('从备份恢复');
  expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
  // Arrow keys inside the tablist move to the next topic and its tab.
  act(() => tabs[1]!.focus());
  await press('{ArrowRight}');
  expect(visiblePanelTitle()).toBe('分享前先检查');
  await press('{Escape}');
  expect(card()).toBeNull();
  await hover(document.body);
  await hover(trigger);
  await settle(50);
  expect(card()).not.toBeNull();
  expect(visiblePanelTitle()).toBe('点一下就保存');
});

it('keeps the trigger and card aria attributes, the media description and the line breaks', async () => {
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[save]}>
      <GameButton>怎么用</GameButton>
    </GameHelpCard>,
  );
  const trigger = container.querySelector('button')!;
  await hover(trigger);
  await settle(600);
  const dialog = card()!;
  expect(dialog.getAttribute('aria-label')).toBe('怎么用');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
  const media = dialog.querySelector('video')!;
  expect(media.getAttribute('aria-label')).toBe(videoMedia.alt);
  expect(media.getAttribute('role')).toBe('img');
  const body = dialog.querySelector<HTMLElement>('.game-ui-help-card-body')!;
  expect(body.textContent).toContain('\n');
  expect(getComputedStyle(body).whiteSpace).toBe('pre-line');
});

it('plays its video only while the card is open, and pauses when it closes', async () => {
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[save]}>
      <GameButton>怎么用</GameButton>
    </GameHelpCard>,
  );
  await hover(container.querySelector('button')!);
  await settle(600);
  const video = card()!.querySelector('video')!;
  await expect.poll(() => video.paused, { timeout: 3000 }).toBe(false);
  expect(video.muted).toBe(true);
  await press('{Escape}');
  expect(card()).toBeNull();
  expect(video.paused).toBe(true);
});

it('never autoplays under reduced motion and shows the poster instead', async () => {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[save]}>
      <GameButton>怎么用</GameButton>
    </GameHelpCard>,
  );
  await hover(container.querySelector('button')!);
  await settle(600);
  const video = card()!.querySelector('video')!;
  await settle(300);
  expect(video.paused).toBe(true);
  expect(video.currentTime).toBe(0);
  expect(video.getAttribute('poster')).toBe(helpDemoPoster);
});

it('portals the card into the closest native dialog', async () => {
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[share]}>
      <GameButton>怎么用</GameButton>
    </GameHelpCard>,
    true,
  );
  await hover(container.querySelector('button')!);
  await settle(600);
  expect(container.querySelector('[role="dialog"]')).not.toBeNull();
  expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
});

it('keeps the theme and style of its trigger after the portal leaves the themed subtree', async () => {
  const container = await mount(
    <section data-game-ui-theme="dark" data-game-ui-style="ink">
      <GameHelpCard label="怎么用" topics={[save]}>
        <GameButton>怎么用</GameButton>
      </GameHelpCard>
    </section>,
  );
  await hover(container.querySelector('button')!);
  await settle(600);
  const frame = card()!;
  expect(frame.getAttribute('data-game-ui-theme')).toBe('dark');
  expect(frame.getAttribute('data-game-ui-style')).toBe('ink');
  const themed = getComputedStyle(container.querySelector('section')!);
  const light = getComputedStyle(document.documentElement);
  const text = themed.getPropertyValue('--game-ui-text').trim();
  expect(text).not.toBe(light.getPropertyValue('--game-ui-text').trim());
  expect(getComputedStyle(frame).getPropertyValue('--game-ui-text').trim()).toBe(text);
  // The card keeps its own corner radius (--game-ui-radius-card, 18px).
  const paint = frame.querySelector<HTMLElement>('.game-ui-help-card-paint')!;
  expect(getComputedStyle(paint).borderTopLeftRadius).toBe('18px');
  expectReadable(frame, `dark ${text}`);
});

it('paints a card outside any themed ancestor in the light default, readable on its fill', async () => {
  const container = await mount(
    <GameHelpCard label="怎么用" topics={[save]}>
      <GameButton>怎么用</GameButton>
    </GameHelpCard>,
  );
  await hover(container.querySelector('button')!);
  await settle(600);
  expectReadable(card()!, 'light default');
  expect(container.querySelector('[role="dialog"]')).toBeNull();
});
