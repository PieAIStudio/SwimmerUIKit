import type * as THREE from 'three';

/** The runtime namespace passed to a primitive-only hero builder. */
export type ToolHero3DThree = typeof THREE;

/** Build one deterministic Group using Three's built-in primitive geometries. */
export type ToolHero3DBuilder = (THREE: ToolHero3DThree) => THREE.Group;

export type ToolHero3DModel =
  | {
      /** A local primitive model. The builder must not add lights, cameras or loaders. */
      build: ToolHero3DBuilder;
      fallback: string;
      alt?: string;
      id?: string;
    }
  | {
      /** A GLB URL. The loader and all failure handling stay inside the hero leaf. */
      url: string;
      fallback: string;
      alt?: string;
      id?: string;
    };

export interface ToolHero3DFrameMetrics {
  frameTimeMs: number;
  rendererCount: number;
  triangles: number;
}

export interface ToolHero3DProps {
  className?: string;
  model: ToolHero3DModel;
  onMetrics?: (metrics: ToolHero3DFrameMetrics) => void;
  reducedMotion?: boolean;
}
