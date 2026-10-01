import type { ReactNode } from 'react';

import { GameBadge } from '../../../feedback/GameBadge/GameBadge';

import { GameActionGrid, type GameUiAction } from '../../../controls/GameActionGrid/GameActionGrid';
import {
  type GameConstructionAction,
  type GameConstructionProviderMode,
  type GameConstructionJobStatus,
  type GameConstructionValidationWarning,
  type GameConstructionVariant,
} from '../model';
import { PROVIDER_TONES, PROVIDER_LABELS } from '../shared';

export interface GameConstructionApprovalBarProps {
  actions?: readonly GameConstructionAction[] | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  label: string;
  localOnlyLabel?: string | undefined;
  onAction?: ((actionId: string) => void) | undefined;
  providerMode?: GameConstructionProviderMode | undefined;
  status: GameConstructionJobStatus;
  validationWarnings?: readonly GameConstructionValidationWarning[] | undefined;
  variant?: GameConstructionVariant | undefined;
  'data-testid'?: string | undefined;
}

const DEFAULT_ACTIONS: Readonly<
  Record<GameConstructionJobStatus, readonly GameConstructionAction[]>
> = {
  accepted: [{ id: 'revert', label: 'Revert', icon: 'undo', tone: 'ghost' }],
  blocked: [
    { id: 'revise', label: 'Revise', icon: 'scroll', tone: 'primary' },
    { id: 'revert', label: 'Revert', icon: 'undo', tone: 'ghost' },
    { id: 'cancel', label: 'Cancel', icon: 'close', tone: 'danger' },
  ],
  cancelled: [{ id: 'revert', label: 'Revert', icon: 'undo', tone: 'secondary' }],
  draft: [
    { id: 'preview', label: 'Preview', icon: 'compass', tone: 'primary' },
    { id: 'revise', label: 'Revise', icon: 'scroll', tone: 'secondary' },
    { id: 'cancel', label: 'Cancel', icon: 'close', tone: 'ghost' },
  ],
  preview: [
    { id: 'approve', label: 'Approve', icon: 'check', tone: 'primary' },
    { id: 'revise', label: 'Revise', icon: 'scroll', tone: 'secondary' },
    { id: 'cancel', label: 'Cancel', icon: 'close', tone: 'danger' },
  ],
  queued: [{ id: 'cancel', label: 'Cancel', icon: 'close', tone: 'danger' }],
  readyForReview: [
    { id: 'approve', label: 'Approve', icon: 'check', tone: 'primary' },
    { id: 'revise', label: 'Revise', icon: 'scroll', tone: 'secondary' },
    { id: 'revert', label: 'Revert', icon: 'undo', tone: 'ghost' },
  ],
  working: [{ id: 'cancel', label: 'Cancel', icon: 'close', tone: 'danger' }],
};

function actionToUiAction(
  action: GameConstructionAction,
  onAction?: (actionId: string) => void,
  disabled?: boolean,
): GameUiAction {
  const uiAction: GameUiAction = {
    disabled: Boolean(disabled || action.disabled),
    id: action.id,
    label: action.label,
    tone: action.tone ?? 'secondary',
  };
  if (action.icon) uiAction.icon = action.icon;
  if (action.ariaLabel) uiAction.ariaLabel = action.ariaLabel;
  if (action.meta) uiAction.meta = action.meta;
  if (onAction) uiAction.onAction = onAction;
  return uiAction;
}

export function GameConstructionApprovalBar({
  actions,
  className,
  disabled = false,
  label,
  localOnlyLabel = 'Local-only construction',
  onAction,
  providerMode,
  status,
  validationWarnings = [],
  variant = 'desktop',
  'data-testid': testId,
}: GameConstructionApprovalBarProps): ReactNode {
  const classes = ['game-ui-construction-approval-bar', className].filter(Boolean).join(' ');
  const resolvedActions = actions ?? DEFAULT_ACTIONS[status];
  const warningCount = validationWarnings.filter((warning) => warning.tone !== 'success').length;
  const uiActions = resolvedActions.map((action) => actionToUiAction(action, onAction, disabled));

  return (
    <section
      aria-label={label}
      className={classes}
      data-status={status}
      data-ui-hook="construction-approval-bar"
      data-variant={variant}
      data-testid={testId}
    >
      <div className="game-ui-construction-approval-meta">
        {providerMode ? (
          <GameBadge tone={PROVIDER_TONES[providerMode]}>{PROVIDER_LABELS[providerMode]}</GameBadge>
        ) : (
          <GameBadge tone="success">{localOnlyLabel}</GameBadge>
        )}
        {warningCount > 0 ? (
          <GameBadge tone="warning">
            {warningCount} validation warning{warningCount === 1 ? '' : 's'}
          </GameBadge>
        ) : (
          <GameBadge tone="success">Validation clear</GameBadge>
        )}
      </div>
      {uiActions.length > 0 ? (
        <GameActionGrid
          actions={uiActions}
          density={variant === 'small-mobile' ? 'dense' : 'comfortable'}
          label={`${label} actions`}
        />
      ) : null}
    </section>
  );
}
