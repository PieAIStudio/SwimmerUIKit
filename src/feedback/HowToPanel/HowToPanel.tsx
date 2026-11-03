import { useState, type ReactNode } from 'react';
import { Button } from '../../controls/Button/Button';
import { HelpLoop } from '../HelpLoop/HelpLoop';

export interface HowToStep {
  media: ReactNode;
  poster?: ReactNode;
  caption: string;
}
export interface HowToPanelProps {
  steps: readonly HowToStep[];
  /** All labels and captions come from the app's i18n. */
  label: string;
  previousLabel: string;
  nextLabel: string;
}

export function HowToPanel({ steps, label, previousLabel, nextLabel }: HowToPanelProps): ReactNode {
  const [index, setIndex] = useState(0);
  const current = Math.min(index, steps.length - 1);
  const step = steps[current];
  if (!step) return null;
  const select = (next: number) => setIndex(Math.max(0, Math.min(steps.length - 1, next)));
  return (
    <section
      className="swimmer-how-to-panel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(event) => {
        const destinations: Record<string, number> = {
          ArrowLeft: current - 1,
          ArrowRight: current + 1,
          Home: 0,
          End: steps.length - 1,
        };
        const next = destinations[event.key];
        if (next !== undefined) {
          event.preventDefault();
          select(next);
        }
      }}
    >
      <div aria-live="polite" aria-atomic="true">
        <figure key={current} className="swimmer-how-to-step" role="img" aria-label={step.caption}>
          <HelpLoop poster={step.poster}>{step.media}</HelpLoop>
          <figcaption aria-hidden="true">{step.caption}</figcaption>
        </figure>
      </div>
      <nav className="swimmer-how-to-navigation" aria-label={label}>
        <Button disabled={current === 0} onClick={() => select(current - 1)}>
          {previousLabel}
        </Button>
        <span aria-hidden="true">
          {current + 1} / {steps.length}
        </span>
        <Button disabled={current === steps.length - 1} onClick={() => select(current + 1)}>
          {nextLabel}
        </Button>
      </nav>
    </section>
  );
}
