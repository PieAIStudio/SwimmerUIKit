import type { HTMLAttributes } from 'react';

export const SPRITE_ICON_TIERS = [96, 192, 512] as const;

export type SpriteIconTier = (typeof SPRITE_ICON_TIERS)[number];

export const SPRITE_ICON_CLIPS = ['idle', 'hover', 'syncing', 'done', 'problem', 'act'] as const;

export type SpriteIconClipName = (typeof SPRITE_ICON_CLIPS)[number];

export type SpriteIconInteractionState = 'rest' | 'hover' | 'focus' | 'selection';

export type SpriteIconState = SpriteIconInteractionState | SpriteIconClipName;

export type SpriteIconTierSources = Partial<Record<SpriteIconTier, string>> &
  ({ 96: string } | { 192: string } | { 512: string });

export interface SpriteIconClip {
  sheets: SpriteIconTierSources;
  frames: number;
  fps: number;
  cols?: number | undefined;
  rows?: number | undefined;
  loop?: boolean | undefined;
  seconds?: number | undefined;
}

export interface SpriteIconSource {
  still: SpriteIconTierSources;
  clips?: Partial<Record<SpriteIconClipName, SpriteIconClip>> | undefined;
}

export interface SpriteIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Frame-tier still URLs and optional named animation clip sheets. */
  icon: SpriteIconSource;
  /** Rendered CSS size in pixels when not stretched by parent layout (default 64). */
  size?: number | undefined;
  /** Only hero icons play the resting idle clip; ordinary icons stay still at rest. */
  hero?: boolean | undefined;
  /** Controlled visual state or named state clip override. */
  state?: SpriteIconState | undefined;
  /** Transitioning from false to true plays the selection clip once and returns to rest. */
  selected?: boolean | undefined;
  /** Explicit reduced-motion override alongside prefers-reduced-motion. */
  reducedMotion?: boolean | undefined;
  /** Optional device pixel ratio override for tests or deterministic rendering. */
  dpr?: number | undefined;
  /** Accessible label when meaningful; omitted marks the icon decorative. */
  label?: string | undefined;
  /** Called when a non-looping clip finishes and returns to the rest still. */
  onClipEnd?: ((clip: SpriteIconClipName) => void) | undefined;
}
