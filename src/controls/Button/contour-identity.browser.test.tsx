import { act, StrictMode, useId } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { Button } from './Button';
import { createDropletGeometry, dropletPath, dropletSeed } from '../DropletSurface/geometry';
import '../../styles.css';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
function UnrelatedControl() {
  return <span hidden id={useId()} />;
}
const paint = async () => {
  await document.fonts.ready;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
};
const path = () => host.querySelector('.game-ui-droplet path')!.getAttribute('d');

for (const isStatic of [false, true]) {
  it(`retains an explicitly identified button contour across unrelated mount order, static=${isStatic}`, async () => {
    let original: string | null = null;
    for (const count of [0, 7, 19]) {
      await act(async () =>
        root.render(
          <StrictMode key={count}>
            {Array.from({ length: count }, (_, i) => (
              <UnrelatedControl key={i} />
            ))}
            <Button id="stable-action" static={isStatic} style={{ width: 121, height: 44 }}>
              Action
            </Button>
          </StrictMode>,
        ),
      );
      await paint();
      expect(path()).toBeTruthy();
      if (original !== null) expect(path()).toBe(original);
      original = path();
      expect(host.querySelector('button')?.id).toBe('stable-action');
    }
  });
}

it('uses a deterministic default contour when no native id is provided', async () => {
  let original: string | null = null;
  for (const count of [0, 7, 19]) {
    await act(async () =>
      root.render(
        <StrictMode key={`default-${count}`}>
          {Array.from({ length: count }, (_, i) => (
            <UnrelatedControl key={i} />
          ))}
          <Button style={{ width: 121, height: 44 }}>Action</Button>
        </StrictMode>,
      ),
    );
    await paint();
    expect(path()).toBeTruthy();
    if (original !== null) expect(path()).toBe(original);
    original = path();
  }
});

it('uses the same native id seed for a link and a button without changing geometry or press behavior', async () => {
  const expected = dropletPath(
    createDropletGeometry(121, 44, 22),
    1.4,
    0,
    dropletSeed('stable-action'),
    14,
  );
  for (const href of [undefined, '/next']) {
    await act(async () =>
      root.render(
        <Button
          key={href ?? 'button'}
          id="stable-action"
          href={href}
          style={{ width: 121, height: 44 }}
        >
          Action
        </Button>,
      ),
    );
    await paint();
    expect(path()).toBe(expected);
    const action = host.querySelector<HTMLElement>('#stable-action')!;
    expect(action.tagName).toBe(href ? 'A' : 'BUTTON');
    const before = action.getBoundingClientRect().toJSON();
    action.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerId: 1 }),
    );
    await expect
      .poll(() => host.querySelector('.game-ui-droplet g')?.getAttribute('transform'))
      .not.toContain('scale(1.00000 1.00000)');
    expect(action.getBoundingClientRect().toJSON()).toEqual(before);
    action.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerId: 1 }));
    // A quick pointerup first completes the kit's existing minimum press hold.
    // Observe that phase before asserting the separately bounded spring return.
    await expect
      .poll(() => host.querySelector('.game-ui-droplet')?.getAttribute('data-pressed'))
      .toBe('false');
    // Match the existing spring test's 180 frames at 60 Hz. This is a new
    // native-motion assertion; no product or existing acceptance deadline changes.
    await expect.poll(path, { timeout: 3000 }).toBe(expected);
  }
});
