import { useState, type ReactNode } from 'react';

import { GameButton, type GameButtonVariant } from '../../controls/GameButton/GameButton';

import { GamePanel } from '../../containers/GamePanel/GamePanel';

import { LIQUID_FORM_NAMES, LIQUID_FORMS, type LiquidForm } from '../../liquid/forms';
import { type Copy } from './copyTypes';
import { useFormEngagement } from './useFormEngagement';
import { FormStage } from './FormStage';
import { TONE_FILL } from './BodyStage';
import { Knobs } from './Knobs';

export function Shelf({
  kind,
  copy,
  tone,
}: {
  kind: 'body' | 'group';
  copy: Copy;
  tone: GameButtonVariant;
}): ReactNode {
  const [engaged, toggle] = useFormEngagement();
  const forms = LIQUID_FORM_NAMES.filter((form) => LIQUID_FORMS[form].kind === kind);
  const [selected, setSelected] = useState<LiquidForm>(() => forms[0]!);
  return (
    <>
      <div
        className="game-ui-liquid-demo-controls"
        role="group"
        aria-label={kind === 'body' ? '单体形态' : '多体形态'}
      >
        {forms.map((form) => (
          <GameButton key={form} aria-pressed={selected === form} onClick={() => setSelected(form)}>
            {form}
          </GameButton>
        ))}
      </div>
      <div className="game-ui-liquid-page__shelf">
        {forms
          .filter((form) => form === selected)
          .map((form) => {
            const on = engaged.has(form);
            return (
              <GamePanel className="game-ui-liquid-page__tile" key={form} tone="strong">
                <div className="game-ui-liquid-page__stage-slot">
                  <FormStage engaged={on} fill={TONE_FILL[tone]} form={form} />
                </div>
                <h4>{form}</h4>
                <p className="game-ui-liquid-page__prose">{LIQUID_FORMS[form].summary}</p>
                <GameButton onClick={() => toggle(form)} variant="ghost">
                  {form === 'ripple' ? copy.pulse : on ? copy.reset : copy.trigger}
                </GameButton>
                <Knobs copy={copy} form={form} />
              </GamePanel>
            );
          })}
      </div>
    </>
  );
}
