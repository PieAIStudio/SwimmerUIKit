import { type HTMLAttributes } from 'react';
import { type LiquidItemProps } from './types';

export function imageMeltHostProps(
  input: LiquidItemProps,
): Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  const props = { ...input } as Record<string, unknown>;
  for (const key of [
    'children',
    'effect',
    'melt',
    'dissolve',
    'x',
    'y',
    'scale',
    'scaleY',
    'transition',
    'delay',
    'radius',
    'blob',
    'morph',
    'bend',
    'observe',
  ]) {
    delete props[key];
  }
  return props as Omit<HTMLAttributes<HTMLDivElement>, 'children'>;
}
