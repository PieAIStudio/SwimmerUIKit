import { type ResolvedDissolveOptions, type ImageMeltOptions } from './options';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CardGeom extends Rect {
  r: number;
}

export interface DissolveMotion {
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

export const EMPTY_RENDER_STATE: ImageMeltRenderState = {
  width: 0,
  height: 0,
  melt: null,
  dissolves: [],
};
