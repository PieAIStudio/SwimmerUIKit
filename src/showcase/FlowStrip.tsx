import type { ReactNode } from 'react';
import { useShowcaseLanguage } from './ShowcaseContext';
import type { Localized, ShowcaseLanguage } from './types';

export type FlowStep = {
  label: string | Localized;
  detail?: ReactNode | Localized;
};
export interface FlowStripProps {
  steps: readonly FlowStep[];
  ariaLabel?: string | Localized;
}

function isLocalized(value: unknown): value is Localized {
  return (
    typeof value === 'object' &&
    value !== null &&
    'en' in value &&
    'zh' in value &&
    typeof (value as { en?: unknown }).en === 'string' &&
    typeof (value as { zh?: unknown }).zh === 'string'
  );
}

function renderText(value: string | Localized | ReactNode, language: ShowcaseLanguage): ReactNode {
  return isLocalized(value) ? value[language] : value;
}

export function FlowStrip({ ariaLabel, steps }: FlowStripProps): ReactNode {
  const language = useShowcaseLanguage();
  const label = ariaLabel
    ? renderText(ariaLabel, language)
    : language === 'zh'
      ? '演示流程'
      : 'Demo flow';
  return (
    <ol className="game-ui-showcase-flow" aria-label={label as string}>
      {steps.map((step, index) => (
        <li
          className="game-ui-showcase-flow__step"
          key={`${index}-${renderText(step.label, language)}`}
        >
          <span className="game-ui-showcase-flow__index">0{index + 1}</span>
          <strong>{renderText(step.label, language)}</strong>
          {step.detail ? <span>{renderText(step.detail, language)}</span> : null}
        </li>
      ))}
    </ol>
  );
}
