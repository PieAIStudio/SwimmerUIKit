import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { LiquidGroup } from '../../liquid/LiquidGroup/LiquidGroup';

import type { GameButtonSurface } from '../GameButton/GameButton';

import type { LiquidFinish } from '../../liquid/finish';

export interface GameSegmentedOption {
  id: string;
  label: string;
}

export interface GameSegmentedControlProps {
  activeId: string;
  label: string;
  onSelect?: (id: string) => void;
  options: readonly GameSegmentedOption[];
  /** Existing default is liquid. Flat provides a quiet, filter-free option. */
  surface?: Exclude<GameButtonSurface, 'plaque'>;
  liquidFinish?: LiquidFinish;
  disabled?: boolean;
}

interface SegmentedIndicatorFrame {
  x: number;
  y: number;
  width: number;
  height: number;
}

function sameSegmentedIndicator(
  left: SegmentedIndicatorFrame,
  right: SegmentedIndicatorFrame,
): boolean {
  return (
    left.x === right.x &&
    left.y === right.y &&
    left.width === right.width &&
    left.height === right.height
  );
}

export function GameSegmentedControl({
  activeId,
  label,
  onSelect,
  options,
  surface = 'liquid',
  liquidFinish,
  disabled,
}: GameSegmentedControlProps): ReactNode {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState<SegmentedIndicatorFrame>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const activeIndex = options.findIndex((option) => option.id === activeId);
  const liquid = surface === 'liquid' && !disabled;

  useLayoutEffect(() => {
    const root = rootRef.current;
    const option = activeIndex >= 0 ? optionRefs.current[activeIndex] : null;
    if (!root || !option) return;
    const measure = (): void => {
      const rootRect = root.getBoundingClientRect();
      const optionRect = option.getBoundingClientRect();
      const next = {
        x: optionRect.left - rootRect.left,
        y: optionRect.top - rootRect.top,
        width: optionRect.width,
        height: optionRect.height,
      };
      setIndicator((previous) => (sameSegmentedIndicator(previous, next) ? previous : next));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(option);
    return () => observer.disconnect();
  }, [activeId, activeIndex, options]);

  return (
    <div
      ref={rootRef}
      aria-label={label}
      className="game-ui-segmented"
      role="group"
      data-segmented-surface={!liquid ? 'flat' : undefined}
      data-segmented-disabled={disabled ? 'true' : undefined}
    >
      {liquid ? (
        <LiquidGroup
          aria-hidden="true"
          className="game-ui-segmented-surface"
          fill="var(--game-ui-surface-raised)"
          shadow="var(--game-ui-shadow-button)"
          stroke="var(--game-ui-stroke)"
          style={{ inset: 0, pointerEvents: 'none', position: 'absolute' }}
        >
          <LiquidGroup.Item
            style={{
              borderRadius: 'var(--game-ui-radius-control)',
              inset: 0,
              position: 'absolute',
            }}
          >
            {null}
          </LiquidGroup.Item>
        </LiquidGroup>
      ) : null}
      {liquid && indicator.width > 0 && indicator.height > 0 ? (
        <LiquidGroup
          {...(liquidFinish === undefined ? {} : { liquidFinish })}
          aria-hidden="true"
          className="game-ui-segmented-follow"
          fill="var(--game-ui-secondary)"
          motion="follow"
          shadow="var(--game-ui-shadow-button)"
          style={{ inset: 0, pointerEvents: 'none', position: 'absolute' }}
        >
          <LiquidGroup.Item
            aria-hidden="true"
            style={{
              borderRadius: 'var(--game-ui-radius-control)',
              height: `${indicator.height}px`,
              left: 0,
              position: 'absolute',
              top: 0,
              width: `${indicator.width}px`,
            }}
            transition="snappy"
            x={indicator.x}
            y={indicator.y}
          >
            {null}
          </LiquidGroup.Item>
        </LiquidGroup>
      ) : null}
      {options.map((option, index) => (
        <button
          aria-pressed={option.id === activeId}
          className="game-ui-segmented-option"
          disabled={disabled}
          key={option.id}
          onClick={onSelect ? () => onSelect(option.id) : undefined}
          ref={(node) => {
            optionRefs.current[index] = node;
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
