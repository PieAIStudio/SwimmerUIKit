import type { ReactNode } from 'react';

import { type GameBadgeTone } from '../../feedback/GameBadge/GameBadge';

import { type GameButtonVariant } from '../../controls/GameButton/GameButton';

import type { ClayIconName } from '../../icons/assets';

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
