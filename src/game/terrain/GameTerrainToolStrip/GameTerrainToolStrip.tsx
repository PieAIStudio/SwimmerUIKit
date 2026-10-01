import type { ReactNode } from 'react';

import {
  GameActionGrid,
  type GameActionIconLabelMode,
  type GameUiAction,
} from '../../../controls/GameActionGrid/GameActionGrid';

import { type GameSurfaceDensity } from '../../../containers/shared/surfaceTypes';
import {
  type GameTerrainToolCompactLabelMode,
  type GameTerrainToolOption,
  type GameTerrainBuildVariant,
} from '../model';
import { TOOL_ICONS } from '../shared';

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

function toAction(
  option: GameTerrainToolOption,
  activeToolId: string,
  onToolChange?: (toolId: string) => void,
  disabled?: boolean,
): GameUiAction {
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

function resolveCompactLabelMode(
  mode: GameTerrainToolCompactLabelMode,
  variant: GameTerrainBuildVariant,
): GameActionIconLabelMode {
  if (mode !== 'auto') return mode;
  return variant === 'mobile' || variant === 'small-mobile' ? 'caption' : 'hidden';
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
    <section
      aria-label={label}
      className={classes}
      data-active-tool={activeToolId}
      data-icon-label-mode={iconLabelMode}
      data-ui-hook="terrain-tool-strip"
      data-variant={variant}
      data-testid={testId}
    >
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
