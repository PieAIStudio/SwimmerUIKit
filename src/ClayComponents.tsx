import { useEffect, useId, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';

import { CLAY_ASSETS, getClayIconPath, type ClayIconName, type ClayIconStyle } from './clay/assets';

export type GameBadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'ai';

export interface GameBadgeProps {
  children: ReactNode;
  className?: string;
  tone?: GameBadgeTone;
}

export function GameBadge({ children, className, tone = 'neutral' }: GameBadgeProps): ReactNode {
  const classes = ['game-ui-badge', className].filter(Boolean).join(' ');
  return (
    <span className={classes} data-badge-tone={tone}>
      {children}
    </span>
  );
}

export interface GameAssetIconProps {
  className?: string;
  icon: ClayIconName;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Visual family. 'game' (default) is the colorful sculpted clay object;
   * 'line' is the flat white glyph alternate. Falls back automatically when an
   * icon only ships one family.
   */
  style?: ClayIconStyle;
  useSourceAsset?: boolean;
}

export function GameAssetIcon({ className, icon, label, size = 'md', style, useSourceAsset = false }: GameAssetIconProps): ReactNode {
  const classes = ['game-ui-asset-icon', className].filter(Boolean).join(' ');
  const accessibilityProps = label ? { 'aria-label': label } : { 'aria-hidden': true };
  const src = getClayIconPath(icon, { ...(style ? { style } : {}), ...(useSourceAsset ? { inline: false } : {}) });
  return (
    <span className={classes} data-icon-size={size} data-icon-style={style ?? 'game'} {...accessibilityProps}>
      <img alt="" src={src} />
    </span>
  );
}

export interface GameHudItem {
  icon?: ClayIconName;
  id: string;
  label: string;
  meta?: string;
  value: string;
}

export interface GameHudProps {
  actions?: ReactNode;
  className?: string;
  items: readonly GameHudItem[];
  label: string;
}

export function GameHud({ actions, className, items, label }: GameHudProps): ReactNode {
  const classes = ['game-ui-hud', className].filter(Boolean).join(' ');
  return (
    <section aria-label={label} className={classes}>
      <div className="game-ui-hud-cluster">
        {items.map((item) => (
          <article className="game-ui-hud-chip" key={item.id}>
            {item.icon ? <GameAssetIcon icon={item.icon} size="md" /> : null}
            <span>
              <small>{item.label}</small>
              <strong>{item.value}</strong>
              {item.meta ? <em>{item.meta}</em> : null}
            </span>
          </article>
        ))}
      </div>
      {actions ? <div className="game-ui-hud-tools">{actions}</div> : null}
    </section>
  );
}

export interface GameCardFanCard {
  id: string;
  icon?: ClayIconName;
  kicker: string;
  title: string;
}

export interface GameCardFanProps {
  cards: readonly GameCardFanCard[];
  className?: string;
  label: string;
}

export function GameCardFan({ cards, className, label }: GameCardFanProps): ReactNode {
  const classes = ['game-ui-card-fan', className].filter(Boolean).join(' ');
  const midpoint = (cards.length - 1) / 2;
  return (
    <div aria-label={label} className={classes} role="list">
      {cards.map((card, index) => {
        const style = {
          '--game-ui-card-index': index,
          '--game-ui-card-offset': index - midpoint,
        } as CSSProperties;
        return (
          <li className="game-ui-card-fan-card" key={card.id} style={style}>
            {card.icon ? <GameAssetIcon icon={card.icon} size="lg" /> : null}
            <small>{card.kicker}</small>
            <strong>{card.title}</strong>
          </li>
        );
      })}
    </div>
  );
}

export interface GameStageTileProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  badge?: string;
  icon?: ClayIconName;
  kicker: string;
  selected?: boolean;
  summary: string;
  title: string;
  tone?: 'daily' | 'portal' | 'host' | 'danger';
}

export function GameStageTile({ badge, className, icon, kicker, selected = false, summary, title, tone = 'daily', type = 'button', ...props }: GameStageTileProps): ReactNode {
  const classes = ['game-ui-stage-tile', className].filter(Boolean).join(' ');
  return (
    <button aria-pressed={selected} className={classes} data-stage-tone={tone} type={type} {...props}>
      {icon ? <GameAssetIcon icon={icon} size="xl" /> : null}
      <span className="game-ui-stage-tile-copy">
        <small>{kicker}</small>
        <strong>{title}</strong>
        <span>{summary}</span>
      </span>
      {badge ? <GameBadge tone={selected ? 'success' : 'neutral'}>{badge}</GameBadge> : null}
    </button>
  );
}

function isPortraitPhoneLike(): boolean {
  if (typeof window === 'undefined') return false;
  const phoneLike = window.matchMedia?.('(pointer: coarse), (max-width: 899px)').matches ?? window.innerWidth < 900;
  return phoneLike && window.innerHeight > window.innerWidth;
}

export interface GameOrientationGateProps {
  body: string;
  cta: string;
  /** Warning badge text. Defaults to "Landscape only". */
  badgeLabel?: string;
  /** Hint shown when the browser blocks the automatic landscape lock. */
  manualHint?: string;
  preview?: boolean;
  title: string;
}

export function GameOrientationGate({ body, cta, badgeLabel = 'Landscape only', manualHint = 'Rotate manually if this browser blocks automatic landscape lock.', preview = false, title }: GameOrientationGateProps): ReactNode {
  const [visible, setVisible] = useState(preview || isPortraitPhoneLike);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (preview) return undefined;
    const update = () => {
      const nextVisible = isPortraitPhoneLike();
      setVisible(nextVisible);
      if (!nextVisible) setMessage('');
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [preview]);

  if (!visible) return null;

  const attemptLandscape = async () => {
    setMessage('');
    if (preview) return;
    try {
      const root = document.documentElement;
      if (!document.fullscreenElement && root.requestFullscreen) await root.requestFullscreen();
      const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: 'landscape-primary') => Promise<void> };
      await orientation.lock?.('landscape-primary');
      setVisible(isPortraitPhoneLike());
    } catch {
      setMessage(manualHint);
    }
  };

  return (
    <aside aria-label={title} className="game-ui-orientation-gate">
      <div className="game-ui-orientation-card">
        <GameAssetIcon icon="mobile" size="xl" />
        <GameBadge tone="warning">{badgeLabel}</GameBadge>
        <h2>{title}</h2>
        <p>{body}</p>
        <button onClick={() => void attemptLandscape()} type="button">
          {cta}
        </button>
        {message ? <small>{message}</small> : null}
      </div>
    </aside>
  );
}

export interface GameLanguageMenuProps {
  className?: string;
  /** Optional override for the trigger label. Defaults to the selected option's label. */
  currentLabel?: string;
  label: string;
  options: readonly { id: string; label: string; meta: string }[];
  /** Controlled selected option id. Omit to let the component own selection. */
  value?: string;
  /** Initial selection when uncontrolled. Defaults to the first option. */
  defaultValue?: string;
  /** Fires with the chosen option id whenever the user picks a language. */
  onSelect?: (id: string) => void;
}

export function GameLanguageMenu({ className, currentLabel, label, options, value, defaultValue, onSelect }: GameLanguageMenuProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.id ?? '');
  const menuId = useId();
  const classes = ['game-ui-language-menu', className].filter(Boolean).join(' ');

  const selectedId = value ?? internalValue;
  const selectedOption = options.find((option) => option.id === selectedId);
  const triggerLabel = currentLabel ?? selectedOption?.label ?? options[0]?.label ?? '';

  const handleSelect = (id: string): void => {
    if (value === undefined) setInternalValue(id);
    onSelect?.(id);
    setOpen(false);
  };

  return (
    <div className={classes}>
      <button aria-controls={menuId} aria-expanded={open} className="game-ui-language-trigger" onClick={() => setOpen((current) => !current)} type="button">
        <GameAssetIcon icon="globe" size="sm" />
        <span>{triggerLabel}</span>
      </button>
      {open ? (
        <div aria-label={label} className="game-ui-language-popover" id={menuId} role="menu">
          {options.map((option) => (
            <button
              aria-checked={option.id === selectedId}
              data-selected={option.id === selectedId}
              key={option.id}
              onClick={() => handleSelect(option.id)}
              role="menuitemradio"
              type="button"
            >
              <span>
                <strong>{option.label}</strong>
                <small>{option.meta}</small>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export interface GameLoadingStateProps {
  label: string;
  tone?: 'loading' | 'error';
}

export function GameLoadingState({ label, tone = 'loading' }: GameLoadingStateProps): ReactNode {
  return (
    <div className="game-ui-loading-state" data-loading-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      <img alt="" src={tone === 'error' ? getClayIconPath('alert') : getClayIconPath('timer')} />
      <span>{label}</span>
    </div>
  );
}

export function getClayCatalogPaths(): typeof CLAY_ASSETS.catalog {
  return CLAY_ASSETS.catalog;
}
