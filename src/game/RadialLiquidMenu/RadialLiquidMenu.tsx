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
import { V12LiquidBody } from '../v12LiquidBody';
import { type V12Theme } from '../../tokens/v12Theme';

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
  '--swimmer-v12-x'?: string;
  '--swimmer-v12-y'?: string;
  '--swimmer-v12-mobile-x'?: string;
  '--swimmer-v12-mobile-y'?: string;
};

const DESKTOP = [
  [-132, 118],
  [0, 156],
  [132, 118],
] as const;
const PHONE = [
  [-112, 116],
  [0, 152],
  [112, 116],
] as const;

function offsets(count: number, mobile: boolean): readonly (readonly [number, number])[] {
  const source = mobile ? PHONE : DESKTOP;
  if (count === 3) return source;
  const span = mobile ? 112 : 132;
  return Array.from({ length: count }, (_, index) => {
    const middle = (count - 1) / 2;
    const distance = Math.abs(index - middle);
    return [
      Math.round((index - middle) * (span / Math.max(1, middle))),
      Math.round((mobile ? 152 : 156) - distance * (mobile ? 36 : 38)),
    ] as const;
  });
}
export function RadialLiquidMenu({
  className,
  defaultOpen = false,
  items,
  label,
  onOpenChange,
  onSelect,
  open,
  theme = 'lagoon',
  trigger,
  triggerLabel,
}: RadialLiquidMenuProps): ReactNode {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const previousOpen = useRef(defaultOpen);
  const openedByUser = useRef(false);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const generatedId = useId();
  const menuId = 'game-ui-v12-radial-menu-' + generatedId.replace(/:/g, '');
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
    if (isOpen && !previousOpen.current && openedByUser.current) {
      itemRefs.current[firstEnabledIndex]?.focus();
      openedByUser.current = false;
    }
    previousOpen.current = isOpen;
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
    const current = itemRefs.current.findIndex((node) => node === document.activeElement);
    const position = Math.max(enabled.indexOf(current), 0);
    const nextPosition =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? enabled.length - 1
          : event.key === 'ArrowLeft'
            ? (position + enabled.length - 1) % enabled.length
            : (position + 1) % enabled.length;
    const nextIndex = enabled[nextPosition];
    if (nextIndex === undefined) return;
    event.preventDefault();
    itemRefs.current[nextIndex]?.focus();
  };
  return (
    <div
      ref={rootRef}
      className={['game-ui-v12-radial-menu', className].filter(Boolean).join(' ')}
      data-open={isOpen ? 'true' : 'false'}
      data-v12-theme={theme}
      onKeyDown={onKeyDown}
    >
      <div className="game-ui-v12-radial-menu__stage">
        {isOpen ? (
          <div
            id={menuId}
            className="game-ui-v12-radial-menu__items"
            role="menu"
            aria-label={label}
          >
            {items.map((item, index) => {
              const [desktopX, desktopY] = offsets(items.length, false)[index] ?? [0, 156];
              const [mobileX, mobileY] = offsets(items.length, true)[index] ?? [0, 152];
              return (
                <button
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  aria-label={item.label}
                  className="game-ui-v12-radial-menu__item"
                  data-disabled={item.disabled ? 'true' : undefined}
                  disabled={item.disabled}
                  key={item.id}
                  onClick={() => {
                    onSelect?.(item.id);
                    closeMenu();
                  }}
                  role="menuitem"
                  style={
                    {
                      '--swimmer-v12-x': desktopX + 'px',
                      '--swimmer-v12-y': desktopY + 'px',
                      '--swimmer-v12-mobile-x': mobileX + 'px',
                      '--swimmer-v12-mobile-y': mobileY + 'px',
                    } as V12Style
                  }
                  tabIndex={item.disabled || index !== firstEnabledIndex ? -1 : 0}
                  type="button"
                >
                  <V12LiquidBody className="game-ui-v12-radial-menu__body" size={64}>
                    <span className="game-ui-v12-radial-menu__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span className="game-ui-v12-radial-menu__pill">{item.label}</span>
                  </V12LiquidBody>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>{' '}
      <button
        ref={triggerRef}
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={triggerLabel}
        className="game-ui-v12-radial-menu__trigger"
        onClick={() => {
          openedByUser.current = !isOpen;
          setMenuOpen(!isOpen);
        }}
        type="button"
      >
        <V12LiquidBody size={64}>
          <span className="game-ui-v12-radial-menu__trigger-glyph" aria-hidden="true">
            {isOpen ? '×' : trigger}
          </span>
        </V12LiquidBody>
      </button>
    </div>
  );
}
