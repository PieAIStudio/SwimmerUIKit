import { useLayoutEffect, useRef } from 'react';

const THEME_ATTRIBUTES = ['data-game-ui-theme', 'data-game-ui-style'];
const MIRROR_ATTRIBUTES = ['class', 'style', ...THEME_ATTRIBUTES];

/** Keep a help portal in its source's theme without copying trigger paint state. */
export function ThemeMirror({ source }: { source: HTMLElement | null }) {
  const probe = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const layer = probe.current?.parentElement;
    if (!layer || !source) return;
    const themed = (node: Element) =>
      node.closest('[data-game-ui-theme], [data-game-ui-style]') ?? document.documentElement;
    const sync = () => {
      const host = themed(source);
      for (const name of THEME_ATTRIBUTES) {
        const value = host.closest(`[${name}]`)?.getAttribute(name);
        if (value) layer.setAttribute(name, value);
        else layer.removeAttribute(name);
      }
      const computed = getComputedStyle(host);
      for (const token of computed) {
        if (/^--(swimmer|help)-/.test(token) && token !== '--swimmer-droplet-radius') {
          layer.style.setProperty(token, computed.getPropertyValue(token));
        }
      }
    };
    const observer = new MutationObserver(sync);
    for (let node: Element | null = themed(source); node; node = node.parentElement)
      observer.observe(node, { attributes: true, attributeFilter: MIRROR_ATTRIBUTES });
    sync();
    return () => observer.disconnect();
  }, [source]);
  return <span ref={probe} hidden />;
}
