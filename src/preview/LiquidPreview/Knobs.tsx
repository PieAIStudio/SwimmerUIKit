import { useContext, type ReactNode } from 'react';

import { liquidFinishGloss } from '../../liquid/finish';

import { LIQUID_FORMS, type LiquidForm } from '../../liquid/forms';

import { LIQUID_GOOEY_MIN_EDGE_RAMP, liquidGooeyEdgeContrast } from '../../liquid/filter';

import { parseShadow } from '../../liquid/shadow';
import { type Copy } from './copyTypes';
import { FinishContext } from './context';

/*
 * The knobs, next to the thing they made.
 *
 * `contrast` gets a derived number beside it rather than only its own value,
 * because on its own it is the most misleading knob in the set: the alpha
 * crossing is pinned, so contrast is edge width in pixels and nothing else,
 * and reading "24" without reading "0.43px, raised to the 1.3px floor" is how
 * two rounds of edge tuning went into the wrong variable.
 */
/*
 * A shadow, as a person reads one.
 *
 * The literal value is `color-mix(in srgb, var(--token) 22%, transparent)` per
 * layer, which on a shelf of twelve tiles is a wall of CSS where a comparison
 * is supposed to be. What a reader is here to compare is how far the body sits
 * off the ground and how hard that contact is, so that is what this prints:
 * offset over blur, then strength.
 */
function readShadow(value: string | undefined): string | null {
  if (value === undefined) return null;
  return parseShadow(value)
    .map((layer) => {
      const strength = /(\d+(?:\.\d+)?)%/.exec(layer.color)?.[1];
      return `${layer.y}/${layer.blur}${strength === undefined ? '' : ` · ${strength}%`}`;
    })
    .join('  +  ');
}

export function Knobs({ form, copy }: { form: LiquidForm; copy: Copy }): ReactNode {
  const finish = useContext(FinishContext);
  const { blur, contrast, blob, lobes, gloss, shadow, shadowEngaged } = LIQUID_FORMS[form].group;
  const effective = liquidGooeyEdgeContrast(blur, contrast);
  const edge = (2.5628 * blur) / effective;
  const rest = readShadow(shadow);
  const engagedShadow = readShadow(shadowEngaged);
  return (
    <dl className="game-ui-liquid-page__knobs">
      <dt>blur</dt>
      <dd>{blur}</dd>
      <dt>contrast</dt>
      <dd>
        {contrast}
        <span className="game-ui-liquid-page__derived">
          {' '}
          · {copy.edgeNote} {edge.toFixed(2)}px
          {effective < contrast ? ` → ${LIQUID_GOOEY_MIN_EDGE_RAMP}px` : ''}
        </span>
      </dd>
      <dt>blob</dt>
      <dd>
        {blob}
        {blob > 0 ? (
          <span className="game-ui-liquid-page__derived">
            {' '}
            · {lobes} {copy.lobesNote}
          </span>
        ) : null}
      </dd>
      <dt>gloss</dt>
      <dd>
        {liquidFinishGloss(finish, gloss)} · {finish}
      </dd>
      <dt>shadow</dt>
      <dd>
        {rest ?? copy.noShadow}
        {rest === null ? null : <span className="game-ui-liquid-page__derived"> · y/blur</span>}
      </dd>
      {engagedShadow === null ? null : (
        <>
          <dt>{copy.engagedKnob}</dt>
          <dd>{engagedShadow}</dd>
        </>
      )}
    </dl>
  );
}
