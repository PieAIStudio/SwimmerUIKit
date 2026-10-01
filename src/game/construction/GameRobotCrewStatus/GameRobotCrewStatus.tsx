import type { ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameBadge, type GameBadgeTone } from '../../../feedback/GameBadge/GameBadge';

import { GameEmptyState } from '../../../feedback/GameEmptyState/GameEmptyState';
import {
  type GameRobotCrewMember,
  type GameConstructionVariant,
  type GameRobotCrewMemberStatus,
} from '../model';

export interface GameRobotCrewStatusProps {
  className?: string | undefined;
  crew: readonly GameRobotCrewMember[];
  emptyDescription?: string | undefined;
  emptyTitle?: string | undefined;
  label: string;
  title?: string | undefined;
  variant?: GameConstructionVariant | undefined;
  'data-testid'?: string | undefined;
}

const CREW_TONES: Readonly<Record<GameRobotCrewMemberStatus, GameBadgeTone>> = {
  blocked: 'danger',
  done: 'success',
  idle: 'neutral',
  queued: 'warning',
  working: 'ai',
};

export function GameRobotCrewStatus({
  className,
  crew,
  emptyDescription = 'Robot crew members appear here when a construction job starts.',
  emptyTitle = 'No robot crew assigned',
  label,
  title,
  variant = 'desktop',
  'data-testid': testId,
}: GameRobotCrewStatusProps): ReactNode {
  const classes = ['game-ui-robot-crew-status', className].filter(Boolean).join(' ');

  return (
    <section
      aria-label={label}
      className={classes}
      data-ui-hook="robot-crew-status"
      data-variant={variant}
      data-testid={testId}
    >
      {title ? (
        <header>
          <strong>{title}</strong>
        </header>
      ) : null}
      {crew.length === 0 ? (
        <GameEmptyState description={emptyDescription} icon="ai" title={emptyTitle} />
      ) : (
        <div className="game-ui-robot-crew-list">
          {crew.map((member) => (
            <article
              className="game-ui-robot-crew-member"
              data-crew-status={member.status}
              key={member.id}
            >
              <GameAssetIcon
                icon={member.icon ?? 'ai'}
                size={variant === 'small-mobile' ? 'sm' : 'md'}
              />
              <span className="game-ui-robot-crew-copy">
                <strong>{member.name}</strong>
                <small>{member.role}</small>
                {member.task ? <em>{member.task}</em> : null}
              </span>
              <GameBadge tone={CREW_TONES[member.status]}>{member.status}</GameBadge>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
