import { useState, type FormEvent, type ReactNode } from 'react';
import { Button, Input } from '@pieai/swimmer-ui-kit';
import { useShowcaseLanguage } from './ShowcaseContext';
import type { ShowcaseLanguage } from './types';

export type DemoPanelVariant = 'io' | 'stage';

export interface DemoPanelProps {
  variant?: DemoPanelVariant;
  language?: ShowcaseLanguage;
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
  language,
  label,
  onRun,
  placeholder,
  resultLabel,
  runLabel,
  stageLabel,
  variant = 'io',
}: DemoPanelProps): ReactNode {
  const activeLanguage = useShowcaseLanguage(language);
  const zh = activeLanguage === 'zh';
  const promptText = label ?? (zh ? '提示' : 'Prompt');
  const outputText = resultLabel ?? (zh ? '输出' : 'Output');
  const runText = runLabel ?? (zh ? '运行' : 'Run');
  const stageText = stageLabel ?? (zh ? '组件演示' : 'Live component');
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
        aria-label={stageText}
      >
        <div className="game-ui-showcase-stage">{children}</div>
      </section>
    );
  }

  return (
    <form className="game-ui-showcase-demo game-ui-showcase-demo--io" onSubmit={submit}>
      <label className="game-ui-showcase-label" htmlFor="showcase-demo-input">
        {promptText}
      </label>
      <div className="game-ui-showcase-demo__row">
        <Input
          id="showcase-demo-input"
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button type="submit" variant="primary">
          {runText}
        </Button>
      </div>
      <output className="game-ui-showcase-demo__output" aria-live="polite">
        <span>{outputText}</span>
        <strong>{result || '—'}</strong>
      </output>
      {children}
    </form>
  );
}
