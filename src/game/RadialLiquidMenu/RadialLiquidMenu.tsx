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
import { V12LiquidBody, V12OrbGlyph } from '../v12LiquidBody';
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
  floating?: boolean;
  className?: string;
}

type V12Style = CSSProperties & {
  '--swimmer-v12-x'?: string;
  '--swimmer-v12-y'?: string;
  '--swimmer-v12-mobile-x'?: string;
  '--swimmer-v12-mobile-y'?: string;
};

const DESKTOP_THREE = [
  [-132, 118],
  [0, 156],
  [132, 118],
] as const;

const PHONE_THREE = [
  [-112, 116],
  [0, 152],
  [112, 116],
] as const;

const DESKTOP_TWO = [
  [-88, 126],
  [88, 126],
] as const;

const PHONE_TWO = [
  [-78, 122],
  [78, 122],
] as const;

const SINGLE = [[0, 124]] as const;

function offsets(count: number, mobile: boolean): readonly (readonly [number, number])[] {
  if (count === 3) return mobile ? PHONE_THREE : DESKTOP_THREE;
  if (count === 2) return mobile ? PHONE_TWO : DESKTOP_TWO;
  if (count === 1) return SINGLE;
  const span = mobile ? 114 : 128;
  return Array.from({ length: count }, (_, index) => {
    const middle = (count - 1) / 2;
    const ratio = middle === 0 ? 0 : (index - middle) / middle;
    return [
      Math.round(ratio * span),
      Math.round((mobile ? 152 : 156) - Math.abs(ratio) * (mobile ? 38 : 40)),
    ] as const;
  });
}

export function RadialLiquidMenu({
  className,
  defaultOpen = false,
  floating = false,
  items,
  label,
  onOpenChange,
  onSelect,
  open,
  orbSpeed = 2.0,
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

  const desktopOffsets = offsets(items.length, false);
  const mobileOffsets = offsets(items.length, true);

  return (
    <div
      ref={rootRef}
      className={['game-ui-v12-radial-menu', className].filter(Boolean).join(' ')}
      data-floating={floating ? 'true' : undefined}
      data-open={isOpen ? 'true' : 'false'}
      data-v12-theme={theme}
      onKeyDown={onKeyDown}
    >
      {isOpen ? (
        <div id={menuId} className="game-ui-v12-radial-menu__items" role="menu" aria-label={label}>
          {items.map((item, index) => {
            const [desktopX, desktopY] = desktopOffsets[index] ?? [0, 156];
            const [mobileX, mobileY] = mobileOffsets[index] ?? [0, 152];
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
                <V12LiquidBody
                  className="game-ui-v12-radial-menu__body"
                  phaseOffset={1.3 + (index + 1) * 0.9}
                  size={58}
                  speed={orbSpeed * 1.18}
                >
                  <span className="game-ui-v12-radial-menu__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                </V12LiquidBody>
                <span className="game-ui-v12-radial-menu__pill">{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
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
        <V12LiquidBody className="game-ui-v12-radial-menu__trigger-body" speed={orbSpeed}>
          <span className="game-ui-v12-radial-menu__trigger-glyph" aria-hidden="true">
            {isOpen ? (
              <>
                <V12OrbGlyph kind="close" />
                <span className="game-ui-v12-sr-only">×</span>
              </>
            ) : trigger === '+' ? (
              <>
                <V12OrbGlyph kind="plus" />
                <span className="game-ui-v12-sr-only">+</span>
              </>
            ) : (
              trigger
            )}
          </span>
        </V12LiquidBody>
      </button>
    </div>
  );
}
