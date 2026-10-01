import { type GameBadgeTone } from '../../feedback/GameBadge/GameBadge';

import { type GameActionIconLabelMode } from '../../controls/GameActionGrid/GameActionGrid';

import type { ClayIconName } from '../../icons/assets';

export type GameTerrainBuildVariant = 'desktop' | 'dense' | 'mobile' | 'small-mobile';

export type GameTerrainBuildModeId = 'terrain' | 'build' | 'place' | 'inspect';

export type GameTerrainToolId = 'raise' | 'lower' | 'flatten' | 'smooth' | 'paint';

export type GameTerrainToolCompactLabelMode = 'auto' | GameActionIconLabelMode;

export type GameTerrainMaterialPattern = 'solid' | 'speckled' | 'hatched' | 'grid';

export type GameTerrainStatusTone = Extract<
  GameBadgeTone,
  'neutral' | 'success' | 'warning' | 'danger' | 'ai'
>;

export type GameBuildItemStatus =
  | 'ready'
  | 'selected'
  | 'locked'
  | 'missing'
  | 'progress'
  | 'error';

export type GameBuildCategoryId =
  | 'foundation'
  | 'wall'
  | 'opening'
  | 'roof'
  | 'prop'
  | 'house'
  | string;

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
