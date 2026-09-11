import { useEffect, useState } from 'react';

/*
 * One reading of the platform motion preference, for the whole kit.
 *
 * This existed twice — once in `LiquidGroup` and once in `LiquidSurface` —
 * with the same guard comment copied across both, and both crashed on the same
 * input: a `MediaQueryList` that has `matches` but not `addEventListener`.
 * That is not only a test stub. Safari shipped `addListener` alone until 14,
 * and a design system that throws while reading an accessibility preference
 * fails in exactly the direction it must not.
 *
 * So the subscription degrades in three steps: modern listener, legacy
 * listener, and — for anything that answers the query but cannot be watched —
 * the value read once at mount. A preference that cannot change mid-session is
 * still the right preference.
 */

/**
 * `window` existing does not mean `matchMedia` does. jsdom ships the first and
 * not always the second, and a server render has neither, so both the
 * initializer and the subscription ask for the function itself.
 */
function reducedMotionQuery(): MediaQueryList | null {
  if (typeof window === 'undefined') return null;
  if (typeof window.matchMedia !== 'function') return null;
  return window.matchMedia('(prefers-reduced-motion: reduce)');
}

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

/** Subscribe however this MediaQueryList allows, or not at all. */
export function watchMediaQuery(
  media: MediaQueryList,
  onChange: (event: MediaQueryListEvent) => void,
): () => void {
  const legacy = media as LegacyMediaQueryList;
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }
  if (typeof legacy.addListener === 'function') {
    legacy.addListener(onChange);
    return () => legacy.removeListener?.(onChange);
  }
  return () => {};
}

/** Whether the platform asks for reduced motion, kept current where possible. */
export function useSystemReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => reducedMotionQuery()?.matches ?? false);

  useEffect(() => {
    const media = reducedMotionQuery();
    if (!media) return;
    setReduced(media.matches);
    return watchMediaQuery(media, (event) => setReduced(event.matches));
  }, []);

  return reduced;
}
