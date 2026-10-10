import {
  cloneElement,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';
import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';
import { isLazyChild, useSlotTrigger } from '../shared/trigger-slot';

export interface GameTooltipProps {
  /** A single focusable trigger element (e.g. GameIconButton). */
  children: ReactNode;
  /** Plain text; an explicit line break (\n) is kept. */
  label: string;
  /**
   * Which edges meet the trigger. `center` (default) centres the bubble; `start`
   * aligns its left edge with the trigger and extends right; `end` aligns right
   * edges and extends left.
   */
  align?: 'center' | 'start' | 'end';
  /** Above the trigger (default) or below it. */
  placement?: 'top' | 'bottom';
}

export function GameTooltip({
  children,
  label,
  align = 'center',
  placement = 'top',
}: GameTooltipProps): ReactNode {
  const tooltipId = useId();
  // A single real element takes aria-describedby directly. A lazy child from a
  // Server Component has no props, so it sits in a slot and its focusable element
  // takes the attribute after mount (trigger-slot.ts). Any other child renders in
  // the same slot, which has no focusable element to describe.
  const slotRef = useRef<HTMLSpanElement>(null);
  const slotTrigger = useSlotTrigger(slotRef, {
    component: 'GameTooltip',
    lazy: !isValidElement(children) && isLazyChild(children),
    active: !isValidElement(children),
  });
  useLayoutEffect(() => {
    if (!slotTrigger) return;
    const previous = slotTrigger.getAttribute('aria-describedby');
    slotTrigger.setAttribute('aria-describedby', [previous, tooltipId].filter(Boolean).join(' '));
    return () => {
      if (previous === null) slotTrigger.removeAttribute('aria-describedby');
      else slotTrigger.setAttribute('aria-describedby', previous);
    };
  }, [slotTrigger, tooltipId]);
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children) ? (
    cloneElement(children, {
      'aria-describedby': [children.props['aria-describedby'], tooltipId].filter(Boolean).join(' '),
    })
  ) : (
    <span className="game-ui-trigger-slot" ref={slotRef}>
      {children}
    </span>
  );
  return (
    <span className="game-ui-tooltip">
      {trigger}
      <span
        id={tooltipId}
        role="tooltip"
        data-game-ui-paint=""
        data-tooltip-align={align}
        data-tooltip-placement={placement}
      >
        <DropletSurface static />
        {label}
      </span>
    </span>
  );
}
