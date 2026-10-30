import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributeAnchorTarget,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Icon } from '../../icons/Icon/Icon';
import { DropletSurface, SelectionMark } from '../DropletSurface/DropletSurface';

export interface LanguageMenuProps {
  className?: string;
  /** Optional override for the trigger label. Defaults to the selected option's label. */
  currentLabel?: string;
  label: string;
  options: readonly {
    id: string;
    label: string;
    meta: string;
    /** When present, the option is a native link instead of a callback button. */
    href?: string;
    /** Language metadata for a native route link. */
    hrefLang?: string;
    lang?: string;
    dir?: 'ltr' | 'rtl' | 'auto';
    /** Marks the route that represents the current document. */
    current?: boolean;
    target?: HTMLAttributeAnchorTarget;
    rel?: string;
  }[];
  /** Controlled selected option id. Omit to let the component own selection. */
  value?: string;
  /** Initial selection when uncontrolled. Defaults to the first option. */
  defaultValue?: string;
  /** Fires with the chosen option id whenever the user picks a language. */
  onSelect?: (id: string) => void;
}

type LanguageOption = LanguageMenuProps['options'][number];
type OptionElement = HTMLButtonElement | HTMLAnchorElement;

function linkRel(option: LanguageOption): string | undefined {
  if (option.target !== '_blank') return option.rel;
  return [...new Set(`${option.rel ?? ''} noopener noreferrer`.trim().split(/\s+/))]
    .filter(Boolean)
    .join(' ');
}

interface LanguageOptionViewProps {
  current: boolean;
  onSelect: (id: string, link: boolean) => void;
  option: LanguageOption;
  setRef: (element: OptionElement | null) => void;
  tabIndex: number;
}

function LanguageOptionView({
  current,
  onSelect,
  option,
  setRef,
  tabIndex,
}: LanguageOptionViewProps): ReactNode {
  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const copy = (
    <span className="game-ui-language-option-copy">
      <strong>{option.label}</strong>
      <small>{option.meta}</small>
    </span>
  );

  if (option.href !== undefined) {
    return (
      <a
        aria-current={current ? 'page' : undefined}
        className="game-ui-language-option"
        data-game-ui-paint=""
        data-selected={current ? 'true' : undefined}
        dir={option.dir}
        href={option.href}
        hrefLang={option.hrefLang}
        lang={option.lang}
        onClick={() => onSelect(option.id, true)}
        ref={(element) => {
          linkRef.current = element;
          setRef(element);
        }}
        rel={linkRel(option)}
        role="menuitem"
        tabIndex={tabIndex}
        target={option.target}
      >
        <DropletSurface pressTarget={linkRef} />
        {copy}
        <SelectionMark />
      </a>
    );
  }

  return (
    <button
      aria-checked={current}
      className="game-ui-language-option"
      data-game-ui-paint=""
      data-selected={current ? 'true' : undefined}
      onClick={() => onSelect(option.id, false)}
      ref={setRef}
      role="menuitemradio"
      tabIndex={tabIndex}
      type="button"
    >
      <DropletSurface />
      {copy}
      <SelectionMark />
    </button>
  );
}

/**
 * A small language disclosure that supports both the original callback contract
 * and route-owned native links. The host still owns locale routing, cookies and
 * translated copy; this component only owns the menu interaction and metadata.
 */
export function LanguageMenu({
  className,
  currentLabel,
  label,
  options,
  value,
  defaultValue,
  onSelect,
}: LanguageMenuProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.id ?? '');
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<(OptionElement | null)[]>([]);
  const classes = ['game-ui-language-menu', className].filter(Boolean).join(' ');

  const selectedId = value ?? internalValue;
  const linkMode = options.some((option) => option.href !== undefined);
  const isCurrent = (option: LanguageOption): boolean =>
    linkMode ? (option.current ?? option.id === selectedId) : option.id === selectedId;
  const selectedIndex = options.findIndex(isCurrent);
  const selectedOption = options.find((option) => isCurrent(option));
  const triggerLabel = currentLabel ?? selectedOption?.label ?? options[0]?.label ?? '';
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      optionRefs.current[focusIndex]?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusIndex, open]);

  useEffect(() => {
    if (!open) return;
    const closeFromOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeFromOutside);
    return () => document.removeEventListener('pointerdown', closeFromOutside);
  }, [open]);

  const handleSelect = (id: string, link: boolean): void => {
    if (value === undefined) setInternalValue(id);
    onSelect?.(id);
    setOpen(false);
    // A callback menu has no navigation to move focus for us. Native links keep
    // the browser's normal activation and new-tab behavior untouched.
    if (!link) triggerRef.current?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const currentIndex = optionRefs.current.findIndex((element) => element === event.target);
    if (currentIndex < 0 || options.length === 0) return;

    let nextIndex: number | undefined;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % options.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + options.length) % options.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = options.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={classes} ref={menuRef}>
      <button
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        className="game-ui-language-trigger"
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
        data-game-ui-paint=""
      >
        <DropletSurface />
        <Icon icon="globe" size="sm" />
        <span>{triggerLabel}</span>
      </button>
      {open ? (
        <div
          aria-label={label}
          className="game-ui-language-popover"
          id={menuId}
          onKeyDown={handleMenuKeyDown}
          role="menu"
        >
          {options.map((option, index) => (
            <LanguageOptionView
              current={isCurrent(option)}
              key={option.id}
              onSelect={handleSelect}
              option={option}
              setRef={(element) => {
                optionRefs.current[index] = element;
              }}
              tabIndex={index === focusIndex ? 0 : -1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
