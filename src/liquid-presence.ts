'use client';

/** Optional browser-only visual leaf; import its CSS after UIKit styles.css. */
export { LiquidPresence } from './presence/LiquidPresence/LiquidPresence';
export { LiquidReveal } from './presence/LiquidReveal/LiquidReveal';
export { LiquidAnchor } from './presence/LiquidAnchor/LiquidAnchor';
export { LiquidPopover } from './presence/LiquidPopover/LiquidPopover';
export type { LiquidPopoverProps } from './presence/LiquidPopover/LiquidPopover';
export type { LiquidAnchorProps } from './presence/LiquidAnchor/LiquidAnchor';
export type { LiquidRevealProps } from './presence/LiquidReveal/LiquidReveal';
export type {
  LiquidPresenceProps,
  LiquidPresenceActivity,
  LiquidPresenceTarget,
} from './presence/types';
export type { LiquidPresenceRect } from './presence/geometry';
// The account menu's panel is a LiquidPopover, so it ships with this entry and
// its stylesheet (liquid-presence.css), not with the root barrel.
export {
  GameAccountMenu,
  type GameAccountMenuLabels,
  type GameAccountMenuProps,
  type GameAccountProduct,
} from './game/GameAccountMenu/GameAccountMenu';
