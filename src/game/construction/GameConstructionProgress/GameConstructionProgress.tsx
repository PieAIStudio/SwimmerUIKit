import type { ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameBadge, type GameBadgeTone } from '../../../feedback/GameBadge/GameBadge';

import { GameProgress } from '../../../feedback/GameProgress/GameProgress';
import {
  type GameConstructionJobStatus,
  type GameConstructionProgressStep,
  type GameConstructionValidationWarning,
  type GameConstructionVariant,
  type GameConstructionProgressStepStatus,
  type GameConstructionValidationTone,
} from '../model';
import { statusLabel, STATUS_ICONS, STATUS_TONES } from '../shared';

export interface GameConstructionProgressProps {
  className?: string | undefined;
  label: string;
  max?: number | undefined;
  progressLabel?: string | undefined;
  showStatusBadge?: boolean | undefined;
  status: GameConstructionJobStatus;
  statusLabel?: string | undefined;
  steps?: readonly GameConstructionProgressStep[] | undefined;
  validationWarnings?: readonly GameConstructionValidationWarning[] | undefined;
  value?: number | undefined;
  variant?: GameConstructionVariant | undefined;
  'data-testid'?: string | undefined;
}

const STEP_TONES: Readonly<Record<GameConstructionProgressStepStatus, GameBadgeTone>> = {
  active: 'ai',
  blocked: 'danger',
  complete: 'success',
  pending: 'neutral',
};

function progressTone(
  status: GameConstructionJobStatus,
): 'accent' | 'success' | 'danger' | 'warning' {
  if (status === 'blocked' || status === 'cancelled') return 'danger';
  if (status === 'accepted' || status === 'readyForReview') return 'success';
  if (status === 'queued' || status === 'draft' || status === 'preview') return 'warning';
  return 'accent';
}

function defaultProgress(status: GameConstructionJobStatus): number {
  switch (status) {
    case 'accepted':
      return 100;
    case 'blocked':
      return 42;
    case 'cancelled':
      return 0;
    case 'draft':
      return 8;
    case 'preview':
      return 22;
    case 'queued':
      return 34;
    case 'readyForReview':
      return 92;
    case 'working':
      return 64;
  }
}

function warningRole(tone?: GameConstructionValidationTone): 'alert' | 'status' {
  return tone === 'danger' || tone === 'warning' ? 'alert' : 'status';
}

export function GameConstructionProgress({
  className,
  label,
  max = 100,
  progressLabel = 'Construction progress',
  showStatusBadge = true,
  status,
  statusLabel: explicitStatusLabel,
  steps = [],
  validationWarnings = [],
  value,
  variant = 'desktop',
  'data-testid': testId,
}: GameConstructionProgressProps): ReactNode {
  const classes = ['game-ui-construction-progress', className].filter(Boolean).join(' ');
  const resolvedValue = value ?? defaultProgress(status);
  const resolvedStatusLabel = statusLabel(status, explicitStatusLabel);

  return (
    <section
      aria-label={label}
      className={classes}
      data-status={status}
      data-ui-hook="construction-progress"
      data-variant={variant}
      data-testid={testId}
    >
      <header className="game-ui-construction-progress-header">
        <span>
          <GameAssetIcon icon={STATUS_ICONS[status]} size="sm" />
          <strong>{progressLabel}</strong>
        </span>
        {showStatusBadge ? (
          <GameBadge tone={STATUS_TONES[status]}>{resolvedStatusLabel}</GameBadge>
        ) : null}
      </header>
      <GameProgress
        label={progressLabel}
        max={max}
        showValue
        tone={progressTone(status)}
        value={resolvedValue}
      />
      {steps.length > 0 ? (
        <ol className="game-ui-construction-steps" aria-label={`${progressLabel} steps`}>
          {steps.map((step) => (
            <li data-step-status={step.status} key={step.id}>
              <span aria-hidden="true" className="game-ui-construction-step-dot" />
              <span>
                <strong>{step.label}</strong>
                {step.caption ? <small>{step.caption}</small> : null}
              </span>
              <GameBadge tone={STEP_TONES[step.status]}>{step.status}</GameBadge>
            </li>
          ))}
        </ol>
      ) : null}
      {validationWarnings.length > 0 ? (
        <div
          className="game-ui-construction-warnings"
          data-ui-hook="construction-validation-warnings"
        >
          {validationWarnings.map((warning) => (
            <div
              className="game-ui-construction-warning"
              data-warning-tone={warning.tone ?? 'warning'}
              key={warning.id}
              role={warningRole(warning.tone)}
            >
              <GameAssetIcon
                icon={warning.tone === 'danger' || warning.tone === 'warning' ? 'alert' : 'check'}
                size="sm"
              />
              <span>
                <strong>{warning.label}</strong>
                {warning.description ? <small>{warning.description}</small> : null}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
