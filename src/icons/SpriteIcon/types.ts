import type { HTMLAttributes } from 'react';

export const SPRITE_ICON_TIERS = [96, 192, 512] as const;

export type SpriteIconTier = (typeof SPRITE_ICON_TIERS)[number];

export const SPRITE_ICON_CLIPS = ['idle', 'hover', 'syncing', 'done', 'problem', 'act'] as const;

export type SpriteIconClipName = (typeof SPRITE_ICON_CLIPS)[number];

export type SpriteIconRole = 'hero' | 'ordinary';

export type SpriteIconInteractionState = 'rest' | 'hover' | 'focus' | 'selection';

export type SpriteIconState = SpriteIconInteractionState | SpriteIconClipName;

export type SpriteIconTierSources = {
  96?: string | undefined;
  192?: string | undefined;
  512?: string | undefined;
} & ({ 96: string } | { 192: string } | { 512: string });

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
  role?: SpriteIconRole | undefined;
  still: SpriteIconTierSources;
  clips?: Partial<Record<SpriteIconClipName, SpriteIconClip | undefined>> | undefined;
}

export type SpriteIconManifestFile = string | { readonly file: string };

export interface SpriteIconManifestClip {
  readonly sheets: Readonly<Record<string, SpriteIconManifestFile | undefined>>;
  readonly frames: number;
  readonly fps: number;
  readonly cols?: number | undefined;
  readonly rows?: number | undefined;
  readonly loop?: boolean | undefined;
  readonly seconds?: number | undefined;
}

export interface SpriteIconManifest {
  readonly asset?: string | undefined;
  readonly role?: string | undefined;
  readonly still: Readonly<Record<string, SpriteIconManifestFile | undefined>>;
  readonly clips?: Readonly<Record<string, SpriteIconManifestClip | undefined>> | undefined;
}

export interface SpriteIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Frame-tier still URLs and optional named animation clip sheets. */
  icon: SpriteIconSource;
  /** Rendered CSS size in pixels when not stretched by parent layout (default 64). */
  size?: number | undefined;
  /** Only hero icons play resting idle; defaults from `icon.role === 'hero'` when omitted. */
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
