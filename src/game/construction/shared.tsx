import { type GameBadgeTone } from '../../feedback/GameBadge/GameBadge';

import type { ClayIconName } from '../../icons/assets';
import {
  type GameConstructionJobStatus,
  type GameConstructionProviderMode,
  type GameConstructionJob,
  type GameConstructionPreviewPane,
} from './model';

export const STATUS_TONES: Readonly<Record<GameConstructionJobStatus, GameBadgeTone>> = {
  accepted: 'success',
  blocked: 'danger',
  cancelled: 'neutral',
  draft: 'neutral',
  preview: 'ai',
  queued: 'warning',
  readyForReview: 'success',
  working: 'ai',
};

export const STATUS_ICONS: Readonly<Record<GameConstructionJobStatus, ClayIconName>> = {
  accepted: 'check',
  blocked: 'alert',
  cancelled: 'close',
  draft: 'scroll',
  preview: 'compass',
  queued: 'hourglass',
  readyForReview: 'vote',
  working: 'energy',
};

export const PROVIDER_LABELS: Readonly<Record<GameConstructionProviderMode, string>> = {
  'local-only': 'Local only',
  mock: 'Mock run',
  'paid-disabled': 'Paid provider off',
};

export const PROVIDER_TONES: Readonly<Record<GameConstructionProviderMode, GameBadgeTone>> = {
  'local-only': 'success',
  mock: 'ai',
  'paid-disabled': 'warning',
};

export function statusLabel(status: GameConstructionJobStatus, explicitLabel?: string): string {
  if (explicitLabel) return explicitLabel;
  switch (status) {
    case 'readyForReview':
      return 'Ready for review';
    default:
      return status.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
  }
}

export function hasPreviewPair(job: GameConstructionJob): job is GameConstructionJob & {
  before: GameConstructionPreviewPane;
  after: GameConstructionPreviewPane;
} {
  return Boolean(job.before && job.after);
}
