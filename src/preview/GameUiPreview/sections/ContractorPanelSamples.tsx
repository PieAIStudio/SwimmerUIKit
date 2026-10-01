import { type ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameContractorPanel } from '../../../game/construction/GameContractorPanel/GameContractorPanel';

import { type GameConstructionJob } from '../../../game/construction/model';

function ContractorPreviewCard({
  label,
  mode,
}: {
  label: string;
  mode: 'before' | 'after';
}): ReactNode {
  return (
    <div className="game-ui-construction-preview-card" data-preview={mode}>
      <GameAssetIcon icon={mode === 'before' ? 'home' : 'check'} size="xl" />
      <strong>{label}</strong>
      <small>{mode === 'before' ? 'current build zone' : 'approved preview'}</small>
    </div>
  );
}

const CONTRACTOR_PREVIEW_JOBS: readonly GameConstructionJob[] = [
  {
    id: 'preview-deck',
    title: 'Deck robot crew',
    description: 'Local-only construction queue for approved build assets.',
    status: 'working',
    location: 'South ledge',
    estimate: '4 min',
    progressValue: 64,
    providerMode: 'local-only',
    crew: [
      {
        id: 'bolt',
        name: 'Bolt',
        role: 'Foundation robot',
        status: 'working',
        task: 'Snapping beams',
        icon: 'energy',
      },
      {
        id: 'moss',
        name: 'Moss',
        role: 'Material robot',
        status: 'queued',
        task: 'Waiting for path tiles',
        icon: 'gem',
      },
    ],
    steps: [
      { id: 'draft', label: 'Draft', status: 'complete' },
      { id: 'preview', label: 'Preview', status: 'complete' },
      { id: 'build', label: 'Build', status: 'active', caption: 'placing beams' },
      { id: 'review', label: 'Review', status: 'pending' },
    ],
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
    before: {
      label: 'Before',
      caption: 'Uneven terrain pad.',
      content: <ContractorPreviewCard label="Rough pad" mode="before" />,
    },
    after: {
      label: 'After',
      caption: 'Flattened foundation pad with safe clearance.',
      content: <ContractorPreviewCard label="Foundation ready" mode="after" />,
    },
    validationWarnings: [
      {
        id: 'clearance',
        label: 'Validation clear',
        description: 'Avatar path and saved objects stay clear.',
        tone: 'success',
      },
    ],
  },
  {
    id: 'blocked-fence',
    title: 'Garden fence blocked',
    description: 'Fence segment crosses a saved object; revise or revert before commit.',
    status: 'blocked',
    location: 'Garden edge',
    estimate: 'blocked',
    progressValue: 44,
    providerMode: 'paid-disabled',
    validationWarnings: [
      {
        id: 'collision',
        label: 'Collision risk',
        description: 'Fence crosses an existing chair placement.',
        tone: 'warning',
      },
    ],
  },
];

export function ContractorPanelSamples(): ReactNode {
  return (
    <div className="game-ui-preview-two-up">
      <GameContractorPanel
        jobs={CONTRACTOR_PREVIEW_JOBS}
        label="AI contractor jobs"
        selectedJobId="review-house-pad"
        subtitle="Official contractor UI covers drafts, previews, robot work, validation, review, and local-only provider boundaries."
        title="AI contractor"
        variant="desktop"
      />
      <GameContractorPanel
        drawerOpen
        jobs={CONTRACTOR_PREVIEW_JOBS}
        label="Small mobile contractor jobs"
        selectedJobId="blocked-fence"
        title="Contractor"
        variant="small-mobile"
      />
    </div>
  );
}
