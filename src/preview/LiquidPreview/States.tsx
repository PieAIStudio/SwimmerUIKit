import { useContext, type ReactNode } from 'react';

import { GameButton } from '../../controls/GameButton/GameButton';

import { GamePanel } from '../../containers/GamePanel/GamePanel';

import { LiquidSurface } from '../../liquid/LiquidSurface/LiquidSurface';
import { FinishContext } from './context';
import { type Copy } from './copyTypes';

/*
 * The liquid button, rendered the way `GameButton surface="liquid"` renders it,
 * with its press state pinned.
 *
 * The comparison only means something if both sides are the same control. An
 * unlabelled 132px body next to a 90px button is two different objects, and the
 * eye answers a question nobody asked. So this is the same composition
 * GameButton builds internally — the same classes, the same fill tokens, a real
 * <button> on top — held in whichever state the column is about.
 */
function LiquidButton({ label, active }: { label: string; active: boolean }): ReactNode {
  const liquidFinish = useContext(FinishContext);
  return (
    <LiquidSurface
      liquidFinish={liquidFinish}
      active={active}
      className="game-ui-button-liquid game-ui-button-liquid--primary"
      form="press"
    >
      <GameButton variant="primary">{label}</GameButton>
    </LiquidSurface>
  );
}

/*
 * Rest / engaged / disabled, with the flat control in the same row.
 *
 * The comparison is the content. Every judgement about whether the liquid body
 * carries enough weight was made next to this flat twin, because 「does it look
 * grounded」 has no answer on its own and a definite one against a control the
 * kit already got right.
 *
 * All three columns are pinned rather than interactive, and that is the point
 * of this section as opposed to the shelf above it: a state you have to hold a
 * finger on is a state you cannot compare against the one next to it. Pinning
 * the flat button's pressed look needs a preview-only class, because `:active`
 * is the only way the DOM will ever show it and the DOM will not hold it.
 */
export function States({ copy }: { copy: Copy }): ReactNode {
  return (
    <div className="game-ui-liquid-page__states">
      <GamePanel className="game-ui-liquid-page__state" tone="strong">
        <h4>{copy.rest}</h4>
        <GameButton variant="primary">{copy.flat}</GameButton>
        <LiquidButton active={false} label={copy.liquid} />
      </GamePanel>
      <GamePanel className="game-ui-liquid-page__state" tone="strong">
        <h4>{copy.engaged}</h4>
        <span className="game-ui-liquid-page__pinned-press">
          <GameButton variant="primary">{copy.flat}</GameButton>
        </span>
        <LiquidButton active label={copy.liquid} />
      </GamePanel>
      <GamePanel className="game-ui-liquid-page__state" tone="strong">
        <h4>{copy.disabled}</h4>
        <GameButton disabled variant="primary">
          {copy.flat}
        </GameButton>
        <GameButton disabled surface="liquid" variant="primary">
          {copy.liquid}
        </GameButton>
        <small>{copy.disabledNote}</small>
      </GamePanel>
    </div>
  );
}
