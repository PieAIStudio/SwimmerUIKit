import { type HTMLAttributes, type ReactNode } from 'react';

import type { BlobShape, CornerRadii } from '../geometry';

import type { MorphTuning } from '../evolve';

import type { Transition } from '../spring';

import { type LiquidFill } from './fill';

export interface LiquidGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: ReactNode;
  /** Goo blur sigma in px. Larger values bridge larger gaps. */
  blur?: number;
  /** Alpha-contrast slope. Larger values make the liquid edge harder. */
  contrast?: number;
  /**
   * Volume. 0 leaves the body a flat colour; higher values light it as a
   * curved surface so it reads as a material rather than as a silhouette.
   */
  gloss?: number;
  /** Optional named finish. An explicit raw gloss wins; omitted preserves the old rendering. */
  /**
   * Surface fill. Defaults to the kit's theme surface token. A colour paints
   * the body flat; `{ top, bottom }` gives it light (see `LiquidFill`).
   */
  fill?: LiquidFill;
  /** Extra filter-region slack in px for the silhouette's painted edges. */
  filterPadding?: number;
  /** Optional token-based box-shadow syntax rebuilt on the merged silhouette. */
  shadow?: string;
  /** Optional stroke syntax rebuilt on the merged silhouette. Note: Do NOT add border to children directly! */
  stroke?: string;
  /** Max px the liquid boundary undulates. Defaults to the CSS token (6). */
  waviness?: number;
  /** Noise frequency of the undulation; lower values make longer waves. */
  wavinessFreq?: number;
  /**
   * Max fraction of the group's shorter side allowed for waviness. Defaults
   * to 0.3; pass `false` to explicitly disable the size clamp.
   */
  wavinessClamp?: number | false;
  /**
   * `auto` follows the existing component transition clock, `follow` adopts
   * the Move surface for an explicit user-caused selection/progress gesture,
   * and `reduced` snaps. Still remains the house default gesture.
   */
  motion?: 'auto' | 'follow' | 'reduced';
}

export interface LiquidItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Crisp content rendered above the merged silhouette. Do NOT add border,
   * outline, or box-shadow to children directly; put the shared treatment on
   * the parent <LiquidGroup> instead.
   */
  children: ReactNode;
  /** Mirrored translation applied to the content wrapper and SVG silhouette. */
  x?: number;
  y?: number;
  scale?: number;
  /**
   * Vertical scale, when it should differ from `scale`. A body that squashes
   * wider as it gets shorter reads as jelly; one that scales uniformly reads
   * as a thing getting smaller.
   */
  scaleY?: number;
  /** Spring preset/config or an explicit duration/easing pair. */
  transition?: Transition;
  /** Delay before this item starts its group-clock transition, in ms. */
  delay?: number;
  /** Override the measured content border radius for the silhouette. */
  radius?: number | CornerRadii;
  /**
   * Pour the outline outward into an organic body instead of leaving it a
   * rounded rectangle. The bulge is outward-only, so the silhouette always
   * contains the content's own box however bold the amplitude gets.
   */
  blob?: BlobShape;
  /**
   * Select the adopted item surface behavior. Bend follows child geometry.
   * Move is a group gesture (`motion="follow"`), not an item effect.
   */
  effect?: 'morph';
  /** Morph shape, tempo, bounce, and content cross-blur tuning. */
  morph?: MorphTuning;
  /** Follow a child moved by external code; Bend implies this automatically. */
  observe?: boolean;
}

export type { CornerRadii, MorphTuning, Transition };
