import { useState, type ReactNode } from 'react';
import { Button } from '../controls/Button/Button';

export interface CodeSampleProps {
  lines: readonly string[];
  copyLabel: string;
  copiedLabel?: string;
}

export function CodeSample({
  copiedLabel = 'Copied',
  copyLabel,
  lines,
}: CodeSampleProps): ReactNode {
  const [copied, setCopied] = useState(false);
  const source = lines.join('\n');
  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(source);
    } catch {}
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <div className="game-ui-showcase-code">
      <pre>
        <code>{source}</code>
      </pre>
      <Button
        type="button"
        variant="ghost"
        static
        className="game-ui-showcase-copy-button"
        onClick={copy}
      >
        {copied ? copiedLabel : copyLabel}
      </Button>
    </div>
  );
}
