import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  GameBeforeAfterToggle,
  GameConstructionApprovalBar,
  GameConstructionJobCard,
  GameConstructionProgress,
  GameContractorPanel,
  GameRobotCrewStatus,
  type GameBeforeAfterView,
  type GameConstructionJob,
} from '../index';

const meta = {
  title: 'Clay/Game Surface Pack/Contractor Construction UI',
  component: GameContractorPanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Official AI contractor / construction robot UI for game surfaces. Host games own runtime state, construction commands, persistence, and provider boundaries.',
      },
    },
  },
} satisfies Meta<typeof GameContractorPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

function PreviewCard({ label, mode }: { label: string; mode: 'before' | 'after' }) {
  return (
    <div className="game-ui-construction-preview-card" data-preview={mode}>
      <strong>{label}</strong>
      <small>{mode === 'before' ? 'current island' : 'proposed build'}</small>
    </div>
  );
}

const jobs: readonly GameConstructionJob[] = [
  {
    id: 'draft-pergola',
    title: 'Pergola draft',
    description: 'Local-only contractor sketch before any provider is allowed.',
    status: 'draft',
    location: 'Home terrace',
    estimate: '2 min',
    providerMode: 'local-only',
    progressValue: 8,
    badges: [{ label: 'WOC-first', tone: 'success' }],
    validationWarnings: [{ id: 'local', label: 'Local-only draft', description: 'No paid provider request has been made.', tone: 'success' }],
    steps: [
      { id: 'intent', label: 'Read request', status: 'active', caption: 'awaiting preview' },
      { id: 'validate', label: 'Validate footprint', status: 'pending' },
      { id: 'review', label: 'Owner review', status: 'pending' },
    ],
  },
  {
    id: 'preview-bridge',
    title: 'Bridge path preview',
    description: 'Shows the proposed crossing without committing runtime scene changes.',
    status: 'preview',
    location: 'West ravine',
    estimate: 'ready',
    providerMode: 'mock',
    progressValue: 28,
    before: { label: 'Before', caption: 'A gap between two cliff edges.', content: <PreviewCard label="Open gap" mode="before" /> },
    after: { label: 'After', caption: 'Bridge footprint projected in the build zone.', content: <PreviewCard label="Bridge preview" mode="after" /> },
  },
  {
    id: 'queued-cabin',
    title: 'Cabin shell queue',
    description: 'Waiting for local construction slot.',
    status: 'queued',
    location: 'Pine shelf',
    estimate: 'next',
    providerMode: 'paid-disabled',
    progressValue: 34,
  },
  {
    id: 'working-deck',
    title: 'Deck robot crew',
    description: 'Construction robots place deck pieces from approved local assets.',
    status: 'working',
    location: 'South deck',
    estimate: '4 min',
    progressValue: 64,
    crew: [
      { id: 'bolt', name: 'Bolt', role: 'Foundation robot', status: 'working', task: 'Snapping beams', icon: 'energy' },
      { id: 'moss', name: 'Moss', role: 'Material robot', status: 'queued', task: 'Waiting for path tiles', icon: 'gem' },
      { id: 'pip', name: 'Pip', role: 'Safety robot', status: 'done', task: 'Checked avatar clearance', icon: 'check' },
    ],
    steps: [
      { id: 'draft', label: 'Draft', status: 'complete' },
      { id: 'preview', label: 'Preview', status: 'complete' },
      { id: 'build', label: 'Build', status: 'active', caption: 'placing beams' },
      { id: 'review', label: 'Review', status: 'pending' },
    ],
  },
  {
    id: 'blocked-fence',
    title: 'Garden fence blocked',
    description: 'Fence segment crosses a saved object; owner must revise or revert.',
    status: 'blocked',
    location: 'Garden edge',
    estimate: 'blocked',
    progressValue: 44,
    validationWarnings: [{ id: 'collision', label: 'Collision risk', description: 'Fence crosses an existing chair placement.', tone: 'warning' }],
    crew: [{ id: 'guard', name: 'Guard', role: 'Validation robot', status: 'blocked', task: 'Needs revised path', icon: 'alert' }],
  },
  {
    id: 'review-house-pad',
    title: 'House pad review',
    description: 'Owner approval required before accepting terrain and block placement.',
    status: 'readyForReview',
    location: 'Main island',
    estimate: 'review',
    progressValue: 92,
    providerMode: 'local-only',
    facts: [{ id: 'pieces', label: 'Pieces', value: '18 blocks' }, { id: 'budget', label: 'Budget', value: 'safe' }],
    before: { label: 'Before', caption: 'Uneven terrain pad.', content: <PreviewCard label="Rough pad" mode="before" /> },
    after: { label: 'After', caption: 'Flattened foundation pad with safe clearance.', content: <PreviewCard label="Foundation ready" mode="after" /> },
    steps: [
      { id: 'draft', label: 'Draft', status: 'complete' },
      { id: 'validate', label: 'Validate', status: 'complete' },
      { id: 'build', label: 'Build', status: 'complete' },
      { id: 'review', label: 'Review', status: 'active', caption: 'owner decision' },
    ],
  },
  { id: 'accepted-stairs', title: 'Accepted stair set', description: 'Accepted build can still be reverted by the host app.', status: 'accepted', location: 'Dock', progressValue: 100 },
  { id: 'cancelled-tower', title: 'Cancelled tower', description: 'Cancelled job remains visible for undo/revert flows.', status: 'cancelled', location: 'Lookout', progressValue: 0 },
];

const selectedJob = jobs[5] as GameConstructionJob;

export const DesktopPanel: Story = {
  args: {
    jobs,
    label: 'AI contractor jobs',
    selectedJobId: selectedJob.id,
    subtitle: 'Official queue for local AI construction drafts, previews, robot work, validation, and owner approval.',
    title: 'AI contractor',
    variant: 'desktop',
  },
};

export const TabletPanel: Story = {
  args: {
    ...DesktopPanel.args,
    density: 'dense',
    title: 'Contractor queue',
    variant: 'tablet',
  },
};

export const MobileDrawer: Story = {
  args: {
    drawerOpen: true,
    jobs,
    label: 'Mobile contractor jobs',
    selectedJobId: 'blocked-fence',
    title: 'Contractor',
    variant: 'mobile',
  },
};

export const SmallMobileDrawer: Story = {
  args: {
    drawerOpen: true,
    jobs,
    label: 'Small mobile contractor jobs',
    selectedJobId: 'review-house-pad',
    title: 'Contractor',
    variant: 'small-mobile',
  },
};

export const ApprovalStates: StoryObj = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      {(['draft', 'preview', 'queued', 'working', 'blocked', 'readyForReview', 'accepted', 'cancelled'] as const).map((status) => (
        <GameConstructionApprovalBar key={status} label={`${status} actions`} status={status} providerMode={status === 'queued' ? 'paid-disabled' : 'local-only'} validationWarnings={status === 'blocked' ? [{ id: 'warn', label: 'Collision risk', tone: 'warning' }] : []} />
      ))}
    </div>
  ),
};

export const RobotCrewAndProgress: StoryObj = {
  render: () => (
    <div className="game-ui-preview-two-up">
      <GameConstructionProgress label="Working progress" status="working" value={64} steps={jobs[3]?.steps ?? []} validationWarnings={jobs[4]?.validationWarnings ?? []} />
      <GameRobotCrewStatus crew={jobs[3]?.crew ?? []} label="Robot crew" title="Robot crew" />
    </div>
  ),
};

export const BeforeAfter: StoryObj = {
  render: function BeforeAfterStory() {
    const [view, setView] = useState<GameBeforeAfterView>('after');
    return (
      <GameBeforeAfterToggle
        activeView={view}
        after={selectedJob.after ?? { label: 'After' }}
        before={selectedJob.before ?? { label: 'Before' }}
        label="Construction before and after"
        onViewChange={setView}
      />
    );
  },
};

export const JobCardBlocked: StoryObj = {
  render: () => <GameConstructionJobCard job={jobs[4] as GameConstructionJob} selected showApprovalBar variant="desktop" />,
};

export const ResponsiveMatrix: StoryObj = {
  parameters: {
    // This gallery intentionally renders the same job data 4x side by side
    // to compare breakpoints — a real page only ever mounts one panel, so
    // the resulting duplicate nested landmark labels are a demo-only
    // artifact, not a real violation for someone using the component once.
    a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
  },
  render: () => {
    const frames = [
      { id: 'desktop', label: 'Desktop 1440', width: 1180, variant: 'desktop' as const, selected: 'review-house-pad' },
      { id: 'tablet', label: 'Tablet 768', width: 768, variant: 'tablet' as const, selected: 'working-deck' },
      { id: 'mobile', label: 'Mobile landscape 844', width: 844, variant: 'mobile' as const, selected: 'blocked-fence' },
      { id: 'small-mobile', label: 'Small mobile 360', width: 360, variant: 'small-mobile' as const, selected: 'review-house-pad' },
    ];

    return (
      <div style={{ display: 'grid', gap: 16 }}>
        {frames.map((frame) => (
          <section key={frame.id} style={{ display: 'grid', gap: 8, maxWidth: '100%', overflowX: 'auto' }}>
            <strong>{frame.label}</strong>
            <div style={{ border: '1px dashed rgba(92,60,39,.32)', borderRadius: 18, padding: 10, width: frame.width }}>
              <GameContractorPanel
                drawerOpen
                jobs={jobs}
                label={`${frame.label} contractor panel`}
                selectedJobId={frame.selected}
                title="AI contractor"
                variant={frame.variant}
              />
            </div>
          </section>
        ))}
      </div>
    );
  },
};
