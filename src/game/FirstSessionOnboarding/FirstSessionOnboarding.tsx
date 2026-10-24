import type { ReactNode } from 'react';

import { Icon } from '../../icons/Icon/Icon';

import { Badge } from '../../feedback/Badge/Badge';

import { Button } from '../../controls/Button/Button';

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
        <Icon icon="trophy" size="lg" />
        <Badge tone="warning">{labels.badge}</Badge>
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
          <Button onClick={onDismiss} variant="primary">
            {labels.start}
          </Button>
          <Button onClick={onDismiss} variant="ghost">
            {labels.skip}
          </Button>
        </div>
      </div>
    </aside>
  );
}
