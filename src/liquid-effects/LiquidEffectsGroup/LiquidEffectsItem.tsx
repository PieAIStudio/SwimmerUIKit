import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { LiquidItemContent } from '../../liquid/LiquidGroup/LiquidItem';
import { createBendDeformation } from '../bend/deformation';
import { ImageMeltItem } from '../melt/ImageMeltItem';
import { registerDissolveItem, type DissolveRegistration } from '../melt/registry';
import { imageMeltHostProps } from '../melt/hostProps';
import { useEffectsRegistry } from './context';
import type { LiquidEffectsItemProps } from './types';

const DeformedItem = forwardRef<HTMLDivElement, LiquidEffectsItemProps>(function DeformedItem(
  { effect, bend, dissolve, melt: unused, ...props },
  forwardedRef,
) {
  void unused;
  const registry = useEffectsRegistry();
  const host = useRef<HTMLDivElement | null>(null);
  const registration = useRef<DissolveRegistration | null>(null);
  const setHost = useCallback(
    (node: HTMLDivElement | null) => {
      host.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );
  const horizontal = bend?.horizontal;
  const vertical = bend?.vertical;
  const deformation = useMemo(
    () =>
      effect === 'bend'
        ? createBendDeformation({
            ...(horizontal === undefined ? {} : { horizontal }),
            ...(vertical === undefined ? {} : { vertical }),
          })
        : undefined,
    [effect, horizontal, vertical],
  );
  const key = JSON.stringify(dissolve ?? null);
  const hasDissolve = dissolve !== undefined && dissolve !== false;
  useLayoutEffect(
    () => () => {
      registration.current?.unregister();
      registration.current = null;
    },
    [registry],
  );
  useLayoutEffect(() => {
    const name: string | undefined = effect;
    if (name === 'move' || !hasDissolve) {
      registration.current?.unregister();
      registration.current = null;
      return;
    }
    if (!host.current) return;
    if (registration.current) registration.current.update(dissolve!);
    else registration.current = registerDissolveItem(registry, host.current, dissolve!);
    // Options are compared by value so an inline object does not re-register.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, effect, registry]);
  useEffect(() => {
    const name: string | undefined = effect;
    if (name === 'move')
      console.warn(
        '[swimmer-ui] effect="move" is not an item effect. Use <LiquidGroup motion="follow"> for selection and progress.',
      );
    if (name === 'move' && hasDissolve)
      console.warn(
        '[swimmer-ui] dissolve is ignored for effect="move" because Move intentionally lags the measured image rect.',
      );
  }, [effect, hasDissolve]);
  return (
    <LiquidItemContent
      {...props}
      ref={setHost}
      {...(effect === 'morph' ? { effect } : {})}
      {...(deformation ? { deformation, observe: true } : {})}
      suppressMorph={hasDissolve}
    />
  );
});

export const LiquidEffectsItem = forwardRef<HTMLDivElement, LiquidEffectsItemProps>(
  function LiquidEffectsItem(props, ref) {
    const registry = useEffectsRegistry();
    if (props.effect !== 'melt') return <DeformedItem {...props} ref={ref} />;
    const { src, ...options } = props.melt ?? {};
    return (
      <ImageMeltItem
        {...imageMeltHostProps(props)}
        registry={registry}
        options={options}
        {...(src === undefined ? {} : { src })}
        forwardedRef={ref}
      >
        {props.children}
      </ImageMeltItem>
    );
  },
);
