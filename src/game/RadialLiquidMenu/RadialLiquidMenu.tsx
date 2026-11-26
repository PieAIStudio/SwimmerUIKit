import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { LiquidSurface } from '../../liquid/LiquidSurface/LiquidSurface';
import { type V12Theme } from '../v12Theme';

export interface RadialLiquidMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}

export interface RadialLiquidMenuProps {
  items: readonly RadialLiquidMenuItem[];
  label: string;
  trigger: ReactNode;
  triggerLabel: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelect?: (id: string) => void;
  theme?: V12Theme;
  orbSpeed?: number;
  className?: string;
}

type V12Style = CSSProperties & {
  '--swimmer-v12-orb-duration'?: string;
  '--swimmer-v12-x'?: string;
  '--swimmer-v12-y'?: string;
};

function animationDuration(speed: number | undefined): string {
  const safeSpeed = Number.isFinite(speed) && (speed ?? 0) > 0 ? (speed as number) : 2.4;
  return Math.round(1200 / Math.min(Math.max(safeSpeed, 0.5), 6)) + 'ms';
}

export function RadialLiquidMenu({
  className,
  defaultOpen = false,
  items,
  label,
  onOpenChange,
  onSelect,
  open,
  orbSpeed = 2.4,
  theme = 'lagoon',
  trigger,
  triggerLabel,
}: RadialLiquidMenuProps): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const generatedId = useId();
  const menuId = `game-ui-v12-radial-menu-${generatedId.replace(/:/g, '')}`;
  const firstEnabledIndex = Math.max(
    items.findIndex((item) => !item.disabled),
    0,
  );

  const setMenuOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, open],
  );

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }, [setMenuOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target)) closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [closeMenu, isOpen]);

  useEffect(() => {
    if (isOpen) itemRefs.current[firstEnabledIndex]?.focus();
  }, [firstEnabledIndex, isOpen]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    const enabled = items
      .map((item, index) => (item.disabled ? -1 : index))
      .filter((index) => index >= 0);
    if (!enabled.length || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const currentIndex = itemRefs.current.findIndex((node) => node === document.activeElement);
    const currentPosition = Math.max(enabled.indexOf(currentIndex), 0);
    const nextPosition =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : event.key === 'ArrowLeft'
            ? (currentPosition + enabled.length - 1) % enabled.length
            : (currentPosition + 1) % enabled.length;
    event.preventDefault();
    const nextIndex = enabled[nextPosition];
    if (nextIndex === undefined) return;
    itemRefs.current[nextIndex]?.focus();
  };

  const rootStyle = { '--swimmer-v12-orb-duration': animationDuration(orbSpeed) } as V12Style;

  return (
    <div
      ref={rootRef}
      className={['game-ui-v12-radial-menu', className].filter(Boolean).join(' ')}
      data-v12-theme={theme}
      data-open={isOpen ? 'true' : 'false'}
      onKeyDown={onKeyDown}
      style={rootStyle}
    >
      {isOpen ? (
        <div id={menuId} className="game-ui-v12-radial-menu__items" role="menu" aria-label={label}>
          {items.map((item, index) => (
            <button
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              aria-label={item.label}
              key={item.id}
              className="game-ui-v12-radial-menu__item"
              data-disabled={item.disabled ? 'true' : undefined}
              disabled={item.disabled}
              onClick={() => {
                onSelect?.(item.id);
                closeMenu();
              }}
              style={
                {
                  '--swimmer-v12-x': `${(index - (items.length - 1) / 2) * 88}px`,
                  '--swimmer-v12-y': `${-Math.max(8, 42 - Math.abs(index - (items.length - 1) / 2) * 12)}px`,
                } as V12Style
              }
              role="menuitem"
              tabIndex={item.disabled || index !== firstEnabledIndex ? -1 : 0}
              type="button"
            >
              <LiquidSurface
                className="game-ui-v12-radial-menu__surface"
                form="swell"
                breathing
                fill="var(--swimmer-v12-accent)"
                outline={{ amplitude: 3, lobes: 4 }}
              >
                <span className="game-ui-v12-radial-menu__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="game-ui-v12-radial-menu__pill">{item.label}</span>
              </LiquidSurface>
            </button>
          ))}
        </div>
      ) : null}
      <button
        ref={triggerRef}
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        className="game-ui-v12-radial-menu__trigger"
        onClick={() => setMenuOpen(!isOpen)}
        type="button"
      >
        {trigger}
      </button>
    </div>
  );
}
