import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '../controls/Button/Button';
import { Input } from '../controls/Input/Input';

export interface DemoPanelProps {
  label: string;
  placeholder?: string;
  runLabel: string;
  initialValue?: string;
  resultLabel: string;
  onRun?: (value: string) => string;
  children?: ReactNode;
}

export function DemoPanel({
  children,
  initialValue = '',
  label,
  onRun,
  placeholder,
  resultLabel,
  runLabel,
}: DemoPanelProps): ReactNode {
  const [value, setValue] = useState(initialValue);
  const [result, setResult] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setResult(onRun?.(value) ?? value);
  };
  return (
    <form className="game-ui-showcase-demo" onSubmit={submit}>
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
