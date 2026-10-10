import { isValidElement, useLayoutEffect, useState, type ReactNode, type RefObject } from 'react';

/*
 * A trigger built in a Server Component can reach a client component as a lazy
 * node: `$$typeof` is react.lazy and there is no `props`. It happens while the
 * child's Flight row is still streaming. Reading `children.props` then throws
 * "Cannot read properties of undefined (reading 'ref')". GameHelpCard and
 * GameTooltip keep such a child inside a slot and find its focusable element
 * after mount. A valid element never takes this path.
 */

const LAZY = Symbol.for('react.lazy');
/** The elements a person can focus or activate, in document order. */
const TRIGGER = 'a[href], button, [tabindex]:not([tabindex="-1"])';

export function isLazyChild(node: ReactNode): boolean {
  return (
    typeof node === 'object' &&
    node !== null &&
    !isValidElement(node) &&
    (node as { $$typeof?: unknown }).$$typeof === LAZY
  );
}

const warned = new Set<string>();

// Not gated on a build-mode flag: a published library cannot see the consuming
// app's mode, so the check would be baked out (see check-warnings-survive-build).
// Once per component, so a page of triggers prints one line.
function warnLazy(component: string): void {
  if (warned.has(component)) return;
  warned.add(component);
  console.warn(
    `${component}: the trigger arrived as a lazy element from a Server Component. ` +
      'This is supported and works. Building the trigger inside a client component keeps the original element.',
  );
}

/**
 * The first focusable element inside the slot, or null. It is read after commit,
 * and again whenever the slot's children change, because a lazy child can
 * resolve after the first render.
 */
export function useSlotTrigger(
  slot: RefObject<HTMLSpanElement | null>,
  { component, lazy, active }: { component: string; lazy: boolean; active: boolean },
): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const node = slot.current;
    if (!active || !node) return;
    if (lazy) warnLazy(component);
    const sync = () => setTarget(node.querySelector<HTMLElement>(TRIGGER));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [active, component, lazy, slot]);
  return active ? target : null;
}
