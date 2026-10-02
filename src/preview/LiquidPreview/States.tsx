import { useState } from 'react';
import { GameButton } from '../../controls/GameButton/GameButton';
import { GamePanel } from '../../containers/GamePanel/GamePanel';
import type { Copy } from './copyTypes';

/** One live CTA, not a second recreation of the native/button paint assembly. */
export function States({ copy }: { copy: Copy }) {
  const [disabled, setDisabled] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <GamePanel className="game-ui-liquid-page__states" title={copy.rest}>
      <p>按住观察轮廓，松开回弹；文字和点击位置保持不动。</p>
      <GameButton
        variant="primary"
        disabled={disabled}
        onClick={() => setCount((value) => value + 1)}
      >
        {copy.liquid}
      </GameButton>
      <GameButton aria-pressed={disabled} onClick={() => setDisabled((value) => !value)}>
        {copy.disabled}
      </GameButton>
      <output aria-live="polite">{count}</output>
    </GamePanel>
  );
}
