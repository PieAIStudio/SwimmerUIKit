import { useState, type ReactNode } from 'react';

import { GameButton } from '../../controls/GameButton/GameButton';

import { GamePanel } from '../../containers/GamePanel/GamePanel';

import { LIQUID_FORM_NAMES, LIQUID_FORMS, type LiquidForm } from '../../liquid/forms';

import { LIQUID_BLOB_MAX_FRACTION } from '../../liquid/geometry';
import { type Copy } from './copyTypes';
import { useFormEngagement } from './useFormEngagement';
import { BodyStage } from './BodyStage';

/*
 * The clamp, shown rather than described.
 *
 * A form fixes one amplitude and then has to survive both of these. The number
 * under each body is what the pour actually came to after the clamp, which is
 * the whole argument for why a single `blob` value is safe to put in a bundle.
 */
export function Sizes({ copy }: { copy: Copy }): ReactNode {
  const [engaged, toggle] = useFormEngagement();
  const bodies = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].kind === 'body');
  const [selected, setSelected] = useState<LiquidForm>('press');
  const poured = (blob: number, shorter: number): string =>
    Math.min(blob, shorter * LIQUID_BLOB_MAX_FRACTION).toFixed(2);
  return (
    <>
      <div className="game-ui-liquid-demo-controls" role="group" aria-label="尺寸对照的形态">
        {bodies.map((form) => (
          <GameButton key={form} aria-pressed={selected === form} onClick={() => setSelected(form)}>
            {form}
          </GameButton>
        ))}
      </div>
      <div className="game-ui-liquid-page__sizes">
        {bodies
          .filter((form) => form === selected)
          .map((form) => {
            const on = engaged.has(form);
            const { blob } = LIQUID_FORMS[form].group;
            return (
              <GamePanel className="game-ui-liquid-page__size-row" key={form} tone="strong">
                <header>
                  <h4>{form}</h4>
                  <GameButton onClick={() => toggle(form)} variant="ghost">
                    {form === 'ripple' ? copy.pulse : on ? copy.reset : copy.trigger}
                  </GameButton>
                </header>
                <div className="game-ui-liquid-page__size-pair">
                  <div>
                    <div className="game-ui-liquid-page__stage-slot">
                      <BodyStage engaged={on} form={form} />
                    </div>
                    <small>
                      {copy.control} · {copy.clamped} {poured(blob, 56)}px
                    </small>
                  </div>
                  <div>
                    <div className="game-ui-liquid-page__stage-slot game-ui-liquid-page__stage-slot--thin">
                      <BodyStage engaged={on} form={form} style={{ width: 200, height: 14 }} />
                    </div>
                    <small>
                      {copy.meter} · {copy.clamped} {poured(blob, 14)}px
                    </small>
                  </div>
                </div>
              </GamePanel>
            );
          })}
      </div>
    </>
  );
}
