import { type CSSProperties, type ReactNode } from 'react';

import { type ClayIconName } from '../../icons/assets';
import { GameAssetIcon } from '../../icons/GameAssetIcon/GameAssetIcon';

export interface GameCardFanCard {
  id: string;
  icon?: ClayIconName;
  kicker: string;
  title: string;
}

export interface GameCardFanProps {
  cards: readonly GameCardFanCard[];
  className?: string;
  label: string;
}

export function GameCardFan({ cards, className, label }: GameCardFanProps): ReactNode {
  const classes = ['game-ui-card-fan', className].filter(Boolean).join(' ');
  const midpoint = (cards.length - 1) / 2;
  return (
    <div aria-label={label} className={classes} role="list">
      {cards.map((card, index) => {
        const style = {
          '--game-ui-card-index': index,
          '--game-ui-card-offset': index - midpoint,
        } as CSSProperties;
        return (
          <li className="game-ui-card-fan-card" key={card.id} style={style}>
            {card.icon ? <GameAssetIcon icon={card.icon} size="lg" /> : null}
            <small>{card.kicker}</small>
            <strong>{card.title}</strong>
          </li>
        );
      })}
    </div>
  );
}
