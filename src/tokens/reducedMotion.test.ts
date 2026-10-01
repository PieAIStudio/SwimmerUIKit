import { describe, expect, it, vi } from 'vitest';

import { watchMediaQuery } from './reducedMotion';

/*
  The three shapes a `MediaQueryList` actually arrives in.

  This is a regression test with a real failure behind it: a consuming product
  stubbed `matchMedia` as `() => ({ matches: true })` and mounting a liquid
  surface threw `addEventListener is not a function`, taking the whole test file
  down. The stub was incomplete, but Safari before 14 has the same shape for
  real — `addListener` and no `addEventListener` — so the kit crashing on it is
  the kit's defect, not the caller's.
*/
describe('watchMediaQuery', () => {
  it('uses the modern listener when there is one', () => {
    const add = vi.fn();
    const remove = vi.fn();
    const media = { matches: false, addEventListener: add, removeEventListener: remove };
    const stop = watchMediaQuery(media as unknown as MediaQueryList, () => {});
    expect(add).toHaveBeenCalledOnce();
    stop();
    expect(remove).toHaveBeenCalledOnce();
  });

  it('falls back to the legacy listener Safari shipped until 14', () => {
    const add = vi.fn();
    const remove = vi.fn();
    const media = { matches: false, addListener: add, removeListener: remove };
    const stop = watchMediaQuery(media as unknown as MediaQueryList, () => {});
    expect(add).toHaveBeenCalledOnce();
    stop();
    expect(remove).toHaveBeenCalledOnce();
  });

  it('does not throw on a query that can be read but not watched', () => {
    const media = { matches: true };
    expect(() => watchMediaQuery(media as unknown as MediaQueryList, () => {})()).not.toThrow();
  });
});
