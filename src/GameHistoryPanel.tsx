import type { ReactNode } from 'react';

export type GameUiHistoryKind = 'human' | 'mystery' | 'system';

export interface GameUiHistoryEntry {
  id: string;
  kind: GameUiHistoryKind;
  meta: string;
  speaker: string;
  text: string;
}

export interface GameHistoryPanelProps {
  entries: readonly GameUiHistoryEntry[];
  label: string;
}

export function GameHistoryPanel({ entries, label }: GameHistoryPanelProps): ReactNode {
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
