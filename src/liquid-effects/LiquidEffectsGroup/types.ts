import type { LiquidGroupProps, LiquidItemProps } from '../../liquid/LiquidGroup/types';
import type { BendTuning } from '../bend/physics';
import type { DissolveOptions, ImageMeltOptions } from '../melt/options';

export type LiquidEffectsGroupProps = LiquidGroupProps;
export interface LiquidEffectsItemProps extends Omit<LiquidItemProps, 'effect'> {
  effect?: 'morph' | 'melt' | 'bend';
  bend?: BendTuning;
  melt?: ImageMeltOptions & { src?: string };
  dissolve?: boolean | number | DissolveOptions;
}
