import type { ChangeEvent, CSSProperties, ReactNode } from 'react';

import { GameAssetIcon, GameBadge, type GameBadgeTone } from './ClayComponents';
import { GameEmptyState, GameProgress } from './GameDisplay';
import { GameButton, type GameButtonVariant } from './GameButton';
import { GameActionGrid, type GameActionIconLabelMode, type GameSurfaceDensity, type GameUiAction } from './GameSurfacePack';
import { GameField } from './GameForms';
import { GamePanel } from './GameSurfaces';
import type { ClayIconName } from './clay/assets';

export type GameTerrainBuildVariant = 'desktop' | 'dense' | 'mobile' | 'small-mobile';
export type GameTerrainBuildModeId = 'terrain' | 'build' | 'place' | 'inspect';
export type GameTerrainToolId = 'raise' | 'lower' | 'flatten' | 'smooth' | 'paint';
export type GameTerrainToolCompactLabelMode = 'auto' | GameActionIconLabelMode;
export type GameTerrainMaterialPattern = 'solid' | 'speckled' | 'hatched' | 'grid';
export type GameTerrainStatusTone = Extract<GameBadgeTone, 'neutral' | 'success' | 'warning' | 'danger' | 'ai'>;
export type GameBuildItemStatus = 'ready' | 'selected' | 'locked' | 'missing' | 'progress' | 'error';
export type GameBuildCategoryId = 'foundation' | 'wall' | 'opening' | 'roof' | 'prop' | 'house' | string;

export interface GameTerrainBuildModeOption {
  /** Accessible label override when compact labels are used visually. */
  ariaLabel?: string;
  compactLabel?: string;
  disabled?: boolean;
  icon?: ClayIconName;
  id: GameTerrainBuildModeId | string;
  label: string;
  meta?: string;
}

export interface GameTerrainToolOption {
  /** Accessible label override when icon/caption controls use short copy. */
  ariaLabel?: string;
  compactLabel?: string;
  disabled?: boolean;
  icon?: ClayIconName;
  id: GameTerrainToolId | string;
  label: string;
  meta?: string;
  shortcut?: string;
}

export interface GameTerrainMaterialSwatch {
  color: string;
  compactLabel?: string;
  disabled?: boolean;
  id: string;
  label: string;
  meta?: string;
  pattern?: GameTerrainMaterialPattern;
  secondaryColor?: string;
}

export interface GameBrushControlLabels {
  radius?: string;
  strength?: string;
  radiusHint?: string;
  strengthHint?: string;
}

export interface GameBrushControlState {
  disabled?: boolean;
  maxRadius?: number;
  maxStrength?: number;
  minRadius?: number;
  minStrength?: number;
  radius: number;
  radiusStep?: number;
  strength: number;
  strengthStep?: number;
}

export interface GameBuildItem {
  badges?: readonly { label: string; tone?: GameBadgeTone }[];
  compactLabel?: string;
  description?: string;
  disabled?: boolean;
  icon?: ClayIconName;
  id: string;
  label: string;
  meta?: string;
  previewAlt?: string;
  previewSrc?: string;
  status?: GameBuildItemStatus;
}

export interface GameBuildCategory {
  compactLabel?: string;
  disabled?: boolean;
  icon?: ClayIconName;
  id: GameBuildCategoryId;
  items: readonly GameBuildItem[];
  label: string;
  meta?: string;
}

export interface GameTerrainStatusState {
  description?: string;
  label: string;
  progressLabel?: string;
  progressMax?: number;
  progressValue?: number;
  tone?: GameTerrainStatusTone;
}

export interface GameUndoRedoState {
  canRedo?: boolean | undefined;
  canUndo?: boolean | undefined;
  redoLabel?: string | undefined;
  undoLabel?: string | undefined;
}

export interface GameTerrainModeControlProps {
  activeModeId: string;
  className?: string;
  disabled?: boolean;
  label: string;
  modes: readonly GameTerrainBuildModeOption[];
  onModeChange?: ((modeId: string) => void) | undefined;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

export interface GameTerrainToolStripProps {
  activeToolId: string;
  className?: string;
  compactLabelMode?: GameTerrainToolCompactLabelMode;
  density?: GameSurfaceDensity;
  disabled?: boolean;
  label: string;
  onToolChange?: ((toolId: string) => void) | undefined;
  tools: readonly GameTerrainToolOption[];
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

export interface GameBrushControlsProps {
  className?: string;
  labels?: GameBrushControlLabels;
  onRadiusChange?: ((radius: number) => void) | undefined;
  onStrengthChange?: ((strength: number) => void) | undefined;
  state: GameBrushControlState;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

export interface GameMaterialSwatchesProps {
  activeMaterialId?: string | undefined;
  className?: string;
  disabled?: boolean;
  label: string;
  materials: readonly GameTerrainMaterialSwatch[];
  onMaterialChange?: ((materialId: string) => void) | undefined;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

export interface GameUndoRedoActionsProps extends GameUndoRedoState {
  className?: string;
  disabled?: boolean;
  label: string;
  onRedo?: (() => void) | undefined;
  onUndo?: (() => void) | undefined;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

export interface GameBuildLibraryProps {
  activeCategoryId?: string | undefined;
  categories: readonly GameBuildCategory[];
  className?: string;
  density?: GameSurfaceDensity;
  emptyDescription?: string;
  emptyTitle?: string;
  label: string;
  onCategoryChange?: ((categoryId: string) => void) | undefined;
  onSelectItem?: ((itemId: string, categoryId: string) => void) | undefined;
  selectedItemId?: string | undefined;
  title: string;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

export interface GameCompactGameDrawerProps {
  children: ReactNode;
  className?: string;
  closeIcon?: ClayIconName;
  closeLabel?: string;
  disabled?: boolean;
  label: string;
  onOpenChange?: ((open: boolean) => void) | undefined;
  open: boolean;
  panelId?: string;
  title: string;
  triggerIcon?: ClayIconName;
  triggerLabel?: string;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

export interface GameTerrainBuildToolboxProps {
  activeBuildCategoryId?: string | undefined;
  activeMaterialId?: string | undefined;
  activeModeId: string;
  activeToolId: string;
  brush: GameBrushControlState;
  buildCategories?: readonly GameBuildCategory[] | undefined;
  className?: string;
  density?: GameSurfaceDensity;
  disabled?: boolean;
  drawerOpen?: boolean;
  drawerTitle?: string;
  label: string;
  materials?: readonly GameTerrainMaterialSwatch[] | undefined;
  modes: readonly GameTerrainBuildModeOption[];
  onBrushRadiusChange?: ((radius: number) => void) | undefined;
  onBrushStrengthChange?: ((strength: number) => void) | undefined;
  onBuildCategoryChange?: ((categoryId: string) => void) | undefined;
  onDrawerOpenChange?: ((open: boolean) => void) | undefined;
  onMaterialChange?: ((materialId: string) => void) | undefined;
  onModeChange?: ((modeId: string) => void) | undefined;
  onRedo?: (() => void) | undefined;
  onSelectBuildItem?: ((itemId: string, categoryId: string) => void) | undefined;
  onToolChange?: ((toolId: string) => void) | undefined;
  onUndo?: (() => void) | undefined;
  selectedBuildItemId?: string | undefined;
  status?: GameTerrainStatusState | undefined;
  title: string;
  toolCompactLabelMode?: GameTerrainToolCompactLabelMode;
  tools: readonly GameTerrainToolOption[];
  undoRedo?: GameUndoRedoState | undefined;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

const TOOL_ICONS: Readonly<Record<string, ClayIconName>> = {
  build: 'home',
  flatten: 'card',
  inspect: 'compass',
  lower: 'close',
  paint: 'gem',
  place: 'gem',
  raise: 'energy',
  smooth: 'lucky',
  terrain: 'portal',
};

const BUILD_STATUS_TONES: Readonly<Record<GameBuildItemStatus, GameBadgeTone>> = {
  error: 'danger',
  locked: 'warning',
  missing: 'danger',
  progress: 'ai',
  ready: 'neutral',
  selected: 'success',
};

function toAction(option: GameTerrainToolOption, activeToolId: string, onToolChange?: (toolId: string) => void, disabled?: boolean): GameUiAction {
  const action: GameUiAction = {
    disabled: Boolean(disabled || option.disabled),
    icon: option.icon ?? TOOL_ICONS[option.id] ?? 'gem',
    id: option.id,
    label: option.label,
    selected: option.id === activeToolId,
    tone: option.id === activeToolId ? 'primary' : 'secondary',
  };
  if (option.ariaLabel) action.ariaLabel = option.ariaLabel;
  if (option.compactLabel) action.compactLabel = option.compactLabel;
  if (option.meta) action.meta = option.meta;
  if (option.shortcut) action.shortcut = option.shortcut;
  if (onToolChange) action.onAction = onToolChange;
  return action;
}

function normalizeNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function dataVariant(variant: GameTerrainBuildVariant): GameTerrainBuildVariant {
  return variant;
}

function resolveCompactLabelMode(mode: GameTerrainToolCompactLabelMode, variant: GameTerrainBuildVariant): GameActionIconLabelMode {
  if (mode !== 'auto') return mode;
  return variant === 'mobile' || variant === 'small-mobile' ? 'caption' : 'hidden';
}

export function GameTerrainModeControl({
  activeModeId,
  className,
  disabled = false,
  label,
  modes,
  onModeChange,
  variant = 'desktop',
  'data-testid': testId,
}: GameTerrainModeControlProps): ReactNode {
  const classes = ['game-ui-terrain-mode-control', className].filter(Boolean).join(' ');

  return (
    <section aria-label={label} className={classes} data-ui-hook="terrain-mode-control" data-variant={dataVariant(variant)} data-testid={testId}>
      <span className="game-ui-sr-only">{label}</span>
      <div className="game-ui-terrain-mode-options" role="group">
        {modes.map((mode) => {
          const selected = mode.id === activeModeId;
          const buttonDisabled = disabled || mode.disabled;
          const displayLabel = variant === 'small-mobile' ? mode.compactLabel ?? mode.label : mode.label;
          return (
            <button
              aria-describedby={mode.meta ? `${mode.id}-mode-meta` : undefined}
              aria-label={mode.ariaLabel ?? mode.label}
              aria-pressed={selected}
              className="game-ui-terrain-mode-option"
              data-mode-id={mode.id}
              data-selected={selected ? 'true' : 'false'}
              disabled={buttonDisabled}
              key={mode.id}
              onClick={onModeChange && !buttonDisabled ? () => onModeChange(mode.id) : undefined}
              type="button"
            >
              <GameAssetIcon icon={mode.icon ?? TOOL_ICONS[mode.id] ?? 'portal'} size={variant === 'small-mobile' ? 'sm' : 'md'} style="line" />
              <span>{displayLabel}</span>
              {mode.meta ? <small id={`${mode.id}-mode-meta`}>{mode.meta}</small> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function GameTerrainToolStrip({
  activeToolId,
  className,
  compactLabelMode = 'auto',
  density = 'comfortable',
  disabled = false,
  label,
  onToolChange,
  tools,
  variant = 'desktop',
  'data-testid': testId,
}: GameTerrainToolStripProps): ReactNode {
  const classes = ['game-ui-terrain-tool-strip', className].filter(Boolean).join(' ');
  const iconLabelMode = resolveCompactLabelMode(compactLabelMode, variant);
  return (
    <section aria-label={label} className={classes} data-active-tool={activeToolId} data-icon-label-mode={iconLabelMode} data-ui-hook="terrain-tool-strip" data-variant={variant} data-testid={testId}>
      <GameActionGrid
        actions={tools.map((tool) => toAction(tool, activeToolId, onToolChange, disabled))}
        density={density}
        iconLabelMode={iconLabelMode}
        label={label}
        style={variant === 'desktop' ? 'button' : 'icon'}
      />
    </section>
  );
}

export function GameBrushControls({
  className,
  labels = {},
  onRadiusChange,
  onStrengthChange,
  state,
  variant = 'desktop',
  'data-testid': testId,
}: GameBrushControlsProps): ReactNode {
  const classes = ['game-ui-brush-controls', className].filter(Boolean).join(' ');
  const minRadius = state.minRadius ?? 1;
  const maxRadius = state.maxRadius ?? 8;
  const radiusStep = state.radiusStep ?? 0.25;
  const minStrength = state.minStrength ?? 0;
  const maxStrength = state.maxStrength ?? 1;
  const strengthStep = state.strengthStep ?? 0.05;
  const radius = normalizeNumber(state.radius, minRadius, maxRadius);
  const strength = normalizeNumber(state.strength, minStrength, maxStrength);
  const disabled = Boolean(state.disabled);

  const handleRadiusChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onRadiusChange?.(normalizeNumber(Number(event.currentTarget.value), minRadius, maxRadius));
  };
  const handleStrengthChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onStrengthChange?.(normalizeNumber(Number(event.currentTarget.value), minStrength, maxStrength));
  };

  return (
    <section className={classes} data-ui-hook="brush-controls" data-variant={variant} data-testid={testId}>
      <GameField {...(labels.radiusHint ? { hint: labels.radiusHint } : {})} label={labels.radius ?? 'Brush radius'}>
        <div className="game-ui-brush-control-row" data-control="radius">
          <input
            aria-label={labels.radius ?? 'Brush radius'}
            className="game-ui-brush-range"
            disabled={disabled}
            max={maxRadius}
            min={minRadius}
            onChange={onRadiusChange ? handleRadiusChange : undefined}
            readOnly={!onRadiusChange}
            step={radiusStep}
            type="range"
            value={radius}
          />
          <input
            aria-label={`${labels.radius ?? 'Brush radius'} value`}
            className="game-ui-brush-number"
            disabled={disabled}
            max={maxRadius}
            min={minRadius}
            onChange={onRadiusChange ? handleRadiusChange : undefined}
            readOnly={!onRadiusChange}
            step={radiusStep}
            type="number"
            value={radius}
          />
        </div>
      </GameField>
      <GameField {...(labels.strengthHint ? { hint: labels.strengthHint } : {})} label={labels.strength ?? 'Brush strength'}>
        <div className="game-ui-brush-control-row" data-control="strength">
          <input
            aria-label={labels.strength ?? 'Brush strength'}
            className="game-ui-brush-range"
            disabled={disabled}
            max={maxStrength}
            min={minStrength}
            onChange={onStrengthChange ? handleStrengthChange : undefined}
            readOnly={!onStrengthChange}
            step={strengthStep}
            type="range"
            value={strength}
          />
          <input
            aria-label={`${labels.strength ?? 'Brush strength'} value`}
            className="game-ui-brush-number"
            disabled={disabled}
            max={maxStrength}
            min={minStrength}
            onChange={onStrengthChange ? handleStrengthChange : undefined}
            readOnly={!onStrengthChange}
            step={strengthStep}
            type="number"
            value={strength}
          />
        </div>
      </GameField>
    </section>
  );
}

export function GameMaterialSwatches({
  activeMaterialId,
  className,
  disabled = false,
  label,
  materials,
  onMaterialChange,
  variant = 'desktop',
  'data-testid': testId,
}: GameMaterialSwatchesProps): ReactNode {
  const classes = ['game-ui-material-swatches', className].filter(Boolean).join(' ');
  return (
    <section aria-label={label} className={classes} data-ui-hook="material-swatches" data-variant={variant} data-testid={testId}>
      <div className="game-ui-material-swatch-grid" role="listbox" aria-label={label}>
        {materials.map((material) => {
          const selected = material.id === activeMaterialId;
          const buttonDisabled = disabled || material.disabled;
          const displayLabel = variant === 'small-mobile' ? material.compactLabel ?? material.label : material.label;
          const swatchStyle = {
            '--swatch-color': material.color,
            '--swatch-secondary-color': material.secondaryColor ?? material.color,
          } as CSSProperties;
          return (
            <button
              aria-describedby={material.meta ? `${material.id}-material-meta` : undefined}
              aria-label={material.label}
              aria-selected={selected}
              className="game-ui-material-swatch"
              data-material-id={material.id}
              disabled={buttonDisabled}
              key={material.id}
              onClick={onMaterialChange && !buttonDisabled ? () => onMaterialChange(material.id) : undefined}
              role="option"
              type="button"
            >
              <span aria-hidden="true" className="game-ui-material-swatch-chip" data-swatch-pattern={material.pattern ?? 'solid'} style={swatchStyle} />
              <span className="game-ui-material-swatch-copy">
                <strong>{displayLabel}</strong>
                {material.meta ? <small id={`${material.id}-material-meta`}>{material.meta}</small> : null}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function GameUndoRedoActions({
  canRedo = false,
  canUndo = false,
  className,
  disabled = false,
  label,
  onRedo,
  onUndo,
  redoLabel = 'Redo',
  undoLabel = 'Undo',
  variant = 'desktop',
  'data-testid': testId,
}: GameUndoRedoActionsProps): ReactNode {
  const classes = ['game-ui-undo-redo-actions', className].filter(Boolean).join(' ');
  const actions: GameUiAction[] = [
    { disabled: disabled || !canUndo, icon: 'undo', id: 'undo', label: undoLabel, onAction: (_id) => { onUndo?.(); }, shortcut: '⌘Z' },
    { disabled: disabled || !canRedo, icon: 'redo', id: 'redo', label: redoLabel, onAction: (_id) => { onRedo?.(); }, shortcut: '⇧⌘Z' },
  ];
  return (
    <section aria-label={label} className={classes} data-ui-hook="undo-redo-actions" data-variant={variant} data-testid={testId}>
      <GameActionGrid actions={actions} density="dense" label={label} style="icon" />
    </section>
  );
}

export function GameBuildLibrary({
  activeCategoryId,
  categories,
  className,
  density = 'comfortable',
  emptyDescription = 'Building pieces will appear here when a category is available.',
  emptyTitle = 'No build pieces ready',
  label,
  onCategoryChange,
  onSelectItem,
  selectedItemId,
  title,
  variant = 'desktop',
  'data-testid': testId,
}: GameBuildLibraryProps): ReactNode {
  const classes = ['game-ui-build-library', className].filter(Boolean).join(' ');
  const enabledCategories = categories.filter((category) => !category.disabled);
  const resolvedActiveCategory = categories.find((category) => category.id === activeCategoryId) ?? enabledCategories[0] ?? categories[0];
  const items = resolvedActiveCategory?.items ?? [];
  const isRail = variant === 'small-mobile';

  return (
    <GamePanel className={classes} data-ui-hook="build-library" data-variant={variant} data-testid={testId} title={title} tone="strong">
      <section aria-label={label} data-density={density}>
        <div aria-label="Build categories" className="game-ui-build-categories" role="tablist">
          {categories.map((category) => {
            const selected = category.id === resolvedActiveCategory?.id;
            const categoryLabel = variant === 'small-mobile' ? category.compactLabel ?? category.label : category.label;
            return (
              <button
                aria-controls={`${category.id}-build-panel`}
                aria-label={category.label}
                aria-selected={selected}
                className="game-ui-build-category"
                data-build-category-id={category.id}
                disabled={category.disabled}
                key={category.id}
                onClick={onCategoryChange && !category.disabled ? () => onCategoryChange(category.id) : undefined}
                role="tab"
                type="button"
              >
                <GameAssetIcon icon={category.icon ?? TOOL_ICONS[category.id] ?? 'home'} size="sm" style="line" />
                <span>{categoryLabel}</span>
                {category.meta ? <small>{category.meta}</small> : null}
              </button>
            );
          })}
        </div>
        {items.length === 0 || !resolvedActiveCategory ? (
          <GameEmptyState description={emptyDescription} icon="home" title={emptyTitle} />
        ) : (
          <div aria-label={`${resolvedActiveCategory.label} pieces`} className="game-ui-build-items" data-card-layout={isRail ? 'rail' : 'list'} id={`${resolvedActiveCategory.id}-build-panel`} role="tabpanel">
            {items.map((item) => {
              const selected = item.id === selectedItemId || item.status === 'selected';
              const status = selected ? 'selected' : item.status ?? 'ready';
              const itemDisabled = Boolean(item.disabled || status === 'locked' || status === 'missing');
              const itemLabel = isRail ? item.compactLabel ?? item.label : item.label;
              return (
                <button
                  aria-label={`${item.label}, ${status}`}
                  aria-pressed={selected}
                  className="game-ui-build-item"
                  data-build-category-id={resolvedActiveCategory.id}
                  data-build-item-id={item.id}
                  data-build-item-status={status}
                  disabled={itemDisabled}
                  key={item.id}
                  onClick={onSelectItem && !itemDisabled ? () => onSelectItem(item.id, resolvedActiveCategory.id) : undefined}
                  type="button"
                >
                  <span className="game-ui-build-item-icon">
                    {item.previewSrc ? <img alt={item.previewAlt ?? ''} className="game-ui-build-item-preview" src={item.previewSrc} /> : <GameAssetIcon icon={item.icon ?? resolvedActiveCategory.icon ?? 'home'} size={isRail ? 'sm' : 'md'} />}
                  </span>
                  <span className="game-ui-build-item-copy">
                    <span className="game-ui-build-item-badges">
                      <GameBadge tone={BUILD_STATUS_TONES[status]}>{status}</GameBadge>
                      {item.badges?.map((badge) => <GameBadge key={badge.label} tone={badge.tone ?? 'neutral'}>{badge.label}</GameBadge>)}
                    </span>
                    <strong>{itemLabel}</strong>
                    {item.description ? <span>{item.description}</span> : null}
                    {item.meta ? <small>{item.meta}</small> : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </GamePanel>
  );
}

export function GameCompactGameDrawer({
  children,
  className,
  closeIcon = 'close',
  closeLabel = 'Close tools',
  disabled = false,
  label,
  onOpenChange,
  open,
  panelId: providedPanelId,
  title,
  triggerIcon = 'settings',
  triggerLabel = 'Tools',
  variant = 'mobile',
  'data-testid': testId,
}: GameCompactGameDrawerProps): ReactNode {
  const classes = ['game-ui-compact-game-drawer', className].filter(Boolean).join(' ');
  const panelId = providedPanelId ?? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'tools'}-drawer-panel`;
  return (
    <aside aria-label={label} className={classes} data-open={open ? 'true' : 'false'} data-ui-hook="compact-game-drawer" data-variant={variant} data-testid={testId}>
      <GameButton
        aria-controls={panelId}
        aria-expanded={open}
        className="game-ui-compact-game-drawer-trigger"
        disabled={disabled}
        onClick={onOpenChange ? () => onOpenChange(!open) : undefined}
        type="button"
        variant="secondary"
      >
        <GameAssetIcon icon={open ? closeIcon : triggerIcon} size="sm" style="line" />
        {open ? closeLabel : triggerLabel}
      </GameButton>
      <div aria-hidden={!open} className="game-ui-compact-game-drawer-panel" data-drawer-panel="true" id={panelId}>
        <GamePanel title={title} tone="strong">{children}</GamePanel>
      </div>
    </aside>
  );
}

function StatusBlock({ status }: { status: GameTerrainStatusState | undefined }): ReactNode {
  if (!status) return null;
  const hasProgress = typeof status.progressValue === 'number' && typeof status.progressMax === 'number';
  const progressTone = status.tone === 'danger' ? 'danger' : status.tone === 'warning' ? 'warning' : 'success';
  const progressMax = status.progressMax ?? 100;
  const progressValue = status.progressValue ?? 0;
  return (
    <div className="game-ui-terrain-status" data-status-tone={status.tone ?? 'neutral'} data-ui-hook="terrain-status">
      <GameBadge tone={status.tone ?? 'neutral'}>{status.label}</GameBadge>
      {status.description ? <p>{status.description}</p> : null}
      {hasProgress ? (
        <GameProgress
          label={status.progressLabel ?? status.label}
          max={progressMax}
          showValue
          tone={progressTone}
          value={progressValue}
        />
      ) : null}
    </div>
  );
}

function TerrainBuildToolboxBody({
  activeBuildCategoryId,
  activeMaterialId,
  activeModeId,
  activeToolId,
  brush,
  buildCategories = [],
  density = 'comfortable',
  disabled = false,
  materials = [],
  modes,
  onBrushRadiusChange,
  onBrushStrengthChange,
  onBuildCategoryChange,
  onMaterialChange,
  onModeChange,
  onRedo,
  onSelectBuildItem,
  onToolChange,
  onUndo,
  selectedBuildItemId,
  status,
  toolCompactLabelMode = 'auto',
  tools,
  undoRedo,
  variant = 'desktop',
}: Omit<GameTerrainBuildToolboxProps, 'className' | 'drawerOpen' | 'drawerTitle' | 'label' | 'onDrawerOpenChange' | 'title' | 'data-testid'>): ReactNode {
  return (
    <div className="game-ui-terrain-build-toolbox-body" data-active-mode={activeModeId} data-active-tool={activeToolId} data-variant={variant}>
      <StatusBlock status={status} />
      <GameTerrainModeControl activeModeId={activeModeId} disabled={disabled} label="Tool mode" modes={modes} onModeChange={onModeChange} variant={variant} />
      <div className="game-ui-terrain-build-main-grid">
        <GameTerrainToolStrip activeToolId={activeToolId} compactLabelMode={toolCompactLabelMode} density={density} disabled={disabled} label="Terrain tools" onToolChange={onToolChange} tools={tools} variant={variant} />
        <GameUndoRedoActions canRedo={undoRedo?.canRedo} canUndo={undoRedo?.canUndo} disabled={disabled} label="Terrain history" onRedo={onRedo} onUndo={onUndo} redoLabel={undoRedo?.redoLabel} undoLabel={undoRedo?.undoLabel} variant={variant} />
        <GameBrushControls onRadiusChange={onBrushRadiusChange} onStrengthChange={onBrushStrengthChange} state={{ ...brush, disabled: Boolean(disabled || brush.disabled) }} variant={variant} />
        {materials.length > 0 ? <GameMaterialSwatches activeMaterialId={activeMaterialId} disabled={disabled} label="Terrain materials" materials={materials} onMaterialChange={onMaterialChange} variant={variant} /> : null}
      </div>
      {buildCategories.length > 0 ? (
        <GameBuildLibrary
          activeCategoryId={activeBuildCategoryId}
          categories={buildCategories}
          density={density}
          label="Build library"
          onCategoryChange={onBuildCategoryChange}
          onSelectItem={onSelectBuildItem}
          selectedItemId={selectedBuildItemId}
          title="Build pieces"
          variant={variant}
        />
      ) : null}
    </div>
  );
}

export function GameTerrainBuildToolbox({
  className,
  drawerOpen = false,
  drawerTitle = 'Terrain and build tools',
  label,
  onDrawerOpenChange,
  title,
  variant = 'desktop',
  'data-testid': testId,
  ...bodyProps
}: GameTerrainBuildToolboxProps): ReactNode {
  const classes = ['game-ui-terrain-build-toolbox', className].filter(Boolean).join(' ');
  const body = <TerrainBuildToolboxBody {...bodyProps} variant={variant} />;

  if (variant === 'mobile' || variant === 'small-mobile') {
    return (
      <GameCompactGameDrawer
        className={classes}
        label={label}
        onOpenChange={onDrawerOpenChange}
        open={drawerOpen}
        title={drawerTitle}
        triggerLabel={title}
        variant={variant}
        data-testid={testId}
      >
        {body}
      </GameCompactGameDrawer>
    );
  }

  return (
    <GamePanel className={classes} data-ui-hook="terrain-build-toolbox" data-variant={variant} data-testid={testId} title={title} tone="strong">
      <section aria-label={label}>{body}</section>
    </GamePanel>
  );
}
