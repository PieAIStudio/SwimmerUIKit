import { useContext, type CSSProperties, type ReactNode } from 'react';

import { type GameButtonVariant } from '../../controls/GameButton/GameButton';

import { LiquidSurface } from '../../liquid/LiquidSurface/LiquidSurface';

import { type LiquidForm } from '../../liquid/forms';
import { STAGE } from './constants';
import { FinishContext } from './context';

/*
 * Tone is a control on the shelf, not a section of its own.
 *
 * The obvious way to show twelve forms on four tones is forty-eight tiles, and
 * it is the wrong way: most forms are the same pill at rest, so the matrix
 * would be forty-eight near-identical pictures of the thing that does not vary,
 * and it would put forty-eight filtered groups on one page against an
 * animation budget that degrades the surplus to static — a showcase that
 * quietly stops showing. One picker recolours all twelve at once, so every
 * form really is available on every tone, live, and the page stays a page.
 *
 * The tokens are the ones `.game-ui-button-liquid--*` already maps to, so what
 * a reader picks here is what a product gets from `variant`.
 */
export const TONE_FILL: Readonly<Record<GameButtonVariant, string>> = {
  primary: 'var(--game-ui-accent)',
  secondary: 'var(--game-ui-accent-pale)',
  success: 'var(--game-ui-success)',
  danger: 'var(--game-ui-danger)',
  ghost: 'var(--game-ui-accent-pale)',
};

/** A body form, drawn the way a product would draw it. */
export function BodyStage({
  form,
  engaged,
  fill = 'var(--game-ui-accent)',
  style = STAGE,
  radius = 999,
}: {
  form: LiquidForm;
  engaged: boolean;
  fill?: string;
  style?: CSSProperties;
  radius?: number;
}): ReactNode {
  const liquidFinish = useContext(FinishContext);
  return (
    <LiquidSurface
      liquidFinish={liquidFinish}
      active={engaged}
      fill={fill}
      form={form}
      radius={radius}
    >
      <span className="game-ui-liquid-page__body" style={style} />
    </LiquidSurface>
  );
}
