import type { ReactNode } from 'react';

import { GameAssetIcon, GameBadge, type GameBadgeTone } from './ClayComponents';
import { type GameButtonVariant } from './GameButton';
import { GameEmptyState, GameProgress } from './GameDisplay';
import { GameActionGrid, type GameSurfaceDensity, type GameUiAction } from './GameSurfacePack';
import { GameCompactGameDrawer } from './GameTerrainBuildTools';
import { GamePanel, GameSegmentedControl } from './GameSurfaces';
import type { ClayIconName } from './clay/assets';

export type GameConstructionJobStatus =
  | 'draft'
  | 'preview'
  | 'queued'
  | 'working'
  | 'blocked'
  | 'readyForReview'
  | 'accepted'
  | 'cancelled';
export type GameConstructionProgressStepStatus = 'pending' | 'active' | 'complete' | 'blocked';
export type GameRobotCrewMemberStatus = 'idle' | 'queued' | 'working' | 'blocked' | 'done';
export type GameBeforeAfterView = 'before' | 'after';
export type GameConstructionVariant = 'desktop' | 'tablet' | 'mobile' | 'small-mobile';
export type GameConstructionProviderMode = 'local-only' | 'mock' | 'paid-disabled';
export type GameConstructionValidationTone = Extract<
  GameBadgeTone,
  'neutral' | 'success' | 'warning' | 'danger' | 'ai'
>;
export type GameConstructionActionId =
  | 'approve'
  | 'cancel'
  | 'preview'
  | 'revise'
  | 'revert'
  | string;

export interface GameConstructionAction {
  ariaLabel?: string | undefined;
  disabled?: boolean | undefined;
  icon?: ClayIconName | undefined;
  id: GameConstructionActionId;
  label: string;
  meta?: string | undefined;
  tone?: GameButtonVariant | undefined;
}

export interface GameConstructionFact {
  id: string;
  label: string;
  value: ReactNode;
}

export interface GameConstructionBadge {
  label: string;
  tone?: GameBadgeTone | undefined;
}

export interface GameConstructionValidationWarning {
  description?: string | undefined;
  id: string;
  label: string;
  tone?: GameConstructionValidationTone | undefined;
}

export interface GameConstructionProgressStep {
  caption?: string | undefined;
  id: string;
  label: string;
  status: GameConstructionProgressStepStatus;
}

export interface GameRobotCrewMember {
  icon?: ClayIconName | undefined;
  id: string;
  name: string;
  role: string;
  status: GameRobotCrewMemberStatus;
  task?: string | undefined;
}

export interface GameConstructionPreviewPane {
  caption?: string | undefined;
  content?: ReactNode | undefined;
  label: string;
}

export interface GameConstructionJob {
  actions?: readonly GameConstructionAction[] | undefined;
  after?: GameConstructionPreviewPane | undefined;
  badges?: readonly GameConstructionBadge[] | undefined;
  before?: GameConstructionPreviewPane | undefined;
  crew?: readonly GameRobotCrewMember[] | undefined;
  description?: string | undefined;
  estimate?: string | undefined;
  facts?: readonly GameConstructionFact[] | undefined;
  id: string;
  location?: string | undefined;
  progressLabel?: string | undefined;
  progressMax?: number | undefined;
  progressValue?: number | undefined;
  providerMode?: GameConstructionProviderMode | undefined;
  status: GameConstructionJobStatus;
  statusLabel?: string | undefined;
  steps?: readonly GameConstructionProgressStep[] | undefined;
  title: string;
  validationWarnings?: readonly GameConstructionValidationWarning[] | undefined;
}

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

export interface GameRobotCrewStatusProps {
  className?: string | undefined;
  crew: readonly GameRobotCrewMember[];
  emptyDescription?: string | undefined;
  emptyTitle?: string | undefined;
  label: string;
  title?: string | undefined;
  variant?: GameConstructionVariant | undefined;
  'data-testid'?: string | undefined;
}

export interface GameBeforeAfterToggleProps {
  activeView: GameBeforeAfterView;
  after: GameConstructionPreviewPane;
  before: GameConstructionPreviewPane;
  className?: string | undefined;
  label: string;
  onViewChange?: ((view: GameBeforeAfterView) => void) | undefined;
  variant?: GameConstructionVariant | undefined;
  'data-testid'?: string | undefined;
}

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

export interface GameCompactJobDrawerProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
  closeLabel?: string | undefined;
  disabled?: boolean | undefined;
  jobs?: readonly GameConstructionJob[] | undefined;
  label: string;
  onAction?: ((actionId: string, jobId: string) => void) | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  onSelectJob?: ((jobId: string) => void) | undefined;
  open: boolean;
  panelId?: string | undefined;
  selectedJobId?: string | undefined;
  title: string;
  triggerLabel?: string | undefined;
  variant?: Extract<GameConstructionVariant, 'mobile' | 'small-mobile'> | undefined;
  'data-testid'?: string | undefined;
}

export interface GameContractorPanelProps {
  activePreviewView?: GameBeforeAfterView | undefined;
  className?: string | undefined;
  density?: GameSurfaceDensity | undefined;
  drawerOpen?: boolean | undefined;
  emptyDescription?: string | undefined;
  emptyTitle?: string | undefined;
  jobs: readonly GameConstructionJob[];
  label: string;
  onAction?: ((actionId: string, jobId: string) => void) | undefined;
  onDrawerOpenChange?: ((open: boolean) => void) | undefined;
  onPreviewViewChange?: ((view: GameBeforeAfterView) => void) | undefined;
  onSelectJob?: ((jobId: string) => void) | undefined;
  selectedJobId?: string | undefined;
  subtitle?: string | undefined;
  title: string;
  variant?: GameConstructionVariant | undefined;
  'data-testid'?: string | undefined;
}

const STATUS_TONES: Readonly<Record<GameConstructionJobStatus, GameBadgeTone>> = {
  accepted: 'success',
  blocked: 'danger',
  cancelled: 'neutral',
  draft: 'neutral',
  preview: 'ai',
  queued: 'warning',
  readyForReview: 'success',
  working: 'ai',
};

const STATUS_ICONS: Readonly<Record<GameConstructionJobStatus, ClayIconName>> = {
  accepted: 'check',
  blocked: 'alert',
  cancelled: 'close',
  draft: 'scroll',
  preview: 'compass',
  queued: 'hourglass',
  readyForReview: 'vote',
  working: 'energy',
};

const STEP_TONES: Readonly<Record<GameConstructionProgressStepStatus, GameBadgeTone>> = {
  active: 'ai',
  blocked: 'danger',
  complete: 'success',
  pending: 'neutral',
};

const CREW_TONES: Readonly<Record<GameRobotCrewMemberStatus, GameBadgeTone>> = {
  blocked: 'danger',
  done: 'success',
  idle: 'neutral',
  queued: 'warning',
  working: 'ai',
};

const PROVIDER_LABELS: Readonly<Record<GameConstructionProviderMode, string>> = {
  'local-only': 'Local only',
  mock: 'Mock run',
  'paid-disabled': 'Paid provider off',
};

const PROVIDER_TONES: Readonly<Record<GameConstructionProviderMode, GameBadgeTone>> = {
  'local-only': 'success',
  mock: 'ai',
  'paid-disabled': 'warning',
};

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

function statusLabel(status: GameConstructionJobStatus, explicitLabel?: string): string {
  if (explicitLabel) return explicitLabel;
  switch (status) {
    case 'readyForReview':
      return 'Ready for review';
    default:
      return status.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
  }
}

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

function warningRole(tone?: GameConstructionValidationTone): 'alert' | 'status' {
  return tone === 'danger' || tone === 'warning' ? 'alert' : 'status';
}

function hasPreviewPair(job: GameConstructionJob): job is GameConstructionJob & {
  before: GameConstructionPreviewPane;
  after: GameConstructionPreviewPane;
} {
  return Boolean(job.before && job.after);
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

export function GameRobotCrewStatus({
  className,
  crew,
  emptyDescription = 'Robot crew members appear here when a construction job starts.',
  emptyTitle = 'No robot crew assigned',
  label,
  title,
  variant = 'desktop',
  'data-testid': testId,
}: GameRobotCrewStatusProps): ReactNode {
  const classes = ['game-ui-robot-crew-status', className].filter(Boolean).join(' ');

  return (
    <section
      aria-label={label}
      className={classes}
      data-ui-hook="robot-crew-status"
      data-variant={variant}
      data-testid={testId}
    >
      {title ? (
        <header>
          <strong>{title}</strong>
        </header>
      ) : null}
      {crew.length === 0 ? (
        <GameEmptyState description={emptyDescription} icon="ai" title={emptyTitle} />
      ) : (
        <div className="game-ui-robot-crew-list">
          {crew.map((member) => (
            <article
              className="game-ui-robot-crew-member"
              data-crew-status={member.status}
              key={member.id}
            >
              <GameAssetIcon
                icon={member.icon ?? 'ai'}
                size={variant === 'small-mobile' ? 'sm' : 'md'}
              />
              <span className="game-ui-robot-crew-copy">
                <strong>{member.name}</strong>
                <small>{member.role}</small>
                {member.task ? <em>{member.task}</em> : null}
              </span>
              <GameBadge tone={CREW_TONES[member.status]}>{member.status}</GameBadge>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function GameBeforeAfterToggle({
  activeView,
  after,
  before,
  className,
  label,
  onViewChange,
  variant = 'desktop',
  'data-testid': testId,
}: GameBeforeAfterToggleProps): ReactNode {
  const classes = ['game-ui-before-after-toggle', className].filter(Boolean).join(' ');
  const activePane = activeView === 'before' ? before : after;

  return (
    <section
      aria-label={label}
      className={classes}
      data-active-view={activeView}
      data-ui-hook="before-after-toggle"
      data-variant={variant}
      data-testid={testId}
    >
      <GameSegmentedControl
        activeId={activeView}
        label={`${label} view`}
        {...(onViewChange
          ? { onSelect: (view: string) => onViewChange(view as GameBeforeAfterView) }
          : {})}
        options={[
          { id: 'before', label: before.label },
          { id: 'after', label: after.label },
        ]}
      />
      <figure className="game-ui-before-after-preview">
        {activePane.content ? (
          <div className="game-ui-before-after-content">{activePane.content}</div>
        ) : (
          <div aria-hidden="true" className="game-ui-before-after-placeholder">
            <GameAssetIcon icon={activeView === 'before' ? 'home' : 'check'} size="xl" />
          </div>
        )}
        {activePane.caption ? <figcaption>{activePane.caption}</figcaption> : null}
      </figure>
    </section>
  );
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

export function GameCompactJobDrawer({
  children,
  className,
  closeLabel = 'Close jobs',
  disabled = false,
  jobs = [],
  label,
  onAction,
  onOpenChange,
  onSelectJob,
  open,
  panelId = 'game-compact-job-drawer-panel',
  selectedJobId,
  title,
  triggerLabel = 'Construction jobs',
  variant = 'mobile',
  'data-testid': testId,
}: GameCompactJobDrawerProps): ReactNode {
  const classes = ['game-ui-compact-job-drawer', className].filter(Boolean).join(' ');

  return (
    <GameCompactGameDrawer
      className={classes}
      closeLabel={closeLabel}
      disabled={disabled}
      label={label}
      onOpenChange={onOpenChange}
      open={open}
      panelId={panelId}
      title={title}
      triggerIcon="energy"
      triggerLabel={triggerLabel}
      variant={variant}
      data-testid={testId}
    >
      {children ?? (
        <div className="game-ui-compact-job-drawer-list" tabIndex={0}>
          {jobs.map((job) => (
            <GameConstructionJobCard
              density="dense"
              job={job}
              key={job.id}
              onAction={onAction}
              onSelect={onSelectJob}
              selected={job.id === selectedJobId}
              showApprovalBar={false}
              variant={variant}
            />
          ))}
        </div>
      )}
    </GameCompactGameDrawer>
  );
}

export function GameContractorPanel({
  activePreviewView = 'after',
  className,
  density = 'comfortable',
  drawerOpen = false,
  emptyDescription = 'Draft construction jobs will appear here before any provider call is allowed.',
  emptyTitle = 'No construction jobs',
  jobs,
  label,
  onAction,
  onDrawerOpenChange,
  onPreviewViewChange,
  onSelectJob,
  selectedJobId,
  subtitle,
  title,
  variant = 'desktop',
  'data-testid': testId,
}: GameContractorPanelProps): ReactNode {
  const classes = ['game-ui-contractor-panel', className].filter(Boolean).join(' ');
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  const mobile = variant === 'mobile' || variant === 'small-mobile';

  if (mobile) {
    return (
      <section
        aria-label={label}
        className={classes}
        data-ui-hook="contractor-panel"
        data-variant={variant}
        data-testid={testId}
      >
        <GameCompactJobDrawer
          jobs={jobs}
          label={`${label} drawer`}
          onAction={onAction}
          onOpenChange={onDrawerOpenChange}
          onSelectJob={onSelectJob}
          open={drawerOpen}
          selectedJobId={selectedJob?.id}
          title={title}
          triggerLabel="Contractor"
          variant={variant}
        />
        {/* Hidden while the drawer is open: its list already renders this
         * same job (highlighted), so keeping both mounted would duplicate
         * the job's landmarks (axe: landmark-unique) and the on-screen info. */}
        {selectedJob && !drawerOpen ? (
          <GameConstructionJobCard
            density="dense"
            job={selectedJob}
            onAction={onAction}
            onSelect={onSelectJob}
            selected
            showBeforeAfter={hasPreviewPair(selectedJob)}
            variant={variant}
          />
        ) : null}
        {!selectedJob ? (
          <GameEmptyState description={emptyDescription} icon="energy" title={emptyTitle} />
        ) : null}
      </section>
    );
  }

  return (
    <GamePanel
      className={classes}
      data-ui-hook="contractor-panel"
      data-variant={variant}
      data-testid={testId}
      title={title}
      tone="strong"
    >
      <section aria-label={label} data-density={density}>
        {subtitle ? <p className="game-ui-contractor-panel-subtitle">{subtitle}</p> : null}
        {jobs.length === 0 ? (
          <GameEmptyState description={emptyDescription} icon="energy" title={emptyTitle} />
        ) : null}
        {jobs.length > 0 ? (
          <div className="game-ui-contractor-panel-grid">
            <div
              aria-label="Construction job queue"
              className="game-ui-contractor-job-list"
              tabIndex={0}
            >
              {jobs.map((job) => (
                <GameConstructionJobCard
                  density={density}
                  job={job}
                  key={job.id}
                  onAction={onAction}
                  onSelect={onSelectJob}
                  selected={job.id === selectedJob?.id}
                  showApprovalBar={false}
                  variant={variant}
                />
              ))}
            </div>
            {selectedJob ? (
              <aside
                className="game-ui-contractor-detail"
                aria-label={`${selectedJob.title} detail`}
              >
                <GameConstructionProgress
                  label={`${selectedJob.title} progress detail`}
                  progressLabel={selectedJob.progressLabel}
                  status={selectedJob.status}
                  statusLabel={selectedJob.statusLabel}
                  steps={selectedJob.steps}
                  validationWarnings={selectedJob.validationWarnings}
                  value={selectedJob.progressValue}
                  max={selectedJob.progressMax}
                  variant={variant}
                />
                {hasPreviewPair(selectedJob) ? (
                  <GameBeforeAfterToggle
                    activeView={activePreviewView}
                    after={selectedJob.after}
                    before={selectedJob.before}
                    label={`${selectedJob.title} before and after`}
                    onViewChange={onPreviewViewChange}
                    variant={variant}
                  />
                ) : null}
                <GameRobotCrewStatus
                  crew={selectedJob.crew ?? []}
                  label={`${selectedJob.title} robot crew`}
                  title="Robot crew"
                  variant={variant}
                />
                <GameConstructionApprovalBar
                  actions={selectedJob.actions}
                  label={`${selectedJob.title} approval`}
                  onAction={onAction ? (actionId) => onAction(actionId, selectedJob.id) : undefined}
                  providerMode={selectedJob.providerMode}
                  status={selectedJob.status}
                  validationWarnings={selectedJob.validationWarnings}
                  variant={variant}
                />
              </aside>
            ) : null}
          </div>
        ) : null}
      </section>
    </GamePanel>
  );
}
