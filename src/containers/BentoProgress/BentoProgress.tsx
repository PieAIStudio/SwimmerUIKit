import type { ReactNode } from 'react';
import { joinClasses } from '../shared/classes';

export type BentoProgressState = 'done' | 'now' | 'waiting';

export interface BentoProgressTile {
  art?: ReactNode;
  detail?: ReactNode;
  id: string;
  label: ReactNode;
  state: BentoProgressState;
  value?: ReactNode;
}

export interface BentoProgressProps {
  className?: string;
  tiles: readonly BentoProgressTile[];
}

/** Static bento progress: done is checked, now is bright, waiting is dim. */
export function BentoProgress({ className, tiles }: BentoProgressProps): ReactNode {
  return (
    <section
      aria-label="Progress"
      className={joinClasses('game-ui-bento-progress', className)}
      data-tool-part="bento-progress"
    >
      {tiles.map((tile) => (
        <article className="game-ui-bento-tile" data-state={tile.state} key={tile.id}>
          <div className="game-ui-bento-label">
            {tile.label}
            {tile.state === 'done' ? <span aria-label="Done"> ✓</span> : null}
          </div>
          {tile.art ? <div className="game-ui-bento-art">{tile.art}</div> : null}
          {tile.value ? <div className="game-ui-bento-value">{tile.value}</div> : null}
          {tile.detail ? <small className="game-ui-bento-detail">{tile.detail}</small> : null}
        </article>
      ))}
    </section>
  );
}
