import type { ReactNode } from 'react';

import { GameActionGrid, type GameUiAction } from '../../../controls/GameActionGrid/GameActionGrid';
import { type GameUndoRedoState, type GameTerrainBuildVariant } from '../model';

export interface GameUndoRedoActionsProps extends GameUndoRedoState {
  className?: string;
  disabled?: boolean;
  label: string;
  onRedo?: (() => void) | undefined;
  onUndo?: (() => void) | undefined;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
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
    {
      disabled: disabled || !canUndo,
      icon: 'undo',
      id: 'undo',
      label: undoLabel,
      onAction: (_id) => {
        onUndo?.();
      },
      shortcut: '⌘Z',
    },
    {
      disabled: disabled || !canRedo,
      icon: 'redo',
      id: 'redo',
      label: redoLabel,
      onAction: (_id) => {
        onRedo?.();
      },
      shortcut: '⇧⌘Z',
    },
  ];
  return (
    <section
      aria-label={label}
      className={classes}
      data-ui-hook="undo-redo-actions"
      data-variant={variant}
      data-testid={testId}
    >
      <GameActionGrid actions={actions} density="dense" label={label} style="icon" />
    </section>
  );
}
