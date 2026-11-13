import { useState, type FormEvent, type ReactNode } from 'react';
import { Button, Input } from '@pieai/swimmer-ui-kit';

export type DemoPanelVariant = 'io' | 'stage';

export interface DemoPanelProps {
  variant?: DemoPanelVariant;
  label?: string;
  placeholder?: string;
  runLabel?: string;
  initialValue?: string;
  resultLabel?: string;
  stageLabel?: string;
  onRun?: (value: string) => string;
  children?: ReactNode;
}

export function DemoPanel({
  children,
  initialValue = '',
  label = 'Input',
  onRun,
  placeholder,
  resultLabel = 'Output',
  runLabel = 'Run',
  stageLabel = 'Live component',
  variant = 'io',
}: DemoPanelProps): ReactNode {
  const [value, setValue] = useState(initialValue);
  const [result, setResult] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setResult(onRun?.(value) ?? value);
  };

  if (variant === 'stage') {
    return (
      <section
        className="game-ui-showcase-demo game-ui-showcase-demo--stage"
        aria-label={stageLabel}
      >
        <div className="game-ui-showcase-stage">{children}</div>
      </section>
    );
  }

  return (
    <form className="game-ui-showcase-demo game-ui-showcase-demo--io" onSubmit={submit}>
      <label className="game-ui-showcase-label" htmlFor="showcase-demo-input">
        {label}
      </label>
      <div className="game-ui-showcase-demo__row">
        <Input
          id="showcase-demo-input"
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button type="submit" variant="primary">
          {runLabel}
        </Button>
      </div>
      <output className="game-ui-showcase-demo__output" aria-live="polite">
        <span>{resultLabel}</span>
        <strong>{result || '—'}</strong>
      </output>
      {children}
    </form>
  );
}
