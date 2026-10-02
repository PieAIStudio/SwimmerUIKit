import { liquidTokens } from '../../tokens/references';

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

export function clamp(value: number, min = 0, max = 1): number {
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
  const reference = liquidTokens[key];
  const name = /^var\((--[\w-]+)\)$/.exec(reference)?.[1];
  if (!name) return fallback;
  const parsed = Number.parseFloat(view.getComputedStyle(element).getPropertyValue(name));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function resolveImageMeltOptions(
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
