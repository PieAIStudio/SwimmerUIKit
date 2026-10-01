/**
 * Image-melt and contact-dissolve layers adapted from liquid-gooey by Jakub
 * Antalik.
 *
 * Source: https://github.com/Jakubantalik/Libraries/blob/3862ffa345217443b63696a8c331a0664eea4b04/packages/liquid-gooey/src/imageMelt.tsx
 * Pinned commit: 3862ffa345217443b63696a8c331a0664eea4b04
 * Copyright (c) 2026 Jakub Antalik. Licensed under the MIT License.
 * See NOTICE for the attribution and license text.
 *
 * SwimmerUIKit keeps this as a scoped image layer. The donor's general
 * observer is intentionally not included: this module owns only the pairwise
 * image-melt engine, contact-image dissolve, and their idle-sleeping clock.
 */

import { useLayoutEffect, useRef, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { type ImageMeltOptions, resolveImageMeltOptions } from './options';
import { type ImageMeltRegistry, findImage, sourceOf } from './registry';

export interface ImageMeltItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  src?: string;
  options?: ImageMeltOptions;
  registry: ImageMeltRegistry;
  children: ReactNode;
  forwardedRef?: Ref<HTMLDivElement>;
}

export function ImageMeltItem({
  src,
  options = {},
  registry,
  children,
  forwardedRef,
  className,
  style,
  ...rest
}: ImageMeltItemProps): ReactNode {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const optionsKey = JSON.stringify(options);
  const warnedRef = useRef(false);
  const setHostRef = (node: HTMLDivElement | null): void => {
    hostRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useLayoutEffect(() => {
    const host = hostRef.current;
    const target = host?.firstElementChild as HTMLElement | null;
    const image = findImage(target);
    const imageSrc = src ?? sourceOf(image);
    if (!host || !target || !image || !imageSrc) {
      if (!warnedRef.current) {
        warnedRef.current = true;
        console.warn(
          '[swimmer-ui] effect="melt" needs an image: pass melt={{ src }} or put an <img> inside the item.',
        );
      }
      return;
    }
    return registry.registerMelt({
      el: host,
      target: image,
      src: imageSrc,
      opts: resolveImageMeltOptions(host, options),
    });
    // JSON keeps an inline options object from tearing down the registration
    // when its values have not changed; source changes still rebuild it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey, registry, src]);

  return (
    <div
      {...rest}
      ref={setHostRef}
      className={className ? `game-ui-liquid-item ${className}` : 'game-ui-liquid-item'}
      style={style}
    >
      {children}
    </div>
  );
}
