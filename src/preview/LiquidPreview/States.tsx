import { useState } from 'react';
import { Button } from '../../controls/Button/Button';
import { Panel } from '../../containers/Panel/Panel';
import type { Copy } from './copyTypes';

/** One live CTA, not a second recreation of the native/button paint assembly. */
export function States({ copy }: { copy: Copy }) {
  const [disabled, setDisabled] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <Panel className="game-ui-liquid-page__states" title={copy.rest}>
      <p>按住观察轮廓，松开回弹；文字和点击位置保持不动。</p>
      <Button variant="primary" disabled={disabled} onClick={() => setCount((value) => value + 1)}>
        {copy.liquid}
      </Button>
      <Button aria-pressed={disabled} onClick={() => setDisabled((value) => !value)}>
        {copy.disabled}
      </Button>
      <output aria-live="polite">{count}</output>
    </Panel>
  );
}
