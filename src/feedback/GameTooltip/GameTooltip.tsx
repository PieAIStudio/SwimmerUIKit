import { cloneElement, isValidElement, useId, type ReactNode } from 'react';

export interface GameTooltipProps {
  /** A single focusable trigger element (e.g. GameIconButton). */
  children: ReactNode;
  label: string;
}

export function GameTooltip({ children, label }: GameTooltipProps): ReactNode {
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
      <span id={tooltipId} role="tooltip">
        {label}
      </span>
    </span>
  );
}
