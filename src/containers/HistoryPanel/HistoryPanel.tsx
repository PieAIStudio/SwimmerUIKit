import type { ReactNode } from 'react';

export type UiHistoryKind = 'human' | 'mystery' | 'system';

export interface UiHistoryEntry {
  id: string;
  kind: UiHistoryKind;
  meta: string;
  speaker: string;
  text: string;
}

export interface HistoryPanelProps {
  entries: readonly UiHistoryEntry[];
  label: string;
}

export function HistoryPanel({ entries, label }: HistoryPanelProps): ReactNode {
  return (
    <section aria-label={label} className="game-ui-history">
      {entries.map((entry) => (
        <article className="game-ui-history-entry" data-entry-kind={entry.kind} key={entry.id}>
          <div className="game-ui-history-entry-header">
            <strong>{entry.speaker}</strong>
            <span>{entry.meta}</span>
          </div>
          <p>{entry.text}</p>
        </article>
      ))}
    </section>
  );
}
