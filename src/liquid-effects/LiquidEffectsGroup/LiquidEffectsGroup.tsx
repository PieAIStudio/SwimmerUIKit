import { forwardRef, useMemo } from 'react';
import { LiquidGroupRoot } from '../../liquid/LiquidGroup/LiquidGroup';
import { createImageMeltRegistry } from '../melt/registry';
import { ImageMeltLayer } from '../melt/ImageMeltLayer';
import { EffectsContext } from './context';
import { LiquidEffectsItem } from './LiquidEffectsItem';
import type { LiquidEffectsGroupProps } from './types';

const EffectsGroup = forwardRef<HTMLDivElement, LiquidEffectsGroupProps>(
  function LiquidEffectsGroup(props, ref) {
    const registry = useMemo(() => createImageMeltRegistry(), []);
    return (
      <EffectsContext.Provider value={registry}>
        <LiquidGroupRoot
          {...props}
          ref={ref}
          auxiliary={(getGroup) => <ImageMeltLayer registry={registry} getGroup={getGroup} />}
        />
      </EffectsContext.Provider>
    );
  },
);
export const LiquidEffectsGroup = Object.assign(EffectsGroup, { Item: LiquidEffectsItem });
