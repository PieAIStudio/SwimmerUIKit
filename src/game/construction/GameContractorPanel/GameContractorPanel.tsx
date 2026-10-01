import type { ReactNode } from 'react';

import { GameEmptyState } from '../../../feedback/GameEmptyState/GameEmptyState';

import { type GameSurfaceDensity } from '../../../containers/shared/surfaceTypes';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';
import {
  type GameBeforeAfterView,
  type GameConstructionJob,
  type GameConstructionVariant,
} from '../model';
import { GameCompactJobDrawer } from '../GameCompactJobDrawer/GameCompactJobDrawer';
import { GameConstructionJobCard } from '../GameConstructionJobCard/GameConstructionJobCard';
import { hasPreviewPair } from '../shared';
import { GameConstructionProgress } from '../GameConstructionProgress/GameConstructionProgress';
import { GameBeforeAfterToggle } from '../GameBeforeAfterToggle/GameBeforeAfterToggle';
import { GameRobotCrewStatus } from '../GameRobotCrewStatus/GameRobotCrewStatus';
import { GameConstructionApprovalBar } from '../GameConstructionApprovalBar/GameConstructionApprovalBar';

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
