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

import {
  useLayoutEffect,
  useRef,
  useState,
  useId,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import { CLAY_LIQUID_GOOEY_TOKENS } from './clay/tokens';
import {
  getLiquidGooeyBudget,
  releaseLiquidGooeyAnimation,
  tryAcquireLiquidGooeyAnimation,
} from './liquidGooeyBudget';

const IMAGE_MELT_FILTER_PADDING = 24;
const IMAGE_MELT_SLEEP_MS = 500;
const DISSOLVE_ATTACK_RATE = 16;
const DISSOLVE_RETREAT_RATE = 6;
const MELT_PROXIMITY_RATE = 14;

export interface ImageMeltOptions {
  /** Goo sigma: how far the bodies reach for each other and how wide colour averaging runs. */
  blur?: number;
  /** Alpha-contrast slope of the liquid boundary. */
  contrast?: number;
  /** How far each crisp face dissolves back before its neighbour. */
  reach?: number;
  /** Softness of the crisp-face dissolve mask. */
  fade?: number;
  /** Turbulence displacement of the molten layer, in px. */
  warp?: number;
  /** 0..1 two-liquid marbling strength in the touch area. */
  mix?: number;
  /** Blur of the marble pass's source colours. */
  mixBlur?: number;
  /** How deep the marble zone reaches into each card. */
  gravity?: number;
  /** Wavelength control of the warp noise. */
  waviness?: number;
}

export const IMAGE_MELT_DEFAULTS: Required<ImageMeltOptions> = {
  blur: 7,
  contrast: 40,
  reach: 0.8,
  fade: 17,
  warp: 0,
  mix: 1,
  mixBlur: 8,
  gravity: 1.9,
  waviness: 12,
};

export interface DissolveOptions {
  /** Melt blur in px. */
  blur?: number;
  /** Displacement strength of the liquid warp. */
  warp?: number;
  /** Magnetic drift toward the contact, in px. */
  pull?: number;
  /** Distance at which melting starts. */
  range?: number;
  /** Size of the melt zone around the contact, in px. */
  zone?: number;
  /** 0..1 two-liquid erosion strength. */
  mix?: number;
  /** Px the melt is drawn toward the neighbour's centre. */
  gravity?: number;
  /** 0..1 pointiness of the directional flow. */
  taper?: number;
  /** Noise frequency multiplier. */
  warpFreq?: number;
  /** Px/s the noise field may drift while the item is moving. */
  flowSpeed?: number;
  /** Noise style. */
  warpStyle?: 'fractalNoise' | 'turbulence';
  /** Noise octaves. */
  detail?: number;
  /** Whether the dissolve is currently allowed to grow. */
  active?: boolean;
  /** Structural release time in ms. */
  releaseMs?: number;
  /** Opacity fade time in ms. */
  fadeMs?: number;
  /** 0..1 overall dissolve ceiling. */
  strength?: number;
  /** Fraction of the smaller body at which the seam has been swallowed. */
  sink?: number;
  /** Plain blur radius for the guaranteed-smooth seam wash. */
  seamBlur?: number;
}

export type DissolveValue = boolean | number | DissolveOptions;

export interface ResolvedDissolveOptions {
  blur: number;
  warp: number;
  pull: number;
  range: number;
  zone: number;
  mix: number;
  gravity: number;
  taper: number;
  warpFreq: number;
  flowSpeed: number;
  warpStyle: 'fractalNoise' | 'turbulence';
  detail: number;
  active: boolean;
  releaseMs: number;
  fadeMs: number;
  strength: number;
  sink: number;
  seamBlur: number;
}

export const DISSOLVE_DEFAULTS: ResolvedDissolveOptions = {
  blur: 8,
  warp: 26,
  pull: 4,
  range: 49,
  zone: 18,
  mix: 0.7,
  gravity: 60,
  taper: 1,
  warpFreq: 1.7,
  flowSpeed: 22,
  warpStyle: 'fractalNoise',
  detail: 2,
  active: true,
  releaseMs: 110,
  fadeMs: 110,
  strength: 1,
  sink: 0.8,
  seamBlur: 12.8,
};

type ImageMeltTokenKey =
  | 'meltBlur'
  | 'meltContrast'
  | 'meltReach'
  | 'meltFade'
  | 'meltWarp'
  | 'meltMix'
  | 'meltMixBlur'
  | 'meltGravity'
  | 'meltWaviness';

type DissolveTokenKey =
  | 'dissolveBlur'
  | 'dissolveWarp'
  | 'dissolvePull'
  | 'dissolveRange'
  | 'dissolveZone'
  | 'dissolveMix'
  | 'dissolveGravity'
  | 'dissolveTaper'
  | 'dissolveWarpFreq'
  | 'dissolveFlowSpeed'
  | 'dissolveDetail'
  | 'dissolveReleaseMs'
  | 'dissolveFadeMs'
  | 'dissolveStrength'
  | 'dissolveSink'
  | 'dissolveSeamBlur';

function isDev(): boolean {
  return import.meta.env?.DEV !== false;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function finite(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function readToken(
  element: HTMLElement | null,
  key: ImageMeltTokenKey | DissolveTokenKey,
  fallback: number,
): number {
  const view = element?.ownerDocument.defaultView;
  if (!view) return fallback;
  const reference = CLAY_LIQUID_GOOEY_TOKENS[key];
  const name = /^var\((--[\w-]+)\)$/.exec(reference)?.[1];
  if (!name) return fallback;
  const parsed = Number.parseFloat(view.getComputedStyle(element).getPropertyValue(name));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveImageMeltOptions(
  element: HTMLElement | null,
  input: ImageMeltOptions = {},
): Required<ImageMeltOptions> {
  const value = <K extends keyof ImageMeltOptions>(key: K, token: ImageMeltTokenKey): number =>
    finite(input[key], readToken(element, token, IMAGE_MELT_DEFAULTS[key]));
  return {
    blur: Math.max(0, value('blur', 'meltBlur')),
    contrast: Math.max(1, value('contrast', 'meltContrast')),
    reach: Math.max(0, value('reach', 'meltReach')),
    fade: Math.max(0, value('fade', 'meltFade')),
    warp: Math.max(0, value('warp', 'meltWarp')),
    mix: clamp(value('mix', 'meltMix')),
    mixBlur: Math.max(0, value('mixBlur', 'meltMixBlur')),
    gravity: Math.max(0, value('gravity', 'meltGravity')),
    waviness: Math.max(0, value('waviness', 'meltWaviness')),
  };
}

export function resolveDissolveOptions(
  element: HTMLElement | null,
  input: DissolveValue,
): ResolvedDissolveOptions {
  const object = typeof input === 'object' && input !== null ? input : {};
  const number = <K extends keyof DissolveOptions>(
    key: K,
    token: DissolveTokenKey,
    fallback: number,
  ): number => {
    const value = object[key];
    return finite(
      typeof value === 'number' ? value : undefined,
      readToken(element, token, fallback),
    );
  };
  const strength =
    typeof input === 'number'
      ? clamp(input)
      : clamp(number('strength', 'dissolveStrength', DISSOLVE_DEFAULTS.strength));
  return {
    blur: Math.max(0, number('blur', 'dissolveBlur', DISSOLVE_DEFAULTS.blur)),
    warp: Math.max(0, number('warp', 'dissolveWarp', DISSOLVE_DEFAULTS.warp)),
    pull: Math.max(0, number('pull', 'dissolvePull', DISSOLVE_DEFAULTS.pull)),
    range: Math.max(1, number('range', 'dissolveRange', DISSOLVE_DEFAULTS.range)),
    zone: Math.max(1, number('zone', 'dissolveZone', DISSOLVE_DEFAULTS.zone)),
    mix: clamp(number('mix', 'dissolveMix', DISSOLVE_DEFAULTS.mix)),
    gravity: Math.max(0, number('gravity', 'dissolveGravity', DISSOLVE_DEFAULTS.gravity)),
    taper: clamp(number('taper', 'dissolveTaper', DISSOLVE_DEFAULTS.taper)),
    warpFreq: Math.max(0.2, number('warpFreq', 'dissolveWarpFreq', DISSOLVE_DEFAULTS.warpFreq)),
    flowSpeed: Math.max(0, number('flowSpeed', 'dissolveFlowSpeed', DISSOLVE_DEFAULTS.flowSpeed)),
    warpStyle: object.warpStyle ?? DISSOLVE_DEFAULTS.warpStyle,
    detail: Math.max(1, Math.round(number('detail', 'dissolveDetail', DISSOLVE_DEFAULTS.detail))),
    active: object.active ?? DISSOLVE_DEFAULTS.active,
    releaseMs: Math.max(40, number('releaseMs', 'dissolveReleaseMs', DISSOLVE_DEFAULTS.releaseMs)),
    fadeMs: Math.max(40, number('fadeMs', 'dissolveFadeMs', DISSOLVE_DEFAULTS.fadeMs)),
    strength,
    sink: Math.max(0.01, number('sink', 'dissolveSink', DISSOLVE_DEFAULTS.sink)),
    seamBlur: Math.max(0, number('seamBlur', 'dissolveSeamBlur', DISSOLVE_DEFAULTS.seamBlur)),
  };
}

interface MaskSnapshot {
  maskImage: string;
  maskPriority: string;
  webkitMaskImage: string;
  webkitMaskPriority: string;
}

export interface ImageMeltEntry {
  id: string;
  el: HTMLElement;
  target: HTMLImageElement;
  src: string;
  opts: Required<ImageMeltOptions>;
  painted: boolean;
  previousOpacity: string;
}

export interface DissolveEntry {
  id: string;
  el: HTMLElement;
  image: HTMLImageElement | null;
  opts: ResolvedDissolveOptions;
  previousMask: MaskSnapshot | null;
}

export interface DissolveRegistration {
  update(value: DissolveValue): void;
  unregister(): void;
}

export interface ImageMeltRegistry {
  registerMelt(entry: Omit<ImageMeltEntry, 'id' | 'painted' | 'previousOpacity'>): () => void;
  registerDissolve(entry: Omit<DissolveEntry, 'id' | 'previousMask'>): DissolveRegistration;
  subscribe(fn: () => void): () => void;
  entries(): ImageMeltEntry[];
  dissolveEntries(): DissolveEntry[];
}

function findImage(element: HTMLElement | null): HTMLImageElement | null {
  if (!element) return null;
  if (element instanceof HTMLImageElement) return element;
  return element.querySelector('img');
}

function sourceOf(image: HTMLImageElement | null): string | null {
  if (!image) return null;
  return image.currentSrc || image.src || null;
}

function readMaskSnapshot(image: HTMLImageElement): MaskSnapshot {
  return {
    maskImage: image.style.getPropertyValue('mask-image'),
    maskPriority: image.style.getPropertyPriority('mask-image'),
    webkitMaskImage: image.style.getPropertyValue('-webkit-mask-image'),
    webkitMaskPriority: image.style.getPropertyPriority('-webkit-mask-image'),
  };
}

function restoreMask(entry: DissolveEntry): void {
  const image = entry.image;
  const previous = entry.previousMask;
  if (!image || !previous) return;
  if (previous.maskImage) {
    image.style.setProperty('mask-image', previous.maskImage, previous.maskPriority);
  } else {
    image.style.removeProperty('mask-image');
  }
  if (previous.webkitMaskImage) {
    image.style.setProperty(
      '-webkit-mask-image',
      previous.webkitMaskImage,
      previous.webkitMaskPriority,
    );
  } else {
    image.style.removeProperty('-webkit-mask-image');
  }
}

export function createImageMeltRegistry(): ImageMeltRegistry {
  const meltEntries = new Set<ImageMeltEntry>();
  const dissolveEntries = new Set<DissolveEntry>();
  const subscribers = new Set<() => void>();
  let counter = 0;
  const notify = (): void => subscribers.forEach((subscriber) => subscriber());

  return {
    registerMelt(entry) {
      const record: ImageMeltEntry = {
        ...entry,
        id: `image-melt-${++counter}`,
        painted: false,
        previousOpacity: entry.target.style.opacity,
      };
      meltEntries.add(record);
      notify();
      return () => {
        record.target.style.opacity = record.previousOpacity;
        record.painted = false;
        meltEntries.delete(record);
        notify();
      };
    },
    registerDissolve(entry) {
      const record: DissolveEntry = {
        ...entry,
        id: `dissolve-${++counter}`,
        previousMask: entry.image ? readMaskSnapshot(entry.image) : null,
      };
      dissolveEntries.add(record);
      notify();
      return {
        update(value: DissolveValue): void {
          const image = findImage(record.el);
          if (image !== record.image) {
            restoreMask(record);
            record.image = image;
            record.previousMask = image ? readMaskSnapshot(image) : null;
          }
          record.opts = resolveDissolveOptions(record.el, value);
          notify();
        },
        unregister(): void {
          restoreMask(record);
          dissolveEntries.delete(record);
          notify();
        },
      };
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    entries: () => [...meltEntries],
    dissolveEntries: () => [...dissolveEntries],
  };
}

export function registerDissolveItem(
  registry: ImageMeltRegistry,
  element: HTMLElement,
  value: DissolveValue,
): DissolveRegistration {
  const image = findImage(element);
  if (!image && isDev()) {
    console.warn(
      '[swimmer-ui] `dissolve` needs an <img> inside the item; text and other DOM content stay unchanged.',
    );
  }
  return registry.registerDissolve({
    el: element,
    image,
    opts: resolveDissolveOptions(element, value),
  });
}

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
      if (isDev() && !warnedRef.current) {
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

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface CardGeom extends Rect {
  r: number;
}

interface DissolveMotion {
  fade: number;
  release: { from: number; elapsed: number } | null;
  opacity: number;
  phase: number;
  previous: { x: number; y: number } | null;
  contact: Rect | null;
  axis: 'x' | 'y' | null;
}

export interface DissolveRenderState {
  id: string;
  src: string;
  neighborSrc: string | null;
  image: CardGeom;
  cx: number;
  cy: number;
  d: number;
  opacity: number;
  phase: number;
  structure: number;
  angle: number;
  gravityX: number;
  gravityY: number;
  elongation: number;
  mix: number;
  seamBlur: number;
  options: ResolvedDissolveOptions;
  mask: string | null;
}

export interface ImageMeltRenderState {
  width: number;
  height: number;
  melt: {
    a: CardGeom;
    b: CardGeom;
    srcA: string;
    srcB: string;
    opts: Required<ImageMeltOptions>;
    prox: number;
  } | null;
  dissolves: DissolveRenderState[];
}

const EMPTY_RENDER_STATE: ImageMeltRenderState = {
  width: 0,
  height: 0,
  melt: null,
  dissolves: [],
};

function round(value: number, places = 2): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

function smoothstep(value: number): number {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function rectGap(a: Rect, b: Rect): number {
  const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), 0);
  const dy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h), 0);
  return Math.hypot(dx, dy);
}

function contactPoint(a: Rect, b: Rect): { x: number; y: number } {
  return {
    x:
      a.x + a.w < b.x
        ? (a.x + a.w + b.x) / 2
        : b.x + b.w < a.x
          ? (b.x + b.w + a.x) / 2
          : (Math.max(a.x, b.x) + Math.min(a.x + a.w, b.x + b.w)) / 2,
    y:
      a.y + a.h < b.y
        ? (a.y + a.h + b.y) / 2
        : b.y + b.h < a.y
          ? (b.y + b.h + a.y) / 2
          : (Math.max(a.y, b.y) + Math.min(a.y + a.h, b.y + b.h)) / 2,
  };
}

function radiusOf(element: HTMLElement, width: number, height: number): number {
  const view = element.ownerDocument.defaultView;
  const raw = view?.getComputedStyle(element).borderTopLeftRadius ?? '';
  return Math.max(0, Math.min(Number.parseFloat(raw) || 0, width / 2, height / 2));
}

function groupRectOf(group: HTMLElement): DOMRect {
  return group.getBoundingClientRect();
}

function relativeRect(element: HTMLElement, groupRect: DOMRect): Rect {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - groupRect.left,
    y: rect.top - groupRect.top,
    w: rect.width,
    h: rect.height,
  };
}

function imageGeomOf(image: HTMLImageElement, groupRect: DOMRect): CardGeom {
  const rect = relativeRect(image, groupRect);
  return { ...rect, r: radiusOf(image, rect.w, rect.h) };
}

function geomKey(geom: Rect): string {
  return `${round(geom.x)}:${round(geom.y)}:${round(geom.w)}:${round(geom.h)}`;
}

function imageMeltFilterArea(
  group: HTMLElement,
  melt: Required<ImageMeltOptions> | null,
  dissolve: ResolvedDissolveOptions | null,
): number {
  const width = Math.max(1, group.offsetWidth || group.getBoundingClientRect().width);
  const height = Math.max(1, group.offsetHeight || group.getBoundingClientRect().height);
  const meltReach = melt
    ? Math.max(
        IMAGE_MELT_FILTER_PADDING,
        melt.blur * 3,
        melt.fade * 2,
        melt.warp + melt.waviness,
        melt.mixBlur * 2,
        melt.gravity * 0.5,
      )
    : 0;
  const dissolveReach = dissolve
    ? Math.max(
        IMAGE_MELT_FILTER_PADDING,
        dissolve.blur * 3,
        dissolve.warp + dissolve.zone,
        dissolve.gravity * 0.5,
        dissolve.seamBlur * 3,
      )
    : 0;
  const pad = Math.ceil(Math.max(meltReach, dissolveReach, IMAGE_MELT_FILTER_PADDING));
  return (width + pad * 2) * (height + pad * 2);
}

function maxDissolveOptions(entries: DissolveEntry[]): ResolvedDissolveOptions | null {
  const first = entries[0]?.opts;
  if (!first) return null;
  return entries.slice(1).reduce(
    (max, entry) => ({
      ...max,
      blur: Math.max(max.blur, entry.opts.blur),
      warp: Math.max(max.warp, entry.opts.warp),
      zone: Math.max(max.zone, entry.opts.zone),
      gravity: Math.max(max.gravity, entry.opts.gravity),
      seamBlur: Math.max(max.seamBlur, entry.opts.seamBlur),
    }),
    { ...first },
  );
}

export function getImageMeltFilterArea(
  group: HTMLElement,
  melt: Required<ImageMeltOptions> | null = null,
  dissolve: ResolvedDissolveOptions | null = null,
): number {
  return imageMeltFilterArea(group, melt, dissolve);
}

function flowTransform(
  cx: number,
  cy: number,
  gravityX: number,
  gravityY: number,
  d: number,
  pull: number,
  gravity: number,
  elongation: number,
  taper: number,
): string {
  const angle = (Math.atan2(gravityY, gravityX) * 180) / Math.PI;
  const gap = Math.max(0, (elongation - 1) * Math.max(8, 2 * d));
  const flow = Math.min(2.2, (Math.max(0, gravity) + gap) / Math.max(8, 2 * d)) * (0.5 + taper);
  const sx = 1 + flow;
  const sy = 1 / (1 + flow * 0.35);
  const anchorX = cx - gravityX * (d + pull);
  const anchorY = cy - gravityY * (d + pull);
  return (
    `translate(${round(anchorX)} ${round(anchorY)}) rotate(${round(angle)}) ` +
    `scale(${round(sx, 3)} ${round(sy, 3)}) rotate(${-round(angle)}) ` +
    `translate(${round(-anchorX)} ${round(-anchorY)})`
  );
}

function maskForImage(
  image: CardGeom,
  cx: number,
  cy: number,
  d: number,
  strength: number,
  bridge: number,
): string | null {
  const localX = cx - image.x;
  const localY = cy - image.y;
  const distance = Math.hypot(
    Math.max(image.x - cx, cx - (image.x + image.w), 0),
    Math.max(image.y - cy, cy - (image.y + image.h), 0),
  );
  if (distance > d + 2) return null;
  const radius = Math.min(image.w, image.h) / 2;
  const hole = Math.min(Math.max(d, bridge * 0.75), radius);
  const alpha = round(Math.max(0, 1 - Math.min(strength, bridge) * 2.2), 2);
  const middle = round((1 + 2 * alpha) / 3, 2);
  const far =
    Math.max(
      Math.hypot(localX, localY),
      Math.hypot(localX - image.w, localY),
      Math.hypot(localX, localY - image.h),
      Math.hypot(localX - image.w, localY - image.h),
    ) + 2;
  return (
    `radial-gradient(circle at ${round(localX)}px ${round(localY)}px, ` +
    `rgba(255,255,255,${alpha}) ${round(hole * 0.2)}px, ` +
    `rgba(255,255,255,${middle}) ${round(hole * 0.45)}px, ` +
    `#fff ${round(hole * 0.78)}px, #fff ${round(far)}px)`
  );
}

function erodeValues(amount: number): string {
  if (amount < 0.002) return '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1';
  const slope = round(1 + 4 * amount, 3);
  const intercept = round(1 - slope * (0.38 + 0.12 * amount), 3);
  return `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${slope} 0 0 0 ${intercept}`;
}

function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

interface RuntimeOptions {
  registry: ImageMeltRegistry;
  getGroup: () => HTMLElement | null;
  onState: (state: ImageMeltRenderState) => void;
}

export class ImageMeltRuntime {
  private readonly registry: ImageMeltRegistry;

  private readonly getGroup: () => HTMLElement | null;

  private readonly onState: (state: ImageMeltRenderState) => void;

  private readonly motions = new Map<string, DissolveMotion>();

  private readonly observed = new Set<Element>();

  private readonly removeListeners: Array<() => void> = [];

  private resizeObserver: ResizeObserver | null = null;

  private mutationObserver: MutationObserver | null = null;

  private awake = false;

  private raf = 0;

  private disposed = false;

  private lastNow = 0;

  private lastActivity = 0;

  private lastStateKey = '';

  private meltProximity = 0;

  private meltPairKey = '';

  private claimed = false;

  private budgetWarningEmitted = false;

  constructor(options: RuntimeOptions) {
    this.registry = options.registry;
    this.getGroup = options.getGroup;
    this.onState = options.onState;
  }

  invalidate = (): void => {
    if (this.disposed) return;
    this.lastActivity = this.now();
    this.ensureObservers();
    this.wake();
  };

  wake(): void {
    if (this.disposed || this.awake) return;
    if (this.registry.entries().length === 0 && this.registry.dissolveEntries().length === 0)
      return;
    this.awake = true;
    this.raf = requestAnimationFrame(this.loop);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.awake = false;
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
    this.removeListeners.forEach((remove) => remove());
    this.removeListeners.length = 0;
    for (const entry of this.registry.entries()) this.setMeltPainted(entry, false);
    for (const entry of this.registry.dissolveEntries()) restoreMask(entry);
    this.releaseClaim();
    this.observed.clear();
  }

  private now(): number {
    return performance.now();
  }

  private ensureObservers(): void {
    const group = this.getGroup();
    if (!group) return;
    if (!this.resizeObserver && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.invalidate());
      this.resizeObserver.observe(group);
    }
    const nextObserved = new Set<Element>();
    const addObserved = (element: Element | null): void => {
      if (!element) return;
      nextObserved.add(element);
      if (!this.observed.has(element)) this.resizeObserver?.observe(element);
    };
    for (const entry of this.registry.entries()) {
      addObserved(entry.el);
      addObserved(entry.target);
      addObserved(findImage(entry.target));
    }
    for (const entry of this.registry.dissolveEntries()) {
      addObserved(entry.el);
      addObserved(entry.image);
    }
    for (const element of this.observed) {
      if (!nextObserved.has(element)) this.resizeObserver?.unobserve(element);
    }
    this.observed.clear();
    nextObserved.forEach((element) => this.observed.add(element));

    if (!this.mutationObserver && typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver((mutations) => {
        if (
          mutations.some(
            (mutation) => mutation.attributeName === 'src' || !this.isOwnMutation(mutation.target),
          )
        ) {
          this.invalidate();
        }
      });
      this.mutationObserver.observe(group, {
        attributes: true,
        attributeFilter: ['class', 'style', 'src'],
        childList: true,
        subtree: true,
      });
    }
    const view = group.ownerDocument.defaultView;
    if (view && this.removeListeners.length === 0) {
      const wake = (): void => this.invalidate();
      view.addEventListener('scroll', wake, { capture: true, passive: true });
      this.removeListeners.push(() => view.removeEventListener('scroll', wake, true));
      for (const event of ['transitionrun', 'animationstart', 'pointerdown']) {
        group.addEventListener(event, wake, true);
        this.removeListeners.push(() => group.removeEventListener(event, wake, true));
      }
    }
  }

  private isOwnMutation(target: Node): boolean {
    if (!(target instanceof Element)) return false;
    if (target.closest('[data-liquid-gooey-image-melt]')) return true;
    if (
      target instanceof HTMLImageElement &&
      this.registry.dissolveEntries().some((entry) => entry.image === target)
    ) {
      return true;
    }
    if (this.registry.entries().some((entry) => entry.target === target)) return true;
    return false;
  }

  private setMeltPainted(entry: ImageMeltEntry, painted: boolean): void {
    if (entry.painted === painted) return;
    entry.painted = painted;
    entry.target.style.opacity = painted ? '0' : entry.previousOpacity;
  }

  private releaseClaim(): void {
    if (!this.claimed) return;
    releaseLiquidGooeyAnimation();
    this.claimed = false;
  }

  private ensureClaim(
    group: HTMLElement,
    melt: Required<ImageMeltOptions> | null,
    dissolve: ResolvedDissolveOptions | null,
  ): boolean {
    if (this.claimed) return true;
    const area = imageMeltFilterArea(group, melt, dissolve);
    if (!tryAcquireLiquidGooeyAnimation(area)) {
      if (!this.budgetWarningEmitted && isDev()) {
        this.budgetWarningEmitted = true;
        const budget = getLiquidGooeyBudget();
        const reason =
          budget.activeGroups >= budget.maxAnimatedGroups
            ? 'the active-group limit is reached'
            : 'the filter-area limit is exceeded';
        console.warn(
          `LiquidGroup: the Melt/dissolve image filter budget is insufficient (${reason}); ` +
            'degrading to crisp imagery for this group.',
        );
      }
      return false;
    }
    this.claimed = true;
    return true;
  }

  private loop = (now: number): void => {
    this.raf = 0;
    if (this.disposed) return;
    const meltEntries = this.registry.entries();
    const dissolveEntries = this.registry.dissolveEntries();
    if (meltEntries.length === 0 && dissolveEntries.length === 0) {
      this.awake = false;
      this.lastNow = 0;
      this.lastActivity = 0;
      this.meltPairKey = '';
      this.meltProximity = 0;
      if (this.lastStateKey) {
        this.lastStateKey = '';
        this.onState(EMPTY_RENDER_STATE);
      }
      this.releaseClaim();
      return;
    }
    const group = this.getGroup();
    if (!group) {
      this.raf = requestAnimationFrame(this.loop);
      return;
    }
    const dt = this.lastNow
      ? Math.min(0.25, Math.max(1 / 240, (now - this.lastNow) / 1000))
      : 1 / 60;
    this.lastNow = now;
    const groupRect = groupRectOf(group);
    const itemRects = new Map<HTMLElement, Rect>();
    for (const item of group.querySelectorAll<HTMLElement>('.game-ui-liquid-item')) {
      if (item.closest('.game-ui-liquid-group') !== group) continue;
      itemRects.set(item, relativeRect(item, groupRect));
    }

    const pair = meltEntries.slice(0, 2);
    const pairGeoms = pair.map((entry) => {
      const rect = itemRects.get(entry.el) ?? relativeRect(entry.el, groupRect);
      const image = findImage(entry.target);
      const currentSrc = sourceOf(image);
      if (currentSrc) entry.src = currentSrc;
      return { ...rect, r: radiusOf(entry.target, rect.w, rect.h) };
    });
    const validPair = pair.length === 2 && pairGeoms.every((geom) => geom.w > 0 && geom.h > 0);
    const meltOptions = validPair ? (pair[0]?.opts ?? null) : null;
    const pairKey = validPair ? `${pair[0]?.id}|${pair[1]?.id}` : '';
    if (pairKey !== this.meltPairKey) {
      this.meltPairKey = pairKey;
      this.meltProximity = 0;
    }
    const meltTarget =
      validPair && pairGeoms[0] && pairGeoms[1]
        ? smoothstep(1 - rectGap(pairGeoms[0], pairGeoms[1]) / Math.max(8, meltOptions!.blur * 2.6))
        : 0;
    this.meltProximity +=
      (meltTarget - this.meltProximity) * (1 - Math.exp(-MELT_PROXIMITY_RATE * dt));
    if (Math.abs(this.meltProximity - meltTarget) < 0.004) this.meltProximity = meltTarget;

    const dissolveResult = this.computeDissolves(dissolveEntries, itemRects, groupRect, dt);
    const needsMelt = validPair;
    const needsDissolve = dissolveResult.visuals.length > 0;
    const needsBudget = needsMelt || needsDissolve;
    const dissolveOptions = maxDissolveOptions(dissolveEntries);
    if (needsBudget && !this.ensureClaim(group, meltOptions, dissolveOptions)) {
      for (const entry of meltEntries) this.setMeltPainted(entry, false);
      for (const entry of dissolveEntries) restoreMask(entry);
      this.onState(EMPTY_RENDER_STATE);
      this.lastStateKey = '';
      this.awake = false;
      this.lastNow = 0;
      return;
    }

    if (needsMelt) {
      for (const [index, entry] of meltEntries.entries()) {
        this.setMeltPainted(entry, index < 2);
      }
    } else {
      for (const entry of meltEntries) this.setMeltPainted(entry, false);
      this.releaseClaim();
    }

    const state: ImageMeltRenderState = {
      width: Math.max(1, Math.round(group.offsetWidth || groupRect.width)),
      height: Math.max(1, Math.round(group.offsetHeight || groupRect.height)),
      melt:
        needsMelt && pairGeoms[0] && pairGeoms[1] && pair[0] && pair[1]
          ? {
              a: pairGeoms[0],
              b: pairGeoms[1],
              srcA: pair[0].src,
              srcB: pair[1].src,
              opts: pair[0].opts,
              prox: clamp(this.meltProximity),
            }
          : null,
      dissolves: dissolveResult.visuals,
    };
    const stateKey = this.renderStateKey(state);
    const changed = stateKey !== this.lastStateKey;
    if (changed) {
      this.lastStateKey = stateKey;
      this.onState(state);
      this.lastActivity = now;
    }

    const stillActive =
      changed || dissolveResult.pending || now - this.lastActivity < IMAGE_MELT_SLEEP_MS;
    if (stillActive) {
      this.awake = true;
      this.raf = requestAnimationFrame(this.loop);
    } else {
      this.awake = false;
      this.lastNow = 0;
      // A settled Melt/dissolve remains painted, but its shared clock sleeps.
      // The budget lease stays with the visible SVG until the pair/contact is
      // removed, so another expensive filter cannot silently overcommit the
      // process-wide ceiling.
    }
  };

  private renderStateKey(state: ImageMeltRenderState): string {
    const melt = state.melt
      ? `${state.melt.srcA}|${state.melt.srcB}|${geomKey(state.melt.a)}|${geomKey(state.melt.b)}|${round(state.melt.prox, 3)}`
      : '';
    const dissolve = state.dissolves
      .map(
        (visual) =>
          `${visual.id}|${visual.src}|${visual.neighborSrc ?? ''}|${geomKey(visual.image)}|${round(visual.cx)}|${round(visual.cy)}|${round(visual.d, 2)}|${round(visual.opacity, 3)}|${round(visual.phase, 3)}|${visual.mask ?? ''}`,
      )
      .join(';');
    return `${state.width}x${state.height}|${melt}|${dissolve}`;
  }

  private computeDissolves(
    entries: DissolveEntry[],
    itemRects: Map<HTMLElement, Rect>,
    groupRect: DOMRect,
    dt: number,
  ): { visuals: DissolveRenderState[]; pending: boolean } {
    const visuals: DissolveRenderState[] = [];
    let pending = false;
    const all = [...itemRects.entries()];
    for (const entry of entries) {
      const item = itemRects.get(entry.el);
      const image = entry.image;
      if (!item || !image) {
        if (entry.image) restoreMask(entry);
        continue;
      }
      const motion =
        this.motions.get(entry.id) ??
        ({
          fade: 0,
          release: null,
          opacity: 1,
          phase: 0,
          previous: null,
          contact: null,
          axis: null,
        } satisfies DissolveMotion);
      this.motions.set(entry.id, motion);
      let bestGap = Infinity;
      let bestOther: Rect | null = null;
      let bestOtherElement: HTMLElement | null = null;
      for (const [element, rect] of all) {
        if (element === entry.el) continue;
        const gap = rectGap(item, rect);
        if (gap < bestGap) {
          bestGap = gap;
          bestOther = rect;
          bestOtherElement = element;
        }
      }
      let embed = 0;
      let contactSpan = 0;
      if (bestOther && bestGap === 0) {
        const overlapX =
          Math.min(item.x + item.w, bestOther.x + bestOther.w) - Math.max(item.x, bestOther.x);
        const overlapY =
          Math.min(item.y + item.h, bestOther.y + bestOther.h) - Math.max(item.y, bestOther.y);
        const span = Math.max(1, Math.min(item.w, item.h, bestOther.w, bestOther.h));
        embed = Math.max(0, Math.min(overlapX, overlapY)) / span;
        contactSpan = Math.max(0, Math.max(overlapX, overlapY));
      }
      let target = 0;
      if (bestOther && bestGap < entry.opts.range && entry.opts.active) {
        const raw = smoothstep((1 - bestGap / entry.opts.range) / 0.65);
        const sunk = smoothstep(
          (embed - entry.opts.sink * 0.2) / Math.max(0.01, entry.opts.sink * 0.8),
        );
        target = raw ** 1.25 * entry.opts.strength * (1 - sunk);
      }
      if (target >= motion.fade) {
        motion.fade += (target - motion.fade) * Math.min(1, dt * DISSOLVE_ATTACK_RATE);
        motion.release = null;
      } else if (target > 0.02) {
        motion.fade += (target - motion.fade) * Math.min(1, dt * DISSOLVE_RETREAT_RATE);
        motion.release = null;
      } else if (motion.fade > 0.001 || motion.release) {
        if (!motion.release) motion.release = { from: motion.fade, elapsed: 0 };
        motion.release.elapsed += dt * 1000;
        const releaseDuration = Math.max(entry.opts.releaseMs, entry.opts.fadeMs);
        const progress = Math.min(1, motion.release.elapsed / releaseDuration);
        motion.fade = motion.release.from * (1 - progress) ** 2;
      } else {
        motion.fade = 0;
      }
      if (motion.fade <= 0.001) {
        motion.fade = 0;
        restoreMask(entry);
        continue;
      }
      const other = bestOther ?? motion.contact;
      if (!other) continue;
      const contact = contactPoint(item, other);
      motion.contact = { ...other };
      const structureFade = motion.release
        ? motion.release.from *
          (0.55 +
            0.45 * (1 - Math.min(1, motion.release.elapsed / Math.max(40, entry.opts.fadeMs))))
        : motion.fade;
      const structure = smoothstep(structureFade);
      const fadeProgress = motion.release
        ? Math.min(1, motion.release.elapsed / Math.max(40, entry.opts.fadeMs))
        : 0;
      motion.opacity = motion.release
        ? (1 - fadeProgress) ** 2
        : motion.opacity + (1 - motion.opacity) * Math.min(1, dt * DISSOLVE_ATTACK_RATE);
      const d = Math.min(Math.min(item.w, item.h) * 0.9, entry.opts.zone * (0.7 + 0.6 * structure));
      const previous = motion.previous;
      const speed = previous
        ? Math.hypot(item.x - previous.x, item.y - previous.y) / Math.max(1e-3, dt)
        : 0;
      motion.previous = { x: item.x, y: item.y };
      motion.phase += Math.min(dt, 1 / 24) * entry.opts.flowSpeed * 0.12 * Math.min(1, speed / 40);
      const gravityX =
        (other.x + other.w / 2 - contact.x) /
        Math.max(
          1e-3,
          Math.hypot(other.x + other.w / 2 - contact.x, other.y + other.h / 2 - contact.y),
        );
      const gravityY =
        (other.y + other.h / 2 - contact.y) /
        Math.max(
          1e-3,
          Math.hypot(other.x + other.w / 2 - contact.x, other.y + other.h / 2 - contact.y),
        );
      const elongation = 1 + Math.min(1.8, bestGap / Math.max(8, 2 * d));
      const imageGeom = imageGeomOf(image, groupRect);
      const bridge =
        bestOther && bestGap < Math.max(10, entry.opts.blur * 2.5)
          ? smoothstep(1 - bestGap / Math.max(10, entry.opts.blur * 2.5))
          : motion.fade;
      const mask = maskForImage(
        imageGeom,
        contact.x,
        contact.y,
        d,
        motion.fade,
        Math.max(bridge, contactSpan * 0.75),
      );
      if (mask) {
        image.style.setProperty('mask-image', mask);
        image.style.setProperty('-webkit-mask-image', mask);
      } else {
        restoreMask(entry);
      }
      const angle = (Math.atan2(gravityY, gravityX) * 180) / Math.PI;
      const visual: DissolveRenderState = {
        id: entry.id,
        src: sourceOf(image) ?? image.src,
        neighborSrc: bestOtherElement ? sourceOf(findImage(bestOtherElement)) : null,
        image: imageGeom,
        cx: contact.x,
        cy: contact.y,
        d,
        opacity: motion.opacity,
        phase: motion.phase,
        structure,
        angle,
        gravityX,
        gravityY,
        elongation,
        mix: entry.opts.mix,
        seamBlur: entry.opts.seamBlur,
        options: entry.opts,
        mask,
      };
      visuals.push(visual);
      pending =
        pending ||
        Boolean(motion.release) ||
        Math.abs(target - motion.fade) > 0.004 ||
        motion.previous === null;
    }
    return { visuals, pending };
  }
}

function MeltPair({
  a,
  b,
  srcA,
  srcB,
  opts,
  width,
  height,
  prox,
}: {
  a: CardGeom;
  b: CardGeom;
  srcA: string;
  srcB: string;
  opts: Required<ImageMeltOptions>;
  width: number;
  height: number;
  prox: number;
}): ReactNode {
  const uid = `lgm-${safeId(useId())}`;
  const { blur: gooBlur, contrast, reach, fade, warp, mix, mixBlur, gravity, waviness } = opts;
  const ca = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
  const cb = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
  const rA = (Math.hypot(a.w, a.h) / 2) * reach * prox;
  const rB = (Math.hypot(b.w, b.h) / 2) * reach * prox;
  const seam = { x: (ca.x + cb.x) / 2, y: (ca.y + cb.y) / 2 };
  const dxc = cb.x - ca.x;
  const dyc = cb.y - ca.y;
  const dc = Math.max(1e-3, Math.hypot(dxc, dyc));
  const tx = -dyc / dc;
  const ty = dxc / dc;
  const ovx = Math.max(0, (a.w + b.w) / 2 - Math.abs(dxc));
  const ovy = Math.max(0, (a.h + b.h) / 2 - Math.abs(dyc));
  const tanHalf = 0.5 * (ovx * Math.abs(tx) + ovy * Math.abs(ty)) * prox;
  const seamDeg = Math.round((Math.atan2(ty, tx) * 180) / Math.PI);
  const mixAmt = Math.round(mix * prox * 100) / 100;
  const blurEff = Math.round((2 + (gooBlur - 2) * prox) * 10) / 10;
  const warpEff = Math.round(warp * prox * 10) / 10;
  const colorBlur = Math.round(blurEff * 2.5 * 10) / 10;
  const edgeSoft = Math.round((0.4 + (2 + gooBlur * 0.8) * prox) * 10) / 10;
  const gA = `translate(${a.x}, ${a.y})`;
  const gB = `translate(${b.x}, ${b.y})`;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-gooey-imagemelt=""
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <pattern id={`${uid}-pa`} patternUnits="userSpaceOnUse" width={a.w} height={a.h}>
          <image href={srcA} width={a.w} height={a.h} preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <pattern id={`${uid}-pb`} patternUnits="userSpaceOnUse" width={b.w} height={b.h}>
          <image href={srcB} width={b.w} height={b.h} preserveAspectRatio="xMidYMid slice" />
        </pattern>
        <filter
          id={`${uid}-goo`}
          x="-15%"
          y="-15%"
          width="130%"
          height="130%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation={blurEff} result="b" />
          <feColorMatrix
            in="b"
            type="matrix"
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${Math.round((0.5 - contrast * (5 / 12)) * 100) / 100}`}
            result="goo"
          />
          <feGaussianBlur in="SourceGraphic" stdDeviation={colorBlur} result="bc" />
          <feComposite in="bc" in2="goo" operator="in" result="mix" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency={(2 + waviness * 1.2) / 1000}
            numOctaves="2"
            seed="4"
            result="wn"
          />
          <feDisplacementMap
            in="mix"
            in2="wn"
            scale={warpEff}
            xChannelSelector="R"
            yChannelSelector="G"
            result="warped"
          />
          <feComposite in="warped" in2="warped" operator="over" result="s1" />
          <feComposite in="s1" in2="s1" operator="over" result="s2" />
          <feComposite in="s2" in2="s2" operator="over" result="solid" />
          <feGaussianBlur in="solid" stdDeviation="0.6" />
        </filter>
        <filter id={`${uid}-soft`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={fade} />
        </filter>
        {mixAmt > 0.01 ? (
          <>
            <filter
              id={`${uid}-marble`}
              x="-25%"
              y="-25%"
              width="150%"
              height="150%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation={mixBlur} result="c" />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.011"
                numOctaves="2"
                seed="5"
                result="n1"
              />
              <feDisplacementMap
                in="c"
                in2="n1"
                scale={mixAmt * 90}
                xChannelSelector="R"
                yChannelSelector="G"
                result="d1"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.019"
                numOctaves="2"
                seed="11"
                result="n2"
              />
              <feDisplacementMap
                in="d1"
                in2="n2"
                scale={mixAmt * 50}
                xChannelSelector="R"
                yChannelSelector="G"
                result="d2"
              />
              <feComposite in="d2" in2="d2" operator="over" result="m1" />
              <feComposite in="m1" in2="m1" operator="over" result="m2" />
              <feGaussianBlur in="m2" stdDeviation="0.6" result="marble" />
              <feGaussianBlur in="SourceGraphic" stdDeviation={blurEff} result="mb" />
              <feColorMatrix
                in="mb"
                type="matrix"
                values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${contrast} ${Math.round((0.5 - contrast * (5 / 12)) * 100) / 100}`}
                result="mg"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency={(2 + waviness * 1.2) / 1000}
                numOctaves="2"
                seed="4"
                result="mwn"
              />
              <feDisplacementMap
                in="mg"
                in2="mwn"
                scale={warpEff}
                xChannelSelector="R"
                yChannelSelector="G"
                result="mshape"
              />
              <feComposite in="marble" in2="mshape" operator="in" />
            </filter>
            <mask
              id={`${uid}-marblemask`}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width={width}
              height={height}
            >
              <g filter={`url(#${uid}-soft)`}>
                <ellipse
                  cx={seam.x}
                  cy={seam.y}
                  rx={(rA + rB) / 2 + tanHalf}
                  ry={((rA + rB) / 2) * gravity}
                  transform={`rotate(${seamDeg}, ${seam.x}, ${seam.y})`}
                  fill="#fff"
                />
              </g>
            </mask>
          </>
        ) : null}
        <filter id={`${uid}-edge`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={edgeSoft} />
        </filter>
        <mask id={`${uid}-ma`} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
          <g filter={`url(#${uid}-edge)`}>
            <g transform={gA}>
              <rect width={a.w} height={a.h} rx={a.r} fill="#fff" />
            </g>
          </g>
          <g filter={`url(#${uid}-soft)`}>
            <ellipse
              cx={seam.x}
              cy={seam.y}
              rx={rB + tanHalf}
              ry={rB}
              transform={`rotate(${seamDeg}, ${seam.x}, ${seam.y})`}
              fill="#000"
            />
          </g>
        </mask>
        <mask id={`${uid}-mb`} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
          <g filter={`url(#${uid}-edge)`}>
            <g transform={gB}>
              <rect width={b.w} height={b.h} rx={b.r} fill="#fff" />
            </g>
          </g>
          <g filter={`url(#${uid}-soft)`}>
            <ellipse
              cx={seam.x}
              cy={seam.y}
              rx={rA + tanHalf}
              ry={rA}
              transform={`rotate(${seamDeg}, ${seam.x}, ${seam.y})`}
              fill="#000"
            />
          </g>
        </mask>
      </defs>
      <g filter={`url(#${uid}-goo)`}>
        <g transform={gA}>
          <rect width={a.w} height={a.h} rx={a.r} fill={`url(#${uid}-pa)`} />
        </g>
        <g transform={gB}>
          <rect width={b.w} height={b.h} rx={b.r} fill={`url(#${uid}-pb)`} />
        </g>
      </g>
      {mixAmt > 0.01 ? (
        <g mask={`url(#${uid}-marblemask)`}>
          <g filter={`url(#${uid}-marble)`}>
            <g transform={gA}>
              <rect width={a.w} height={a.h} rx={a.r} fill={`url(#${uid}-pa)`} />
            </g>
            <g transform={gB}>
              <rect width={b.w} height={b.h} rx={b.r} fill={`url(#${uid}-pb)`} />
            </g>
          </g>
        </g>
      ) : null}
      <g mask={`url(#${uid}-ma)`}>
        <g transform={gA}>
          <rect width={a.w} height={a.h} rx={a.r} fill={`url(#${uid}-pa)`} />
        </g>
      </g>
      <g mask={`url(#${uid}-mb)`}>
        <g transform={gB}>
          <rect width={b.w} height={b.h} rx={b.r} fill={`url(#${uid}-pb)`} />
        </g>
      </g>
    </svg>
  );
}

function DissolveLayers({ visuals }: { visuals: DissolveRenderState[] }): ReactNode {
  const uid = `lgd-${safeId(useId())}`;
  return (
    <>
      {visuals.map((visual) => {
        const base = `${uid}-${safeId(visual.id)}`;
        const imagePattern = `${base}-pattern`;
        const maskId = `${base}-mask`;
        const neighborPattern = base + '-neighbor';
        const image = visual.image;
        const zoneTransform =
          visual.elongation > 1.001
            ? `translate(${round(visual.cx)} ${round(visual.cy)}) rotate(${round(visual.angle)}) scale(${round(visual.elongation, 3)} 1) rotate(${-round(visual.angle)}) translate(${round(-visual.cx)} ${round(-visual.cy)})`
            : undefined;
        const filterRegion =
          visual.d * visual.elongation +
          visual.options.blur * 2.5 +
          visual.options.warp +
          visual.options.gravity * 0.5 +
          8;
        const baseFrequency = Math.min(
          0.3,
          Math.max(0.01, visual.options.warpFreq / (visual.options.zone * 1.1)),
        );
        const flow = flowTransform(
          visual.cx,
          visual.cy,
          visual.gravityX,
          visual.gravityY,
          visual.d,
          visual.options.pull * visual.structure,
          visual.options.gravity * visual.structure,
          visual.elongation,
          visual.options.taper,
        );
        return (
          <g key={visual.id} data-liquid-gooey-dissolve="">
            <defs>
              <pattern
                id={imagePattern}
                patternUnits="userSpaceOnUse"
                x={image.x}
                y={image.y}
                width={image.w}
                height={image.h}
              >
                <image
                  href={visual.src}
                  width={image.w}
                  height={image.h}
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
              {visual.neighborSrc ? (
                <pattern
                  id={neighborPattern}
                  patternUnits="userSpaceOnUse"
                  x={image.x}
                  y={image.y}
                  width={image.w}
                  height={image.h}
                >
                  <image
                    href={visual.neighborSrc}
                    width={image.w}
                    height={image.h}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </pattern>
              ) : null}
              <radialGradient id={`${base}-gradient`}>
                <stop offset="0%" stopColor="#fff" />
                <stop offset="55%" stopColor="#fff" />
                <stop offset="78%" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                <circle
                  cx={visual.cx}
                  cy={visual.cy}
                  r={visual.d * visual.elongation}
                  fill={`url(#${base}-gradient)`}
                  transform={zoneTransform}
                />
              </mask>
              {visual.seamBlur > 0 ? (
                <filter
                  id={`${base}-seam`}
                  filterUnits="userSpaceOnUse"
                  x={visual.cx - filterRegion}
                  y={visual.cy - filterRegion}
                  width={filterRegion * 2}
                  height={filterRegion * 2}
                  colorInterpolationFilters="sRGB"
                >
                  <feGaussianBlur stdDeviation={visual.seamBlur * visual.structure} />
                </filter>
              ) : null}
              {[0, 1, 2].map((index) => {
                const t = index / 2;
                const blur = visual.options.blur * (0.15 + 0.85 * t ** 1.4) * visual.structure;
                const warp = visual.options.warp * (0.45 + 0.55 * t) * visual.structure;
                const mix = visual.mix * visual.structure * (0.15 + 0.85 * t);
                const churn = visual.phase * (0.7 + 0.3 * t);
                const offsetX =
                  visual.gravityX * Math.sin(churn + t * 1.7) * 3 -
                  visual.gravityY * Math.cos(churn * 1.31 + t) * 1.5;
                const offsetY =
                  visual.gravityY * Math.cos(churn + t * 1.3) * 2 +
                  visual.gravityX * Math.sin(churn * 1.17 + t) * 1.1;
                return (
                  <filter
                    key={index}
                    id={`${base}-filter-${index}`}
                    filterUnits="userSpaceOnUse"
                    x={visual.cx - filterRegion}
                    y={visual.cy - filterRegion}
                    width={filterRegion * 2}
                    height={filterRegion * 2}
                    colorInterpolationFilters="sRGB"
                  >
                    <feTurbulence
                      type={visual.options.warpStyle}
                      baseFrequency={`${(baseFrequency * (index === 0 ? 0.35 : 1.6)).toFixed(4)} ${(baseFrequency * (index === 0 ? 1.6 : 0.35)).toFixed(4)}`}
                      numOctaves={visual.options.detail}
                      seed="17"
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale={warp}
                      xChannelSelector="R"
                      yChannelSelector="G"
                      result="warped"
                    />
                    <feGaussianBlur in="warped" stdDeviation={blur} result="soft" />
                    <feColorMatrix in="soft" type="saturate" values="1.2" result="col" />
                    <feTurbulence
                      type={visual.options.warpStyle}
                      baseFrequency={baseFrequency.toFixed(4)}
                      numOctaves={visual.options.detail}
                      seed="19"
                      result="erosion-noise"
                    />
                    <feColorMatrix
                      in="erosion-noise"
                      type="matrix"
                      values={erodeValues(mix)}
                      result="erosion"
                    />
                    <feComposite in="col" in2="erosion" operator="in" />
                    <feOffset dx={offsetX} dy={offsetY} />
                  </filter>
                );
              })}
            </defs>
            {visual.seamBlur > 0 ? (
              <g mask={`url(#${maskId})`} opacity={visual.opacity * 0.55}>
                <g filter={`url(#${base}-seam)`}>
                  <rect
                    x={image.x}
                    y={image.y}
                    width={image.w}
                    height={image.h}
                    rx={image.r}
                    fill={`url(#${imagePattern})`}
                  />
                </g>
              </g>
            ) : null}
            {[0, 1, 2].map((index) => (
              <g key={index} mask={`url(#${maskId})`} opacity={visual.opacity}>
                <g filter={`url(#${base}-filter-${index})`}>
                  <g transform={flow}>
                    <rect
                      x={image.x}
                      y={image.y}
                      width={image.w}
                      height={image.h}
                      rx={image.r}
                      fill={`url(#${imagePattern})`}
                    />
                  </g>
                </g>
              </g>
            ))}
            {visual.neighborSrc && visual.mix > 0 ? (
              <g
                mask={'url(#' + maskId + ')'}
                opacity={visual.opacity * Math.min(0.55, visual.mix * 0.55)}
              >
                <g filter={'url(#' + base + '-filter-1)'}>
                  <rect
                    x={image.x}
                    y={image.y}
                    width={image.w}
                    height={image.h}
                    rx={image.r}
                    fill={'url(#' + neighborPattern + ')'}
                  />
                </g>
              </g>
            ) : null}
          </g>
        );
      })}
    </>
  );
}

export function ImageMeltLayer({
  registry,
  getGroup,
}: {
  registry: ImageMeltRegistry;
  getGroup: () => HTMLElement | null;
}): ReactNode {
  const [state, setState] = useState<ImageMeltRenderState>(EMPTY_RENDER_STATE);
  useLayoutEffect(() => {
    const runtime = new ImageMeltRuntime({ registry, getGroup, onState: setState });
    const unsubscribe = registry.subscribe(runtime.invalidate);
    runtime.invalidate();
    return () => {
      unsubscribe();
      runtime.dispose();
    };
    // The group ref is stable; registry identity is the lifecycle boundary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry]);

  if (!state.melt && state.dissolves.length === 0) return null;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-liquid-gooey-image-melt=""
      width={state.width}
      height={state.height}
      viewBox={`0 0 ${state.width} ${state.height}`}
      style={
        {
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          overflow: 'visible',
          pointerEvents: 'none',
        } satisfies CSSProperties
      }
    >
      {state.melt ? <MeltPair {...state.melt} width={state.width} height={state.height} /> : null}
      {state.dissolves.length > 0 ? <DissolveLayers visuals={state.dissolves} /> : null}
    </svg>
  );
}
