import { type ReactNode } from 'react';

import { Button, type ButtonVariant } from '../../../controls/Button/Button';

import { Panel } from '../../../containers/Panel/Panel';
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
 * Button, and `surface` is a second axis on it」; the twelve-form
 * vocabulary's job is a page of its own, which it now has. Keeping the form
 * shelf in both places meant two shelves to update and, predictably, one of
 * them lagging — so what stays here is the component, and what left is the
 * vocabulary. The link is how a reader gets from one to the other, and it is
 * relative because a host app that renders this gallery may not serve that
 * page at all.
 */
export function LiquidSurfaceShowcase(): ReactNode {
  const { liquid } = useCopy();
  const tones: ButtonVariant[] = ['primary', 'secondary', 'success', 'danger'];
  return (
    <div className="game-ui-liquid-showcase">
      <Panel title={liquid.surfacesTitle} tone="strong">
        <div className="game-ui-liquid-showcase__grid">
          {tones.map((tone) => (
            <div className="game-ui-liquid-showcase__pair" key={tone}>
              <Button variant={tone}>{tone}</Button>
              <Button variant={tone}>{tone}</Button>
              <small>{liquid.press}</small>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title={liquid.disabledTitle} tone="strong">
        <p className="game-ui-small-copy">{liquid.disabledBody}</p>
        <div className="game-ui-liquid-showcase__grid">
          <div className="game-ui-liquid-showcase__pair">
            <Button disabled variant="primary">
              flat
            </Button>
            <Button disabled variant="primary">
              liquid
            </Button>
          </div>
        </div>
      </Panel>

      <Panel title={liquid.moreTitle} tone="strong">
        <p className="game-ui-small-copy">{liquid.moreBody}</p>
        <p>
          <a className="game-ui-liquid-showcase__link" href="liquid.html">
            {liquid.moreLink} →
          </a>
        </p>
      </Panel>
    </div>
  );
}
