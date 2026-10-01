import { type ReactNode } from 'react';

/** A card not collected yet: its place in the set, and what unlocks it. Not interactive. */
export function GameCollectibleCardSlot({
  label,
  className,
}: {
  /** What unlocks it, shown on the slot and read as its name. */
  readonly label: string;
  readonly className?: string;
}): ReactNode {
  return (
    <div
      className={['game-ui-collect-card-slot', className].filter(Boolean).join(' ')}
      role="img"
      aria-label={label}
    >
      <span aria-hidden="true">?</span>
      <span>{label}</span>
    </div>
  );
}
