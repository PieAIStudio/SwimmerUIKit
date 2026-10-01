import { createContext, useContext } from 'react';

import { LiquidGooeyEngine } from '../engine';

import { type ImageMeltRegistry } from '../../liquid-effects/melt/registry';

interface LiquidGroupContextValue {
  portal: SVGGElement | null;
  engine: LiquidGooeyEngine;
  follow: boolean;
  imageMelt: ImageMeltRegistry;
}

export const LiquidGroupContext = createContext<LiquidGroupContextValue | null>(null);

export function useLiquidGroupContext(): LiquidGroupContextValue {
  const context = useContext(LiquidGroupContext);
  if (!context) throw new Error('<LiquidGroup.Item> must be rendered inside <LiquidGroup>.');
  return context;
}
