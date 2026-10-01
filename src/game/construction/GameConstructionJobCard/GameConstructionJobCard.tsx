import type { ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameBadge } from '../../../feedback/GameBadge/GameBadge';

import { type GameSurfaceDensity } from '../../../containers/shared/surfaceTypes';
import {
  type GameConstructionJob,
  type GameConstructionVariant,
  type GameConstructionFact,
} from '../model';
import {
  statusLabel,
  STATUS_ICONS,
  STATUS_TONES,
  PROVIDER_TONES,
  PROVIDER_LABELS,
  hasPreviewPair,
} from '../shared';
import { GameConstructionProgress } from '../GameConstructionProgress/GameConstructionProgress';
import { GameBeforeAfterToggle } from '../GameBeforeAfterToggle/GameBeforeAfterToggle';
import { GameRobotCrewStatus } from '../GameRobotCrewStatus/GameRobotCrewStatus';
import { GameConstructionApprovalBar } from '../GameConstructionApprovalBar/GameConstructionApprovalBar';

export interface GameConstructionJobCardProps {
  className?: string | undefined;
  density?: GameSurfaceDensity | undefined;
  job: GameConstructionJob;
  onAction?: ((actionId: string, jobId: string) => void) | undefined;
  onSelect?: ((jobId: string) => void) | undefined;
  selected?: boolean | undefined;
  showApprovalBar?: boolean | undefined;
  showBeforeAfter?: boolean | undefined;
  variant?: GameConstructionVariant | undefined;
  'data-testid'?: string | undefined;
}

export function GameConstructionJobCard({
  className,
  density = 'comfortable',
  job,
  onAction,
  onSelect,
  selected = false,
  showApprovalBar = true,
  showBeforeAfter = false,
  variant = 'desktop',
  'data-testid': testId,
}: GameConstructionJobCardProps): ReactNode {
  const classes = ['game-ui-construction-job-card', className].filter(Boolean).join(' ');
  const resolvedStatusLabel = statusLabel(job.status, job.statusLabel);
  const compact = variant === 'mobile' || variant === 'small-mobile';
  const jobFacts: readonly GameConstructionFact[] = job.facts ?? [];
  const handleSelect = (): void => onSelect?.(job.id);
  const cardAction = (actionId: string): void => onAction?.(actionId, job.id);

  return (
    <article
      className={classes}
      data-density={density}
      data-job-id={job.id}
      data-selected={selected ? 'true' : 'false'}
      data-status={job.status}
      data-ui-hook="construction-job-card"
      data-variant={variant}
      data-testid={testId}
    >
      <header className="game-ui-construction-job-header">
        <button
          aria-pressed={selected}
          className="game-ui-construction-job-select"
          disabled={!onSelect}
          onClick={handleSelect}
          type="button"
        >
          <GameAssetIcon icon={STATUS_ICONS[job.status]} size={compact ? 'sm' : 'md'} />
          <span>
            <strong>{job.title}</strong>
            {job.description ? <small>{job.description}</small> : null}
          </span>
        </button>
        <span className="game-ui-construction-job-badges">
          <GameBadge tone={STATUS_TONES[job.status]}>{resolvedStatusLabel}</GameBadge>
          {job.providerMode ? (
            <GameBadge tone={PROVIDER_TONES[job.providerMode]}>
              {PROVIDER_LABELS[job.providerMode]}
            </GameBadge>
          ) : null}
          {job.badges?.map((badge) => (
            <GameBadge key={badge.label} tone={badge.tone ?? 'neutral'}>
              {badge.label}
            </GameBadge>
          ))}
        </span>
      </header>
      <div className="game-ui-construction-job-facts" aria-label={`${job.title} facts`}>
        {job.location ? (
          <span>
            <small>Location</small>
            <b>{job.location}</b>
          </span>
        ) : null}
        {job.estimate ? (
          <span>
            <small>ETA</small>
            <b>{job.estimate}</b>
          </span>
        ) : null}
        {jobFacts.map((fact) => (
          <span key={fact.id}>
            <small>{fact.label}</small>
            <b>{fact.value}</b>
          </span>
        ))}
      </div>
      <GameConstructionProgress
        label={`${job.title} progress`}
        progressLabel={job.progressLabel}
        status={job.status}
        statusLabel={resolvedStatusLabel}
        steps={compact ? [] : job.steps}
        validationWarnings={job.validationWarnings}
        value={job.progressValue}
        max={job.progressMax}
        variant={variant}
      />
      {showBeforeAfter && hasPreviewPair(job) ? (
        <GameBeforeAfterToggle
          activeView="after"
          after={job.after}
          before={job.before}
          label={`${job.title} preview`}
          variant={variant}
        />
      ) : null}
      {job.crew && job.crew.length > 0 ? (
        <GameRobotCrewStatus crew={job.crew} label={`${job.title} robot crew`} variant={variant} />
      ) : null}
      {showApprovalBar ? (
        <GameConstructionApprovalBar
          actions={job.actions}
          label={`${job.title} approval`}
          onAction={cardAction}
          providerMode={job.providerMode}
          status={job.status}
          validationWarnings={job.validationWarnings}
          variant={variant}
        />
      ) : null}
    </article>
  );
}
