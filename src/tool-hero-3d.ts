'use client';

/**
 * Optional Colour Worlds hero leaf. Install three separately only when this
 * entry is used; the game root and ordinary tool-worlds stay free of a
 * renderer dependency until a hero model is mounted.
 */
export {
  ToolHero3D,
  type ToolHero3DBuilder,
  type ToolHero3DFrameMetrics,
  type ToolHero3DModel,
  type ToolHero3DProps,
  type ToolHero3DThree,
} from './hero3d/ToolHero3D';
