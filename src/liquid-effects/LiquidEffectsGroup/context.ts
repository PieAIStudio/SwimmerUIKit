import { createContext, useContext } from 'react';
import type { ImageMeltRegistry } from '../melt/registry';

export const EffectsContext = createContext<ImageMeltRegistry | null>(null);
export function useEffectsRegistry(): ImageMeltRegistry {
  const registry = useContext(EffectsContext);
  if (!registry) throw new Error('LiquidEffectsGroup.Item requires a LiquidEffectsGroup parent.');
  return registry;
}
