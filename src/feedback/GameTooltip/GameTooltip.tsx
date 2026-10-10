import { cloneElement, isValidElement, useId, type ReactNode } from 'react';
import { DropletSurface } from '../../controls/DropletSurface/DropletSurface';

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
  // Only a single real element can receive aria-describedby; anything else
  // (text, fragments, arrays) renders unchanged rather than throwing.
  const trigger = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], tooltipId]
          .filter(Boolean)
          .join(' '),
      })
    : children;
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
