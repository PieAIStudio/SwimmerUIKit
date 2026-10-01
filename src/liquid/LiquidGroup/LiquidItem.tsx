import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react';

import { createPortal } from 'react-dom';

import { type LiquidGooeyItemConfig } from '../engine';

import { ImageMeltItem, type ImageMeltItemProps } from '../../liquid-effects/melt/ImageMeltItem';

import {
  registerDissolveItem,
  type DissolveRegistration,
} from '../../liquid-effects/melt/registry';
import { type LiquidItemProps } from './types';
import { useLiquidGroupContext } from './context';
import { sanitizeId, finite, joinClasses } from './resolve';
import { imageMeltHostProps } from './imageMeltHostProps';

const LiquidItemContent = forwardRef<HTMLDivElement, LiquidItemProps>(function LiquidItemContent(
  {
    effect,
    melt: ignoredMelt,
    dissolve,
    x = 0,
    y = 0,
    scale = 1,
    scaleY,
    transition,
    delay,
    radius,
    blob,
    morph,
    bend,
    observe,
    className,
    style,
    children,
    ...rest
  },
  forwardedRef,
) {
  const { portal, engine, follow, imageMelt } = useLiquidGroupContext();
  const itemId = `liquid-item-${sanitizeId(useId())}`;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const blobRef = useRef<SVGPathElement | null>(null);
  const initialConfig = useRef<LiquidGooeyItemConfig | null>(null);
  const dissolveRegistration = useRef<DissolveRegistration | null>(null);
  const dissolveKey = JSON.stringify(dissolve ?? null);
  const hasDissolve = dissolve !== undefined && dissolve !== false;
  void ignoredMelt;
  const config = useMemo<LiquidGooeyItemConfig>(() => {
    // The image layer owns `melt`; the shared SVG engine only understands the
    // Morph/Bend surface names. Move is the group-level `motion="follow"` mode,
    // not an item effect — a leftover `"move"` string is ignored.
    const engineEffect = effect === 'morph' || effect === 'bend' ? effect : undefined;
    const bendObserved = engineEffect === 'bend';
    const effectiveMorph =
      effect === 'bend' ||
      (follow && morph === undefined && effect !== 'morph') ||
      (hasDissolve && morph === undefined && effect !== 'morph')
        ? undefined
        : (morph ?? {});
    const next: LiquidGooeyItemConfig = {
      ...(engineEffect === undefined ? {} : { effect: engineEffect }),
      ...(effectiveMorph === undefined ? {} : { morph: effectiveMorph }),
      ...(bend === undefined ? {} : { bend }),
      ...(observe === undefined && !bendObserved ? {} : { observe: bendObserved || observe }),
      x: finite(x, 0),
      y: finite(y, 0),
      scale: finite(scale, 1),
      ...(scaleY === undefined ? {} : { scaleY: finite(scaleY, 1) }),
    };
    if (transition !== undefined) next.transition = transition;
    if (delay !== undefined) next.delay = delay;
    if (radius !== undefined) next.radius = radius;
    if (blob !== undefined) next.blob = blob;
    return next;
  }, [
    bend,
    blob,
    delay,
    effect,
    follow,
    hasDissolve,
    morph,
    observe,
    radius,
    scale,
    scaleY,
    transition,
    x,
    y,
  ]);
  if (initialConfig.current === null) initialConfig.current = config;

  const setHostRef = useCallback(
    (node: HTMLDivElement | null): void => {
      hostRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  useLayoutEffect(() => {
    const host = hostRef.current;
    const blobNode = blobRef.current;
    if (!portal || !host || !blobNode || !initialConfig.current) return;
    return engine.register({ id: itemId, host, blob: blobNode, config: initialConfig.current });
  }, [engine, itemId, portal]);

  useLayoutEffect(() => {
    engine.update(itemId, config);
  }, [config, engine, itemId]);

  useLayoutEffect(() => {
    return () => {
      dissolveRegistration.current?.unregister();
      dissolveRegistration.current = null;
    };
  }, [imageMelt]);

  useLayoutEffect(() => {
    const effectName: string | undefined = effect;
    if (effectName === 'move' || dissolve === undefined || dissolve === false) {
      dissolveRegistration.current?.unregister();
      dissolveRegistration.current = null;
      return;
    }
    const host = hostRef.current;
    if (!host) return;
    if (dissolveRegistration.current) {
      dissolveRegistration.current.update(dissolve);
      return;
    }
    dissolveRegistration.current = registerDissolveItem(imageMelt, host, dissolve);
    // The JSON key is the value dependency; registration identity is stable
    // while the item remains in the same group.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dissolveKey, effect, imageMelt]);

  useEffect(() => {
    // Not gated on a build-mode flag. See the item-border warning below.
    const effectName: string | undefined = effect;
    if (effectName === 'move') {
      console.warn(
        '[swimmer-ui] effect="move" is not an item effect. Use <LiquidGroup motion="follow"> for selection and progress.',
      );
    }
    if (effectName !== 'move' || !hasDissolve) return;
    console.warn(
      '[swimmer-ui] dissolve is ignored for effect="move" because Move intentionally lags the measured image rect.',
    );
  }, [effect, hasDissolve]);

  useLayoutEffect(() => {
    // Not gated on a build-mode flag. A library cannot detect the consuming
    // app's build mode: `import.meta.env.DEV` resolves against *this* package's
    // build and is always false downstream, which is how this warning shipped
    // dead in 1.11.3. It fires only when the component was wired wrong, once.
    const host = hostRef.current;
    if (!host) return;
    const child = host.firstElementChild;
    if (!child) return;
    const style = window.getComputedStyle(child);
    const hasBorder =
      style.borderStyle !== 'none' && style.borderWidth !== '0px' && style.borderWidth !== '';
    const hasOutline =
      style.outlineStyle !== 'none' && style.outlineWidth !== '0px' && style.outlineWidth !== '';
    const hasBoxShadow = style.boxShadow && style.boxShadow !== 'none';
    if (hasBorder || hasOutline || hasBoxShadow) {
      console.warn(
        'LiquidGroup.Item children should not have their own border, outline, or box-shadow. ' +
          'They exist on the content layer and will not merge with the liquid silhouette. ' +
          'Use the `stroke` and `shadow` props on <LiquidGroup> instead.',
      );
    }
  }, []);

  return (
    <>
      <div
        {...rest}
        ref={setHostRef}
        className={joinClasses('game-ui-liquid-item', className)}
        style={style}
      >
        {children}
      </div>
      {portal ? createPortal(<path ref={blobRef} d="" data-liquid-gooey-blob="" />, portal) : null}
    </>
  );
});

export const LiquidItem = forwardRef<HTMLDivElement, LiquidItemProps>(
  function LiquidItem(props, forwardedRef) {
    const { imageMelt } = useLiquidGroupContext();
    if (props.effect !== 'melt') {
      return <LiquidItemContent {...props} ref={forwardedRef} />;
    }

    const hostProps = imageMeltHostProps(props);
    const children = props.children;
    const melt = { ...(props.melt ?? {}) };
    const src = melt.src;
    delete melt.src;
    const meltProps: ImageMeltItemProps = {
      ...hostProps,
      registry: imageMelt,
      children,
      options: melt,
      ...(src === undefined ? {} : { src }),
      ...(forwardedRef === undefined ? {} : { forwardedRef }),
    };
    return <ImageMeltItem {...meltProps} />;
  },
);
