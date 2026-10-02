import { useState, type ReactNode } from 'react';

import { GameButton, type GameButtonVariant } from '../../controls/GameButton/GameButton';

import { GamePanel } from '../../containers/GamePanel/GamePanel';
import { type Copy } from './copyTypes';
import { TONES } from './constants';

export function Tones({ copy }: { copy: Copy }): ReactNode {
  const [selected, setSelected] = useState<GameButtonVariant>('primary');
  const [pressed, setPressed] = useState<GameButtonVariant | null>(null);
  return (
    <>
      <div className="game-ui-liquid-demo-controls" role="group" aria-label="颜色对照">
        {TONES.map((tone) => (
          <GameButton key={tone} aria-pressed={selected === tone} onClick={() => setSelected(tone)}>
            {tone}
          </GameButton>
        ))}
      </div>
      <div className="game-ui-liquid-page__tones">
        {TONES.filter((tone) => tone === selected).map((tone) => (
          <GamePanel className="game-ui-liquid-page__tone" key={tone} tone="strong">
            <h4>{tone}</h4>
            <GameButton variant={tone}>{copy.flat}</GameButton>
            <span
              onPointerCancel={() => setPressed(null)}
              onPointerDown={() => setPressed(tone)}
              onPointerLeave={() => setPressed(null)}
              onPointerUp={() => setPressed(null)}
            >
              <GameButton variant={tone}>{copy.liquid}</GameButton>
            </span>
            <small>{pressed === tone ? copy.engaged : copy.rest}</small>
          </GamePanel>
        ))}
      </div>
    </>
  );
}
