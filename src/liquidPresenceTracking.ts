import { autoUpdate, type VirtualElement } from '@floating-ui/react';
import { validPresenceRect, visiblePresenceRect } from './liquidPresenceGeometry';
import { presenceViewport } from './liquidPresencePaint';
import type { LiquidPresenceTarget } from './liquidPresenceTypes';

/** Last-mile presentation guards. The host still owns authorization and exact
 * clipping/occlusion of editor ranges or projected objects. */
export function readPresenceTarget(target: LiquidPresenceTarget) {
  try {
    const element = target.contextElement;
    if (element && element.ownerDocument !== document) return null;
    if (element && (!element.isConnected || element.closest('[hidden], [inert]'))) return null;
    if (element && getComputedStyle(element).visibility === 'hidden') return null;
    const modal = document.querySelector('dialog:modal');
    if (modal && (!element || !modal.contains(element))) return null;
    const rect = target.getRect();
    return validPresenceRect(rect) && visiblePresenceRect(rect, presenceViewport()) ? rect : null;
  } catch {
    return null;
  }
}

/** DOM targets sleep between layout changes. Only virtual/projected targets
 * and an actual CSS transition need frame-by-frame location checks. This
 * subscription owns no gesture, timeout, model or application action. */
export function trackPresenceGeometry(
  source: HTMLElement,
  target: LiquidPresenceTarget,
  label: HTMLElement,
  update: () => void,
): () => void {
  const context = target.contextElement;
  const virtual: VirtualElement = {
    ...(context ? { contextElement: context } : {}),
    getBoundingClientRect: () => {
      const rect = readPresenceTarget(target) ?? { x: 0, y: 0, width: 0, height: 0 };
      return {
        ...rect,
        top: rect.y,
        left: rect.x,
        right: rect.x + rect.width,
        bottom: rect.y + rect.height,
      };
    },
  };
  const ancestors = new Set<Element>();
  for (const node of [source, context])
    for (let current = node; current; current = current.parentElement) ancestors.add(current);
  const observer = new MutationObserver(update);
  for (const ancestor of ancestors)
    observer.observe(ancestor, {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden', 'inert', 'open'],
    });
  const modalObserver = new MutationObserver((records) => {
    if (
      !source.isConnected ||
      (context && !context.isConnected) ||
      records.some(
        (record) =>
          record.type === 'attributes' ||
          [...record.addedNodes, ...record.removedNodes].some(
            (node) =>
              node instanceof Element &&
              (node.matches('dialog') || Boolean(node.querySelector('dialog'))),
          ),
      )
    )
      update();
  });
  modalObserver.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['open', 'inert'],
  });
  let stop = () => {};
  let dynamic = false;
  const motions = new Map<EventTarget, Set<string>>();
  const listen = (animated: boolean) => {
    stop();
    dynamic = animated;
    stop = autoUpdate(context ?? virtual, label, update, { animationFrame: !context || animated });
  };
  const motion = (event: Event) => {
    if (!(event.target instanceof Element) || !ancestors.has(event.target)) return;
    const name =
      'propertyName' in event
        ? String(event.propertyName)
        : 'animationName' in event
          ? String(event.animationName)
          : event.type;
    const names = motions.get(event.target) ?? new Set<string>();
    if (event.type === 'transitionrun' || event.type === 'animationstart') names.add(name);
    else names.delete(name);
    if (names.size) motions.set(event.target, names);
    else motions.delete(event.target);
    if (dynamic !== Boolean(motions.size)) listen(Boolean(motions.size));
    update();
  };
  const events = [
    'transitionrun',
    'transitionend',
    'transitioncancel',
    'animationstart',
    'animationend',
    'animationcancel',
  ];
  for (const event of events) document.addEventListener(event, motion, true);
  listen(false);
  return () => {
    stop();
    observer.disconnect();
    modalObserver.disconnect();
    for (const event of events) document.removeEventListener(event, motion, true);
  };
}
