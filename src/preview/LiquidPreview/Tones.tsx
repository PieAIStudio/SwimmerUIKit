import { useState, type ReactNode } from 'react';

import { Button, type ButtonVariant } from '../../controls/Button/Button';

import { Panel } from '../../containers/Panel/Panel';
import { type Copy } from './copyTypes';
import { TONES } from './constants';

export function Tones({ copy }: { copy: Copy }): ReactNode {
  const [selected, setSelected] = useState<ButtonVariant>('primary');
  const [pressed, setPressed] = useState<ButtonVariant | null>(null);
  return (
    <>
      <div className="game-ui-liquid-demo-controls" role="group" aria-label="颜色对照">
        {TONES.map((tone) => (
          <Button key={tone} aria-pressed={selected === tone} onClick={() => setSelected(tone)}>
            {tone}
          </Button>
        ))}
      </div>
      <div className="game-ui-liquid-page__tones">
        {TONES.filter((tone) => tone === selected).map((tone) => (
          <Panel className="game-ui-liquid-page__tone" key={tone} tone="strong">
            <h4>{tone}</h4>
            <Button variant={tone}>{copy.flat}</Button>
            <span
              onPointerCancel={() => setPressed(null)}
              onPointerDown={() => setPressed(tone)}
              onPointerLeave={() => setPressed(null)}
              onPointerUp={() => setPressed(null)}
            >
              <Button variant={tone}>{copy.liquid}</Button>
            </span>
            <small>{pressed === tone ? copy.engaged : copy.rest}</small>
          </Panel>
        ))}
      </div>
    </>
  );
}
