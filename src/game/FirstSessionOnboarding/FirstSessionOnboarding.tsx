import type { ReactNode } from 'react';

import { GameIcon } from '../../icons/GameIcon/GameIcon';

import { GameBadge } from '../../feedback/GameBadge/GameBadge';

import { GameButton } from '../../controls/GameButton/GameButton';

export interface FirstSessionOnboardingStep {
  body: string;
  title: string;
}

export interface FirstSessionOnboardingLabels {
  badge: string;
  body: string;
  skip: string;
  start: string;
  steps: readonly FirstSessionOnboardingStep[];
  title: string;
}

export interface FirstSessionOnboardingProps {
  labels: FirstSessionOnboardingLabels;
  onDismiss: () => void;
  open: boolean;
}

export function FirstSessionOnboarding({
  labels,
  onDismiss,
  open,
}: FirstSessionOnboardingProps): ReactNode {
  if (!open) return null;

  return (
    <aside
      aria-labelledby="swimmer-first-session-onboarding-title"
      aria-modal="true"
      className="swimmer-first-session-onboarding"
      role="dialog"
    >
      <div className="swimmer-first-session-onboarding-scrim" />
      <div className="swimmer-first-session-onboarding-card">
        <GameIcon icon="trophy" size="lg" />
        <GameBadge tone="warning">{labels.badge}</GameBadge>
        <h2 id="swimmer-first-session-onboarding-title">{labels.title}</h2>
        <p>{labels.body}</p>
        <ol className="swimmer-first-session-onboarding-steps">
          {labels.steps.map((step, index) => (
            <li key={step.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{step.title}</strong>
              <small>{step.body}</small>
            </li>
          ))}
        </ol>
        <div className="swimmer-first-session-onboarding-actions">
          <GameButton onClick={onDismiss} variant="primary">
            {labels.start}
          </GameButton>
          <GameButton onClick={onDismiss} variant="ghost">
            {labels.skip}
          </GameButton>
        </div>
      </div>
    </aside>
  );
}
