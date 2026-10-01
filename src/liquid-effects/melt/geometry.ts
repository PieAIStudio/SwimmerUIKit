import { clamp, type ImageMeltOptions, type ResolvedDissolveOptions } from './options';
import { type Rect, type CardGeom } from './types';
import { IMAGE_MELT_FILTER_PADDING } from './constants';
import { type DissolveEntry } from './registry';

export function round(value: number, places = 2): number {
  const scale = 10 ** places;
  return Math.round(value * scale) / scale;
}

export function smoothstep(value: number): number {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

export function rectGap(a: Rect, b: Rect): number {
  const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), 0);
  const dy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h), 0);
  return Math.hypot(dx, dy);
}

export function contactPoint(a: Rect, b: Rect): { x: number; y: number } {
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

export function radiusOf(element: HTMLElement, width: number, height: number): number {
  const view = element.ownerDocument.defaultView;
  const raw = view?.getComputedStyle(element).borderTopLeftRadius ?? '';
  return Math.max(0, Math.min(Number.parseFloat(raw) || 0, width / 2, height / 2));
}

export function groupRectOf(group: HTMLElement): DOMRect {
  return group.getBoundingClientRect();
}

export function relativeRect(element: HTMLElement, groupRect: DOMRect): Rect {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - groupRect.left,
    y: rect.top - groupRect.top,
    w: rect.width,
    h: rect.height,
  };
}

export function imageGeomOf(image: HTMLImageElement, groupRect: DOMRect): CardGeom {
  const rect = relativeRect(image, groupRect);
  return { ...rect, r: radiusOf(image, rect.w, rect.h) };
}

export function geomKey(geom: Rect): string {
  return `${round(geom.x)}:${round(geom.y)}:${round(geom.w)}:${round(geom.h)}`;
}

export function imageMeltFilterArea(
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

export function maxDissolveOptions(entries: DissolveEntry[]): ResolvedDissolveOptions | null {
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

export function flowTransform(
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

export function maskForImage(
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

export function erodeValues(amount: number): string {
  if (amount < 0.002) return '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1';
  const slope = round(1 + 4 * amount, 3);
  const intercept = round(1 - slope * (0.38 + 0.12 * amount), 3);
  return `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  ${slope} 0 0 0 ${intercept}`;
}

export function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}
