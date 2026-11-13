import type { ReactNode } from 'react';

export type FlowStep = { label: string; detail?: ReactNode };
export interface FlowStripProps {
  steps: readonly FlowStep[];
}

export function FlowStrip({ steps }: FlowStripProps): ReactNode {
  return (
    <ol className="game-ui-showcase-flow" aria-label="Demo flow">
      {steps.map((step, index) => (
        <li className="game-ui-showcase-flow__step" key={step.label}>
          <span className="game-ui-showcase-flow__index">0{index + 1}</span>
          <strong>{step.label}</strong>
          {step.detail ? <span>{step.detail}</span> : null}
        </li>
      ))}
    </ol>
  );
}
