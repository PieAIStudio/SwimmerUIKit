import { act, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';

import { LiquidGroup } from './LiquidGroup';
import { resetLiquidGooeyBudgetForTests, setLiquidGooeyBudget } from './liquidGooeyBudget';
import './styles.css';

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

const IMAGE_A =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect width="120" height="80" rx="16" fill="#e8743b"/><circle cx="90" cy="24" r="28" fill="#f2b35c"/></svg>',
  );
const IMAGE_B =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80"><rect width="120" height="80" rx="16" fill="#1d9a8b"/><circle cx="90" cy="24" r="28" fill="#5ca6d8"/></svg>',
  );

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(async () => {
  await act(async () => root?.unmount());
  root = null;
  container?.remove();
  container = null;
  resetLiquidGooeyBudgetForTests();
  vi.restoreAllMocks();
});

async function mount(node: ReactNode): Promise<HTMLDivElement> {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root?.render(node));
  return container;
}

async function nextFrames(count = 8): Promise<void> {
  await act(async () => {
    for (let index = 0; index < count; index += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
  });
}

function meltItems(): ReactNode {
  return (
    <LiquidGroup style={{ height: '180px', position: 'relative', width: '360px' }}>
      <LiquidGroup.Item
        effect="melt"
        style={{
          height: '100px',
          left: '40px',
          position: 'absolute',
          top: '40px',
          width: '140px',
        }}
      >
        <img alt="orange" src={IMAGE_A} />
        <span data-testid="melt-label-a">A stays text</span>
      </LiquidGroup.Item>
      <LiquidGroup.Item
        effect="melt"
        style={{
          height: '100px',
          left: '180px',
          position: 'absolute',
          top: '40px',
          width: '140px',
        }}
      >
        <img alt="teal" src={IMAGE_B} />
        <span data-testid="melt-label-b">B stays text</span>
      </LiquidGroup.Item>
    </LiquidGroup>
  );
}

describe('image Melt and contact dissolve browser surface', () => {
  it('paints a pairwise color/marbling layer while keeping sibling text crisp', async () => {
    const current = await mount(meltItems());
    await nextFrames();

    const layer = current.querySelector<SVGElement>('[data-liquid-gooey-image-melt]');
    const melt = current.querySelector<SVGElement>('[data-gooey-imagemelt]');
    const firstImage = current.querySelector<HTMLImageElement>('.game-ui-liquid-item img');
    const firstLabel = current.querySelector<HTMLElement>('[data-testid="melt-label-a"]');

    expect(layer).not.toBeNull();
    expect(melt?.querySelector('feColorMatrix')).not.toBeNull();
    expect(melt?.querySelector('[id*="-marble"]')).not.toBeNull();
    expect(firstImage?.style.opacity).toBe('0');
    expect(firstLabel?.textContent).toBe('A stays text');
    expect(firstLabel?.closest('[filter]')).toBeNull();
  });

  it('masks only dissolve images and emits no filtered text layer', async () => {
    const current = await mount(
      <LiquidGroup style={{ height: '180px', position: 'relative', width: '360px' }}>
        <LiquidGroup.Item
          dissolve={{ active: true, strength: 1 }}
          style={{
            height: '100px',
            left: '40px',
            position: 'absolute',
            top: '40px',
            width: '140px',
          }}
        >
          <div>
            <img alt="orange" src={IMAGE_A} />
            <span data-testid="dissolve-label">Never melt this text</span>
          </div>
        </LiquidGroup.Item>
        <LiquidGroup.Item
          dissolve={{ active: true, strength: 1 }}
          style={{
            height: '100px',
            left: '180px',
            position: 'absolute',
            top: '40px',
            width: '140px',
          }}
        >
          <div>
            <img alt="teal" src={IMAGE_B} />
            <span>Neighbour</span>
          </div>
        </LiquidGroup.Item>
      </LiquidGroup>,
    );
    await nextFrames();

    const image = current.querySelector<HTMLImageElement>('[data-testid="dissolve-label"]')
      ?.previousElementSibling as HTMLImageElement | null;
    const label = current.querySelector<HTMLElement>('[data-testid="dissolve-label"]');
    const layer = current.querySelector<SVGElement>('[data-liquid-gooey-image-melt]');

    expect(layer?.querySelector('[data-liquid-gooey-dissolve]')).not.toBeNull();
    expect(image?.style.maskImage || image?.style.webkitMaskImage).toContain('radial-gradient');
    expect(label?.textContent).toBe('Never melt this text');
    expect(label?.closest('[filter]')).toBeNull();
  });

  it('restores an image mask when a dissolve item unmounts', async () => {
    const current = await mount(
      <LiquidGroup style={{ height: '180px', position: 'relative', width: '360px' }}>
        <LiquidGroup.Item
          dissolve
          style={{
            height: '100px',
            left: '40px',
            position: 'absolute',
            top: '40px',
            width: '140px',
          }}
        >
          <img alt="orange" src={IMAGE_A} />
        </LiquidGroup.Item>
        <LiquidGroup.Item
          style={{
            height: '100px',
            left: '180px',
            position: 'absolute',
            top: '40px',
            width: '140px',
          }}
        >
          <img alt="teal" src={IMAGE_B} />
        </LiquidGroup.Item>
      </LiquidGroup>,
    );
    await nextFrames();

    const image = current.querySelector<HTMLImageElement>('.game-ui-liquid-item img');
    expect(image?.style.maskImage || image?.style.webkitMaskImage).toContain('radial-gradient');

    await act(async () => root?.unmount());

    expect(image?.style.maskImage).toBe('');
    expect(image?.style.webkitMaskImage).toBe('');
  });

  it('ignores dissolve on Move and warns in development', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await mount(
      <LiquidGroup style={{ height: '120px', position: 'relative', width: '240px' }}>
        <LiquidGroup.Item
          dissolve
          effect="move"
          style={{
            height: '80px',
            left: '24px',
            position: 'absolute',
            top: '20px',
            width: '80px',
          }}
        >
          <img alt="orange" src={IMAGE_A} />
        </LiquidGroup.Item>
      </LiquidGroup>,
    );

    expect(warning).toHaveBeenCalledWith(expect.stringContaining('dissolve is ignored'));
  });

  it('degrades the image layer once when the shared budget rejects it', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setLiquidGooeyBudget(0);
    const current = await mount(meltItems());
    await nextFrames();

    expect(current.querySelector('[data-liquid-gooey-image-melt]')).toBeNull();
    expect(current.querySelector<HTMLImageElement>('.game-ui-liquid-item img')?.style.opacity).toBe(
      '',
    );
    expect(warning).toHaveBeenCalledTimes(1);
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('image filter budget'));
  });
});
