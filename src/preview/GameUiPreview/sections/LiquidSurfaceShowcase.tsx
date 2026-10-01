import { type ReactNode } from 'react';

import { GameButton, type GameButtonVariant } from '../../../controls/GameButton/GameButton';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';
import { useCopy } from '../context';

/*
 * The brand's own liquid, in the component gallery.
 *
 * It was missing entirely once, and the omission had a cost: this page had a
 * section for the WebGL metal CTA — which no product uses — and none for the
 * surface that ships on real boards, so the only way to see a liquid button was
 * to know which screen of which product happened to render one.
 *
 * It is deliberately smaller than it was. This gallery's job is 「here is
 * GameButton, and `surface` is a second axis on it」; the twelve-form
 * vocabulary's job is a page of its own, which it now has. Keeping the form
 * shelf in both places meant two shelves to update and, predictably, one of
 * them lagging — so what stays here is the component, and what left is the
 * vocabulary. The link is how a reader gets from one to the other, and it is
 * relative because a host app that renders this gallery may not serve that
 * page at all.
 */
export function LiquidSurfaceShowcase(): ReactNode {
  const { liquid } = useCopy();
  const tones: GameButtonVariant[] = ['primary', 'secondary', 'success', 'danger'];
  return (
    <div className="game-ui-liquid-showcase">
      <GamePanel title={liquid.surfacesTitle} tone="strong">
        <div className="game-ui-liquid-showcase__grid">
          {tones.map((tone) => (
            <div className="game-ui-liquid-showcase__pair" key={tone}>
              <GameButton variant={tone}>{tone}</GameButton>
              <GameButton surface="liquid" variant={tone}>
                {tone}
              </GameButton>
              <small>{liquid.press}</small>
            </div>
          ))}
        </div>
      </GamePanel>

      <GamePanel title={liquid.disabledTitle} tone="strong">
        <p className="game-ui-small-copy">{liquid.disabledBody}</p>
        <div className="game-ui-liquid-showcase__grid">
          <div className="game-ui-liquid-showcase__pair">
            <GameButton disabled variant="primary">
              flat
            </GameButton>
            <GameButton disabled surface="liquid" variant="primary">
              liquid
            </GameButton>
          </div>
        </div>
      </GamePanel>

      <GamePanel title={liquid.moreTitle} tone="strong">
        <p className="game-ui-small-copy">{liquid.moreBody}</p>
        <p>
          <a className="game-ui-liquid-showcase__link" href="liquid.html">
            {liquid.moreLink} →
          </a>
        </p>
      </GamePanel>
    </div>
  );
}
