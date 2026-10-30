'use client';

/**
 * The Colour Worlds leaf keeps the game root small. Tool consumers import this
 * leaf alongside styles.css; no product state or route is included here.
 */
export { ActionPill, type ActionPillProps } from './controls/ActionPill/ActionPill';
export {
  BentoProgress,
  type BentoProgressProps,
  type BentoProgressState,
  type BentoProgressTile,
} from './containers/BentoProgress/BentoProgress';
export {
  GlassCard,
  type GlassCardProps,
  type GlassCardVariant,
} from './containers/GlassCard/GlassCard';
export {
  ManagerSheet,
  type ManagerSheetGroup,
  type ManagerSheetProps,
  type ManagerSheetRow,
} from './containers/ManagerSheet/ManagerSheet';
export {
  ToolLanding,
  type ToolLandingFeature,
  type ToolLandingProps,
} from './containers/ToolLanding/ToolLanding';
export {
  ToolSidebar,
  type ToolSidebarItem,
  type ToolSidebarProps,
} from './containers/ToolSidebar/ToolSidebar';
export {
  TOOL_WORLDS,
  ToolWindow,
  type ToolSidebarMode,
  type ToolWindowProps,
  type ToolWorld,
} from './containers/ToolWindow/ToolWindow';
export { Gem, type GemProps } from './controls/Gem/Gem';
export {
  RoundAction,
  type RoundActionProps,
  type RoundActionState,
} from './controls/RoundAction/RoundAction';
export { Switch, type SwitchProps } from './controls/Switch/Switch';
export { ToolIcon, type ToolIconName, type ToolIconProps } from './icons/ToolIcon/ToolIcon';
export { Checkbox, type CheckboxProps } from './controls/Checkbox/Checkbox';
