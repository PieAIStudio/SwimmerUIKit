import type { ButtonHTMLAttributes, KeyboardEvent, MouseEventHandler, ReactNode } from 'react';

import { GameAssetIcon, GameBadge, type GameBadgeTone } from './ClayComponents';
import { GameButton, type GameButtonVariant } from './GameButton';
import { GameEmptyState, GameProgress } from './GameDisplay';
import { GameHudActions } from './GameHudActions';
import { GameIconButton, GamePanel } from './GameSurfaces';
import type { ClayIconName } from './clay/assets';

export type GameSurfaceDensity = 'comfortable' | 'dense';
export type GameSurfaceLayout = 'auto' | 'desktop' | 'mobile';
export type GameAssetCardLayout = 'auto' | 'list' | 'rail';

export interface GameShellProps {
  /** Main game runtime surface, usually the host app canvas or 3D scene. */
  children: ReactNode;
  /** Asset/library rail. Kept slot-based so the kit never imports app runtime state. */
  assetLibrary?: ReactNode;
  /** Bottom or floating object/placement controls. */
  bottomBar?: ReactNode;
  className?: string;
  density?: GameSurfaceDensity;
  /** Persistent HUD, facts, chips, or app navigation. */
  hud?: ReactNode;
  layout?: GameSurfaceLayout;
  /** Optional movement affordance, usually `GameMovementPad`. */
  movementPad?: ReactNode;
  /** Modal, toast, onboarding, or non-blocking overlays. */
  overlay?: ReactNode;
  /** Secondary panel slot for inspector/debug/user-owned sidebars. */
  sidePanel?: ReactNode;
  /** Accessible label for the whole game surface. */
  title: string;
}

export function GameShell({
  assetLibrary,
  bottomBar,
  children,
  className,
  density = 'comfortable',
  hud,
  layout = 'auto',
  movementPad,
  overlay,
  sidePanel,
  title,
}: GameShellProps): ReactNode {
  const classes = ['game-ui-shell', className].filter(Boolean).join(' ');
  return (
    <section aria-label={title} className={classes} data-density={density} data-layout={layout}>
      <div className="game-ui-shell-scene">{children}</div>
      {hud ? <div className="game-ui-shell-hud">{hud}</div> : null}
      {assetLibrary ? <aside className="game-ui-shell-library">{assetLibrary}</aside> : null}
      {sidePanel ? <aside className="game-ui-shell-side-panel">{sidePanel}</aside> : null}
      {movementPad ? <div className="game-ui-shell-movement">{movementPad}</div> : null}
      {bottomBar ? <div className="game-ui-shell-bottom-bar">{bottomBar}</div> : null}
      {overlay ? <div className="game-ui-shell-overlay">{overlay}</div> : null}
    </section>
  );
}

export const GameSceneHudLayout = GameShell;
export type GameSceneHudLayoutProps = GameShellProps;

export interface GameFactItem {
  icon?: ClayIconName;
  id: string;
  label: string;
  meta?: string;
  tone?: GameBadgeTone;
  value: ReactNode;
}

export interface GameFactListProps {
  className?: string;
  density?: GameSurfaceDensity;
  facts: readonly GameFactItem[];
  label: string;
  variant?: 'facts' | 'stats';
}

export function GameFactList({ className, density = 'comfortable', facts, label, variant = 'facts' }: GameFactListProps): ReactNode {
  const classes = ['game-ui-fact-list', className].filter(Boolean).join(' ');
  return (
    <section aria-label={label} className={classes} data-density={density} data-variant={variant}>
      {facts.map((fact) => (
        <article className="game-ui-fact" key={fact.id}>
          {fact.icon ? <GameAssetIcon icon={fact.icon} size={density === 'dense' ? 'sm' : 'md'} /> : null}
          <span className="game-ui-fact-copy">
            <small>{fact.label}</small>
            <strong>{fact.value}</strong>
            {fact.meta ? <em>{fact.meta}</em> : null}
          </span>
          {fact.tone ? <GameBadge tone={fact.tone}>{variant === 'stats' ? fact.label : fact.value}</GameBadge> : null}
        </article>
      ))}
    </section>
  );
}

export const GameStatList = GameFactList;
export type GameStatListProps = GameFactListProps;

export type GameActionStyle = 'button' | 'icon';

export interface GameUiAction {
  badge?: string;
  disabled?: boolean;
  icon?: ClayIconName;
  id: string;
  label: string;
  meta?: string;
  onAction?: (id: string) => void;
  selected?: boolean;
  shortcut?: string;
  tone?: GameButtonVariant;
}

export interface GameActionGridProps {
  actions: readonly GameUiAction[];
  className?: string;
  density?: GameSurfaceDensity;
  label: string;
  style?: GameActionStyle;
}

export function GameActionGrid({ actions, className, density = 'comfortable', label, style = 'button' }: GameActionGridProps): ReactNode {
  const classes = ['game-ui-action-grid', className].filter(Boolean).join(' ');
  return (
    <GameHudActions className={classes} label={label}>
      <span className="game-ui-sr-only">{label}</span>
      {actions.map((action) => {
        const content = (
          <>
            {action.icon ? <GameAssetIcon icon={action.icon} size={density === 'dense' ? 'sm' : 'md'} {...(style === 'icon' ? { style: 'line' as const } : {})} /> : null}
            {style === 'button' ? <span>{action.label}</span> : null}
            {action.badge ? <GameBadge tone={action.selected ? 'success' : 'neutral'}>{action.badge}</GameBadge> : null}
            {action.shortcut ? <kbd>{action.shortcut}</kbd> : null}
          </>
        );
        const runAction = (): void => action.onAction?.(action.id);

        if (style === 'icon') {
          return (
            <GameIconButton
              aria-pressed={action.selected}
              className="game-ui-action-grid-button"
              disabled={action.disabled}
              key={action.id}
              label={action.label}
              onClick={runAction}
            >
              {content}
            </GameIconButton>
          );
        }

        return (
          <GameButton
            aria-pressed={action.selected}
            className="game-ui-action-grid-button"
            disabled={action.disabled}
            key={action.id}
            onClick={runAction}
            variant={action.tone ?? 'secondary'}
          >
            {content}
          </GameButton>
        );
      })}
    </GameHudActions>
  );
}

export type GameMovementDirection = 'forward' | 'backward' | 'left' | 'right' | 'up' | 'down' | 'reset';

export interface GameMovementAction {
  direction: GameMovementDirection;
  disabled?: boolean;
  icon?: ClayIconName;
  label: string;
  shortcut?: string;
  symbol?: string;
}

export interface GameMovementPadProps {
  actions?: readonly GameMovementAction[];
  className?: string;
  density?: GameSurfaceDensity;
  disabled?: boolean;
  helpText?: string;
  label: string;
  layout?: 'dpad' | 'row';
  onMove?: (direction: GameMovementDirection) => void;
}

const DEFAULT_MOVEMENT_ACTIONS: readonly GameMovementAction[] = [
  { direction: 'forward', label: 'Move forward', shortcut: 'W / ↑', symbol: '↑' },
  { direction: 'left', label: 'Move left', shortcut: 'A / ←', symbol: '←' },
  { direction: 'right', label: 'Move right', shortcut: 'D / →', symbol: '→' },
  { direction: 'backward', label: 'Move backward', shortcut: 'S / ↓', symbol: '↓' },
];

const MOVEMENT_KEY_MAP: Readonly<Record<string, GameMovementDirection>> = {
  ArrowUp: 'forward',
  w: 'forward',
  W: 'forward',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
  ArrowDown: 'backward',
  s: 'backward',
  S: 'backward',
  ' ': 'reset',
};

export function GameMovementPad({
  actions = DEFAULT_MOVEMENT_ACTIONS,
  className,
  density = 'comfortable',
  disabled = false,
  helpText,
  label,
  layout = 'dpad',
  onMove,
}: GameMovementPadProps): ReactNode {
  const classes = ['game-ui-movement-pad', className].filter(Boolean).join(' ');
  const triggerMove = (direction: GameMovementDirection): void => {
    if (!disabled) onMove?.(direction);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const direction = MOVEMENT_KEY_MAP[event.key];
    if (!direction) return;
    const action = actions.find((item) => item.direction === direction);
    if (!action || action.disabled || disabled) return;
    event.preventDefault();
    triggerMove(direction);
  };

  return (
    <section aria-label={label} className={classes} data-density={density} data-layout={layout} onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="game-ui-movement-pad-grid">
        {actions.map((action) => (
          <GameIconButton
            className="game-ui-movement-button"
            data-direction={action.direction}
            disabled={disabled || action.disabled}
            key={action.direction}
            label={action.label}
            onClick={() => triggerMove(action.direction)}
          >
            {action.icon ? <GameAssetIcon icon={action.icon} size={density === 'dense' ? 'sm' : 'md'} style="line" /> : <span aria-hidden="true">{action.symbol ?? action.label}</span>}
            {action.shortcut ? <kbd>{action.shortcut}</kbd> : null}
          </GameIconButton>
        ))}
      </div>
      {helpText ? <p>{helpText}</p> : null}
    </section>
  );
}

export type GameAssetSource = 'starter' | 'generated' | 'imported';
export type GameAssetStatus = 'ready' | 'generating' | 'missing' | 'placed' | 'selected' | 'error';

export interface GameAssetFact {
  id: string;
  label: string;
  value: string;
}

export interface GameAssetBadge {
  label: string;
  tone?: GameBadgeTone;
}

export interface GameAssetCardProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onSelect'> {
  assetId: string;
  badges?: readonly GameAssetBadge[];
  cardLayout?: Exclude<GameAssetCardLayout, 'auto'>;
  description?: string;
  facts?: readonly GameAssetFact[];
  icon?: ClayIconName;
  onSelect?: (assetId: string) => void;
  selected?: boolean;
  source: GameAssetSource;
  sourceLabel?: string;
  status?: GameAssetStatus;
  statusLabel?: string;
  thumbnailAlt?: string;
  thumbnailSrc?: string;
  title: string;
}

const ASSET_SOURCE_LABELS: Readonly<Record<GameAssetSource, string>> = {
  generated: 'Generated',
  imported: 'Imported',
  starter: 'Starter',
};

const ASSET_SOURCE_TONES: Readonly<Record<GameAssetSource, GameBadgeTone>> = {
  generated: 'ai',
  imported: 'warning',
  starter: 'neutral',
};

const ASSET_STATUS_TONES: Readonly<Record<GameAssetStatus, GameBadgeTone>> = {
  error: 'danger',
  generating: 'ai',
  missing: 'danger',
  placed: 'success',
  ready: 'neutral',
  selected: 'success',
};

export function GameAssetCard({
  assetId,
  badges = [],
  cardLayout = 'list',
  className,
  description,
  disabled,
  facts = [],
  icon = 'gem',
  onClick,
  onSelect,
  selected = false,
  source,
  sourceLabel,
  status = 'ready',
  statusLabel,
  thumbnailAlt = '',
  thumbnailSrc,
  title,
  type = 'button',
  ...props
}: GameAssetCardProps): ReactNode {
  const classes = ['game-ui-asset-card', className].filter(Boolean).join(' ');
  const resolvedSourceLabel = sourceLabel ?? ASSET_SOURCE_LABELS[source];
  const resolvedStatusLabel = statusLabel ?? status;
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented) onSelect?.(assetId);
  };

  return (
    <button
      aria-pressed={selected}
      className={classes}
      data-asset-card-layout={cardLayout}
      data-asset-source={source}
      data-asset-status={status}
      disabled={disabled}
      onClick={handleClick}
      type={type}
      {...props}
    >
      <span className="game-ui-asset-card-preview">
        {thumbnailSrc ? <img alt={thumbnailAlt} src={thumbnailSrc} /> : <GameAssetIcon className="game-ui-asset-card-icon" icon={icon} size="xl" />}
      </span>
      <span className="game-ui-asset-card-copy">
        <span className="game-ui-asset-card-badges">
          <GameBadge tone={ASSET_SOURCE_TONES[source]}>{resolvedSourceLabel}</GameBadge>
          <GameBadge tone={ASSET_STATUS_TONES[status]}>{resolvedStatusLabel}</GameBadge>
          {badges.map((badge) => <GameBadge key={badge.label} tone={badge.tone ?? 'neutral'}>{badge.label}</GameBadge>)}
        </span>
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
        {facts.length > 0 ? (
          <span className="game-ui-asset-card-facts">
            {facts.map((fact) => (
              <span key={fact.id}>
                <small>{fact.label}</small>
                <b>{fact.value}</b>
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export interface GameAssetGroup {
  assets: readonly Omit<GameAssetCardProps, 'onSelect' | 'selected'>[];
  id: string;
  label: string;
  source?: GameAssetSource;
}

export interface GameAssetLibraryProps {
  cardLayout?: GameAssetCardLayout;
  className?: string;
  density?: GameSurfaceDensity;
  emptyAction?: ReactNode;
  emptyDescription?: string;
  emptyTitle?: string;
  groups: readonly GameAssetGroup[];
  label: string;
  onSelectAsset?: (assetId: string) => void;
  selectedAssetId?: string;
  subtitle?: string;
  title: string;
}

export function GameAssetLibrary({
  cardLayout = 'auto',
  className,
  density = 'comfortable',
  emptyAction,
  emptyDescription = 'Assets will appear here when they are ready to place.',
  emptyTitle = 'No assets ready',
  groups,
  label,
  onSelectAsset,
  selectedAssetId,
  subtitle,
  title,
}: GameAssetLibraryProps): ReactNode {
  const classes = ['game-ui-asset-library', className].filter(Boolean).join(' ');
  const totalAssets = groups.reduce((sum, group) => sum + group.assets.length, 0);
  const sourceCounts = groups.reduce<Record<GameAssetSource, number>>((counts, group) => {
    group.assets.forEach((asset) => {
      counts[asset.source] += 1;
    });
    return counts;
  }, { generated: 0, imported: 0, starter: 0 });

  return (
    <GamePanel className={classes} data-card-layout={cardLayout} title={title} tone="strong">
      <section aria-label={label} data-density={density}>
        {subtitle ? <p className="game-ui-asset-library-subtitle">{subtitle}</p> : null}
        <div aria-label="Asset source counts" className="game-ui-asset-library-counts">
          {Object.entries(sourceCounts).map(([source, count]) => (
            <GameBadge key={source} tone={ASSET_SOURCE_TONES[source as GameAssetSource]}>
              {ASSET_SOURCE_LABELS[source as GameAssetSource]} {count}
            </GameBadge>
          ))}
        </div>
        {totalAssets === 0 ? (
          <GameEmptyState action={emptyAction} description={emptyDescription} icon="gem" title={emptyTitle} />
        ) : (
          <div className="game-ui-asset-library-groups">
            {groups.map((group) => (
              <section aria-label={group.label} className="game-ui-asset-library-group" data-asset-source={group.source} key={group.id}>
                <header>
                  <strong>{group.label}</strong>
                  {group.source ? <GameBadge tone={ASSET_SOURCE_TONES[group.source]}>{ASSET_SOURCE_LABELS[group.source]}</GameBadge> : null}
                </header>
                <div className="game-ui-asset-library-grid">
                  {group.assets.map((asset) => {
                    const resolvedCardLayout = cardLayout === 'auto' ? asset.cardLayout : cardLayout;

                    return (
                      <GameAssetCard
                        key={asset.assetId}
                        {...asset}
                        {...(resolvedCardLayout ? { cardLayout: resolvedCardLayout } : {})}
                        {...(onSelectAsset ? { onSelect: onSelectAsset } : {})}
                        selected={asset.assetId === selectedAssetId}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </GamePanel>
  );
}

export interface GamePlacementToolbarProps {
  actions?: readonly GameUiAction[];
  capacityLabel?: string;
  className?: string;
  density?: GameSurfaceDensity;
  maxObjects?: number;
  objectActions?: readonly GameUiAction[];
  placedObjects?: number;
  selectedLabel?: string;
  selectedTitle?: string;
  statusLabel?: string;
  statusTone?: GameBadgeTone;
  statusValue?: string;
  title: string;
}

export function GamePlacementToolbar({
  actions = [],
  capacityLabel = 'Objects',
  className,
  density = 'comfortable',
  maxObjects,
  objectActions = [],
  placedObjects,
  selectedLabel = 'Selected',
  selectedTitle,
  statusLabel = 'Status',
  statusTone = 'neutral',
  statusValue = 'Idle',
  title,
}: GamePlacementToolbarProps): ReactNode {
  const classes = ['game-ui-placement-toolbar', className].filter(Boolean).join(' ');
  const hasCapacity = typeof placedObjects === 'number' && typeof maxObjects === 'number';
  const progressValue = hasCapacity && maxObjects > 0 ? Math.min(maxObjects, placedObjects) : 0;
  const factItems: GameFactItem[] = [
    { icon: 'gem', id: 'selected', label: selectedLabel, value: selectedTitle ?? 'None' },
    { icon: 'check', id: 'status', label: statusLabel, tone: statusTone, value: statusValue },
  ];

  return (
    <GamePanel className={classes} title={title} tone="strong">
      <div data-density={density}>
        <GameFactList density={density} facts={factItems} label={`${title} facts`} />
        {hasCapacity ? (
          <GameProgress label={capacityLabel} max={maxObjects} showValue tone={progressValue >= maxObjects ? 'warning' : 'success'} value={progressValue} />
        ) : null}
        {actions.length > 0 ? <GameActionGrid actions={actions} density={density} label={`${title} actions`} /> : null}
        {objectActions.length > 0 ? <GameActionGrid actions={objectActions} density={density} label={`${title} object actions`} style="icon" /> : null}
      </div>
    </GamePanel>
  );
}

export const GameObjectToolbar = GamePlacementToolbar;
export type GameObjectToolbarProps = GamePlacementToolbarProps;
