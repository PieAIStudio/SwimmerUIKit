import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import {
  autoUpdate,
  computePosition,
  flip,
  hide,
  offset,
  shift,
  size,
  FloatingPortal,
  type Placement,
} from '@floating-ui/react';
import type { LiquidPresenceRect } from './liquidPresenceGeometry';

export interface LiquidAnchorProps {
  source: RefObject<HTMLElement | null>;
  children: ReactNode;
  placement?: Placement;
  /** A layout observation for host scene-label avoidance, never permission. */
  onBoundsChange?(rect: LiquidPresenceRect | null): void;
}

/** Positions an outlet beside a host-owned body, never positions the body itself.
 * Reuses Floating UI and the source's native dialog; no second modal manager. */
export function LiquidAnchor({
  source,
  children,
  placement = 'top-end',
  onBoundsChange,
}: LiquidAnchorProps) {
  const [layer, setLayer] = useState<HTMLDivElement | null>(null);
  const latest = useRef(onBoundsChange);
  latest.current = onBoundsChange;
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    setPortal(source.current?.closest('dialog') ?? document.body);
  }, [source]);
  useLayoutEffect(() => {
    const anchor = source.current,
      node = layer;
    if (!anchor || !node) return;
    let active = true,
      serial = 0;
    let watchedModal: Element | null = null;
    let modalRemoval: MutationObserver | null = null;
    const syncTheme = () => {
      const style = getComputedStyle(anchor);
      // Preserve scoped brand tokens across the portal without copying host styles.
      for (const name of Array.from(style)) {
        if (name.startsWith('--game-ui-') || name.startsWith('--liquid-presence-')) {
          const value = style.getPropertyValue(name);
          if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
        }
      }
      const body = anchor.querySelector('.game-ui-liquid-presence');
      if (body) {
        const pigment = getComputedStyle(body);
        for (const name of ['--liquid-presence-from', '--liquid-presence-to'])
          node.style.setProperty(name, pigment.getPropertyValue(name));
      }
    };
    const update = () => {
      const ticket = ++serial;
      const rect = anchor.getBoundingClientRect();
      const modal = document.querySelector('dialog:modal');
      if (watchedModal !== modal) {
        modalRemoval?.disconnect();
        modalRemoval = null;
        watchedModal = modal;
        if (modal && !modal.contains(anchor) && !node.contains(modal)) {
          // React may remove an external dialog without a bubbling close
          // event. Watch just that dialog and its parent while suspended.
          modalRemoval = new MutationObserver(() => {
            if (!modal.isConnected || !modal.matches(':modal')) update();
          });
          modalRemoval.observe(modal, { attributes: true, attributeFilter: ['open'] });
          if (modal.parentNode) modalRemoval.observe(modal.parentNode, { childList: true });
        }
      }
      if (
        !anchor.isConnected ||
        anchor.closest('[hidden], [inert], [aria-hidden="true"]') ||
        (typeof anchor.checkVisibility === 'function' &&
          !anchor.checkVisibility({ opacityProperty: true, visibilityProperty: true })) ||
        rect.width <= 0 ||
        rect.height <= 0 ||
        (modal && !modal.contains(anchor) && !node.contains(modal))
      ) {
        node.style.visibility = 'hidden';
        latest.current?.(null);
        return;
      }
      void computePosition(anchor, node, {
        strategy: 'fixed',
        placement,
        middleware: [
          offset(14),
          flip({ padding: 12 }),
          shift({ padding: 12, crossAxis: true }),
          size({
            padding: 12,
            apply({ availableHeight, availableWidth }) {
              node.dataset.liquidCompact = availableHeight < 500 ? 'true' : 'false';
              node.style.setProperty('--liquid-outlet-height', `${Math.max(0, availableHeight)}px`);
              node.style.maxWidth = `${Math.max(0, availableWidth)}px`;
            },
          }),
          hide({ strategy: 'referenceHidden' }),
        ],
      })
        .then(({ x, y, middlewareData }) => {
          if (!active || ticket !== serial) return;
          if (middlewareData.hide?.referenceHidden) {
            node.style.visibility = 'hidden';
            latest.current?.(null);
            return;
          }
          node.style.left = `${x}px`;
          node.style.top = `${y}px`;
          node.style.visibility = 'visible';
          const bounds = node.getBoundingClientRect();
          latest.current?.({
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          });
        })
        .catch(() => {
          if (!active || ticket !== serial) return;
          node.style.visibility = 'hidden';
          latest.current?.(null);
        });
    };
    syncTheme();
    const stop = autoUpdate(anchor, node, update);
    const theme = new MutationObserver(() => {
      syncTheme();
      update();
    });
    for (let p: Element | null = anchor; p; p = p.parentElement)
      theme.observe(p, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-game-ui-theme', 'hidden', 'inert', 'aria-hidden'],
      });
    const body = anchor.querySelector('.game-ui-liquid-presence');
    if (body)
      theme.observe(body, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-activity'],
      });
    document.addEventListener('toggle', update, true);
    document.addEventListener('close', update, true);
    return () => {
      active = false;
      serial++;
      stop();
      theme.disconnect();
      modalRemoval?.disconnect();
      document.removeEventListener('toggle', update, true);
      document.removeEventListener('close', update, true);
      latest.current?.(null);
    };
  }, [layer, placement, source]);
  return portal ? (
    <FloatingPortal root={portal} preserveTabOrder={false}>
      <div
        ref={setLayer}
        className="game-ui-liquid-anchor"
        style={{ position: 'fixed', top: 0, left: 0, visibility: 'hidden' }}
      >
        {children}
      </div>
    </FloatingPortal>
  ) : null;
}
