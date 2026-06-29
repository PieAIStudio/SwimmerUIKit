import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import {
  GameBeforeAfterToggle,
  GameCompactJobDrawer,
  GameConstructionApprovalBar,
  GameConstructionJobCard,
  GameConstructionProgress,
  GameContractorPanel,
  GameRobotCrewStatus,
  type GameConstructionJob,
} from './GameContractorTools';

const compact = (markup: string): string => markup.replace(/\s+/g, ' ');

const jobs: readonly GameConstructionJob[] = [
  {
    id: 'job-draft',
    title: 'Draft a porch contract',
    description: 'Local plan only, no paid provider call.',
    status: 'draft',
    location: 'North ridge',
    estimate: '2 min',
    providerMode: 'local-only',
    progressValue: 8,
    validationWarnings: [{ id: 'local', label: 'Local-only draft', description: 'No provider request has been sent.', tone: 'success' }],
  },
  {
    id: 'job-preview',
    title: 'Preview bridge path',
    status: 'preview',
    providerMode: 'mock',
    progressValue: 28,
    before: { label: 'Before', caption: 'Empty cliff edge' },
    after: { label: 'After', caption: 'Projected bridge footprint' },
  },
  {
    id: 'job-queued',
    title: 'Queue wall robot',
    status: 'queued',
    estimate: 'waiting',
    providerMode: 'paid-disabled',
  },
  {
    id: 'job-working',
    title: 'Robot crew builds deck',
    status: 'working',
    progressValue: 64,
    crew: [{ id: 'bot-01', name: 'Bolt', role: 'Foundation robot', status: 'working', task: 'Snapping beams' }],
    steps: [
      { id: 'draft', label: 'Draft', status: 'complete' },
      { id: 'validate', label: 'Validate', status: 'complete' },
      { id: 'build', label: 'Build', status: 'active', caption: 'placing deck pieces' },
    ],
  },
  {
    id: 'job-blocked',
    title: 'Fence around garden',
    status: 'blocked',
    progressValue: 44,
    validationWarnings: [{ id: 'collision', label: 'Collision risk', description: 'Fence crosses a saved object.', tone: 'warning' }],
  },
  {
    id: 'job-review',
    title: 'Review house pad',
    status: 'readyForReview',
    progressValue: 92,
    before: { label: 'Before', caption: 'Uneven island pad' },
    after: { label: 'After', caption: 'Flattened foundation preview' },
  },
  { id: 'job-accepted', title: 'Accepted stair set', status: 'accepted', progressValue: 100 },
  { id: 'job-cancelled', title: 'Cancelled tower', status: 'cancelled', progressValue: 0 },
];

const workingJob = jobs.find((job) => job.id === 'job-working') as GameConstructionJob;

describe('contractor construction UI pack', () => {
  it('covers construction progress, validation warnings, and all required job statuses', () => {
    const html = compact(renderToStaticMarkup(
      <GameContractorPanel
        drawerOpen
        jobs={jobs}
        label="AI contractor jobs"
        selectedJobId="job-review"
        subtitle="Official construction queue"
        title="Contractor"
        variant="desktop"
      />,
    ));

    expect(html).toContain('data-ui-hook="contractor-panel"');
    expect(html).toContain('data-status="draft"');
    expect(html).toContain('data-status="preview"');
    expect(html).toContain('data-status="queued"');
    expect(html).toContain('data-status="working"');
    expect(html).toContain('data-status="blocked"');
    expect(html).toContain('data-status="readyForReview"');
    expect(html).toContain('data-status="accepted"');
    expect(html).toContain('data-status="cancelled"');
    expect(html).toContain('Collision risk');
    expect(html).toContain('Local only');
    expect(html).toContain('Paid provider off');
  });

  it('renders approval actions for approve, cancel, revise, and revert', () => {
    const review = compact(renderToStaticMarkup(<GameConstructionApprovalBar label="Review approval" status="readyForReview" />));
    const blocked = compact(renderToStaticMarkup(<GameConstructionApprovalBar label="Blocked approval" status="blocked" />));
    const preview = compact(renderToStaticMarkup(<GameConstructionApprovalBar label="Preview approval" status="preview" />));

    expect(review).toContain('Approve');
    expect(review).toContain('Revise');
    expect(review).toContain('Revert');
    expect(blocked).toContain('Cancel');
    expect(preview).toContain('Approve');
  });

  it('renders compact mobile drawer and small-screen captions through dense cards', () => {
    const html = compact(renderToStaticMarkup(
      <GameContractorPanel
        drawerOpen
        jobs={jobs}
        label="Mobile contractor jobs"
        selectedJobId="job-blocked"
        title="Contractor"
        variant="small-mobile"
      />,
    ));

    expect(html).toContain('data-ui-hook="compact-game-drawer"');
    expect(html).toContain('data-variant="small-mobile"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('Contractor');
  });

  it('renders standalone job card, progress, crew, and before/after components', () => {
    const html = compact(renderToStaticMarkup(
      <>
        <GameConstructionJobCard job={workingJob} showApprovalBar showBeforeAfter variant="tablet" />
        <GameConstructionProgress label="Progress" status="working" steps={workingJob.steps} value={64} />
        <GameRobotCrewStatus crew={workingJob.crew ?? []} label="Crew" />
        <GameBeforeAfterToggle activeView="after" after={{ label: 'After', caption: 'Finished pad' }} before={{ label: 'Before', caption: 'Rough pad' }} label="Compare" />
      </>,
    ));

    expect(html).toContain('data-ui-hook="construction-job-card"');
    expect(html).toContain('data-ui-hook="construction-progress"');
    expect(html).toContain('data-step-status="active"');
    expect(html).toContain('data-ui-hook="robot-crew-status"');
    expect(html).toContain('data-ui-hook="before-after-toggle"');
    expect(html).toContain('Finished pad');
  });

  it('renders compact drawer directly with a stable panel id', () => {
    const closed = compact(renderToStaticMarkup(
      <GameCompactJobDrawer jobs={jobs} label="Jobs" open={false} panelId="contractor-drawer" title="Contractor" />,
    ));
    const open = compact(renderToStaticMarkup(
      <GameCompactJobDrawer jobs={jobs} label="Jobs" open panelId="contractor-drawer" title="Contractor" />,
    ));

    expect(closed).toContain('aria-expanded="false"');
    expect(closed).toContain('aria-controls="contractor-drawer"');
    expect(open).toContain('aria-expanded="true"');
    expect(open).toContain('data-job-id="job-review"');
  });
});
