import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { LiquidAnchor, type LiquidAnchorProps } from '../LiquidAnchor/LiquidAnchor';
import { LiquidReveal } from '../LiquidReveal/LiquidReveal';

export interface LiquidPopoverProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  source: RefObject<HTMLElement | null>;
  placement?: LiquidAnchorProps['placement'];
  title: ReactNode;
  width?: number;
  children: ReactNode;
}

/** A controlled, non-modal liquid panel. The host still owns every action and
 * open state; this composition owns placement, dismissal and focus only. */
export function LiquidPopover({ open, ...props }: LiquidPopoverProps) {
  return open ? <OpenPopover {...props} /> : null;
}

function OpenPopover({
  source,
  onOpenChange,
  title,
  children,
  width = 440,
  placement = 'bottom-end',
}: Omit<LiquidPopoverProps, 'open'>) {
  // A new mount is a new explicit opening; content updates keep this key.
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const focused = useRef(false);
  const latest = useRef(onOpenChange);
  latest.current = onOpenChange;
  const attachPanel = useCallback(
    (node: HTMLDivElement | null) => {
      panel.current = node;
      const origin = source.current;
      if (!node) return;
      return () => {
        panel.current = null;
        // Bind cleanup to this actual portal node, not an earlier empty ref.
        // StrictMode reconnects it; only a genuinely removed panel returns focus.
        // An outside pointerdown closes before the browser's native mousedown
        // focus default. Restore after that default, not in an earlier microtask.
        requestAnimationFrame(() => {
          if (!node.isConnected && origin?.isConnected) origin.focus({ preventScroll: true });
        });
      };
    },
    [source],
  );
  const [narrow, setNarrow] = useState(false);
  useLayoutEffect(() => {
    const media = matchMedia('(max-width: 767px)');
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useLayoutEffect(() => {
    focused.current = false;
    const outside = (event: PointerEvent) => {
      const path = event.composedPath();
      if (
        panel.current &&
        !path.includes(panel.current) &&
        (!source.current || !path.includes(source.current))
      )
        latest.current(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      const modal = document.querySelector('dialog:modal');
      if (modal && !modal.contains(panel.current)) return;
      event.preventDefault();
      latest.current(false);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [source]);
  const actualPlacement = narrow ? 'top' : placement;
  return (
    <LiquidAnchor
      source={source}
      placement={actualPlacement}
      onBoundsChange={(rect) => {
        if (rect && !focused.current && heading.current) {
          heading.current.focus({ preventScroll: true });
          focused.current = document.activeElement === heading.current;
        }
      }}
    >
      <div
        ref={attachPanel}
        className="game-ui-liquid-popover"
        role="dialog"
        aria-modal="false"
        aria-labelledby={`${id}-title`}
        data-popover-placement={actualPlacement}
        style={
          {
            '--game-ui-popover-width': `${Number.isFinite(width) ? Math.max(24, width) : 440}px`,
          } as CSSProperties
        }
      >
        <LiquidReveal source={source} revealKey={id}>
          <div className="game-ui-liquid-popover-content">
            <h2 ref={heading} id={`${id}-title`} tabIndex={-1}>
              {title}
            </h2>
            {children}
          </div>
        </LiquidReveal>
      </div>
    </LiquidAnchor>
  );
}
