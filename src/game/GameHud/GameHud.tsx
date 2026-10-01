import { type ReactNode } from 'react';

import { type ClayIconName } from '../../icons/assets';
import { GameAssetIcon } from '../../icons/GameAssetIcon/GameAssetIcon';

export interface GameHudItem {
  icon?: ClayIconName;
  id: string;
  label: string;
  meta?: string;
  value: string;
}

export interface GameHudProps {
  actions?: ReactNode;
  className?: string;
  items: readonly GameHudItem[];
  label: string;
}

export function GameHud({ actions, className, items, label }: GameHudProps): ReactNode {
  const classes = ['game-ui-hud', className].filter(Boolean).join(' ');
  return (
    <section aria-label={label} className={classes}>
      <div className="game-ui-hud-cluster">
        {items.map((item) => (
          <article className="game-ui-hud-chip" key={item.id}>
            {item.icon ? <GameAssetIcon icon={item.icon} size="md" /> : null}
            <span>
              <small>{item.label}</small>
              <strong>{item.value}</strong>
              {item.meta ? <em>{item.meta}</em> : null}
            </span>
          </article>
        ))}
      </div>
      {actions ? <div className="game-ui-hud-tools">{actions}</div> : null}
    </section>
  );
}
