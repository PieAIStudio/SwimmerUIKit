import type { ReactNode } from 'react';

import { GameBadge } from '../../../feedback/GameBadge/GameBadge';

import { GameProgress } from '../../../feedback/GameProgress/GameProgress';

import { type GameSurfaceDensity } from '../../../containers/shared/surfaceTypes';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';
import {
  type GameBrushControlState,
  type GameBuildCategory,
  type GameTerrainMaterialSwatch,
  type GameTerrainBuildModeOption,
  type GameTerrainStatusState,
  type GameTerrainToolCompactLabelMode,
  type GameTerrainToolOption,
  type GameUndoRedoState,
  type GameTerrainBuildVariant,
} from '../model';
import { GameTerrainModeControl } from '../GameTerrainModeControl/GameTerrainModeControl';
import { GameTerrainToolStrip } from '../GameTerrainToolStrip/GameTerrainToolStrip';
import { GameUndoRedoActions } from '../GameUndoRedoActions/GameUndoRedoActions';
import { GameBrushControls } from '../GameBrushControls/GameBrushControls';
import { GameMaterialSwatches } from '../GameMaterialSwatches/GameMaterialSwatches';
import { GameBuildLibrary } from '../GameBuildLibrary/GameBuildLibrary';
import { GameCompactGameDrawer } from '../GameCompactGameDrawer/GameCompactGameDrawer';

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

function StatusBlock({ status }: { status: GameTerrainStatusState | undefined }): ReactNode {
  if (!status) return null;
  const hasProgress =
    typeof status.progressValue === 'number' && typeof status.progressMax === 'number';
  const progressTone =
    status.tone === 'danger' ? 'danger' : status.tone === 'warning' ? 'warning' : 'success';
  const progressMax = status.progressMax ?? 100;
  const progressValue = status.progressValue ?? 0;
  return (
    <div
      className="game-ui-terrain-status"
      data-status-tone={status.tone ?? 'neutral'}
      data-ui-hook="terrain-status"
    >
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
}: Omit<
  GameTerrainBuildToolboxProps,
  | 'className'
  | 'drawerOpen'
  | 'drawerTitle'
  | 'label'
  | 'onDrawerOpenChange'
  | 'title'
  | 'data-testid'
>): ReactNode {
  return (
    <div
      className="game-ui-terrain-build-toolbox-body"
      data-active-mode={activeModeId}
      data-active-tool={activeToolId}
      data-variant={variant}
    >
      <StatusBlock status={status} />
      <GameTerrainModeControl
        activeModeId={activeModeId}
        disabled={disabled}
        label="Tool mode"
        modes={modes}
        onModeChange={onModeChange}
        variant={variant}
      />
      <div className="game-ui-terrain-build-main-grid">
        <GameTerrainToolStrip
          activeToolId={activeToolId}
          compactLabelMode={toolCompactLabelMode}
          density={density}
          disabled={disabled}
          label="Terrain tools"
          onToolChange={onToolChange}
          tools={tools}
          variant={variant}
        />
        <GameUndoRedoActions
          canRedo={undoRedo?.canRedo}
          canUndo={undoRedo?.canUndo}
          disabled={disabled}
          label="Terrain history"
          onRedo={onRedo}
          onUndo={onUndo}
          redoLabel={undoRedo?.redoLabel}
          undoLabel={undoRedo?.undoLabel}
          variant={variant}
        />
        <GameBrushControls
          onRadiusChange={onBrushRadiusChange}
          onStrengthChange={onBrushStrengthChange}
          state={{ ...brush, disabled: Boolean(disabled || brush.disabled) }}
          variant={variant}
        />
        {materials.length > 0 ? (
          <GameMaterialSwatches
            activeMaterialId={activeMaterialId}
            disabled={disabled}
            label="Terrain materials"
            materials={materials}
            onMaterialChange={onMaterialChange}
            variant={variant}
          />
        ) : null}
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
    <GamePanel
      className={classes}
      data-ui-hook="terrain-build-toolbox"
      data-variant={variant}
      data-testid={testId}
      title={title}
      tone="strong"
    >
      <section aria-label={label}>{body}</section>
    </GamePanel>
  );
}
