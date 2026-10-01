import type { ReactNode } from 'react';

import { GameCompactGameDrawer } from '../../terrain/GameCompactGameDrawer/GameCompactGameDrawer';
import { type GameConstructionJob, type GameConstructionVariant } from '../model';
import { GameConstructionJobCard } from '../GameConstructionJobCard/GameConstructionJobCard';

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
