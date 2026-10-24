'use client';

// Public package membership, grouped by implementation owner. CSS is a separate leaf.
export { GAME_UI_TARGETS, GAME_UI_THEME_CONTRACT, GAME_UI_TOKENS } from './tokens/index';
export { setLiquidGooeyBudget } from './liquid/budget';
export { liquidFormItem, type LiquidForm } from './liquid/forms';
export { type LiquidFill } from './liquid/LiquidGroup/fill';
export { LiquidGroup } from './liquid/LiquidGroup/LiquidGroup';
export {
  type LiquidGroupProps,
  type LiquidItemProps,
  type MorphTuning,
} from './liquid/LiquidGroup/types';
export { LiquidSurface, type LiquidSurfaceProps } from './liquid/LiquidSurface/LiquidSurface';
export { Button, type ButtonProps, type ButtonVariant } from './controls/Button/Button';
export { Checkbox, type CheckboxProps } from './controls/Checkbox/Checkbox';
export { Field, type FieldProps } from './controls/Field/Field';
export { IconButton, type IconButtonProps } from './controls/IconButton/IconButton';
export { Input, type InputProps } from './controls/Input/Input';
export { LanguageMenu, type LanguageMenuProps } from './controls/LanguageMenu/LanguageMenu';
export { ListRow, type ListRowProps } from './controls/ListRow/ListRow';
export { OtpInput, type OtpInputProps } from './controls/OtpInput/OtpInput';
export {
  SegmentedControl,
  type SegmentedControlProps,
} from './controls/SegmentedControl/SegmentedControl';
export { Select, type SelectProps } from './controls/Select/Select';
export { Slider, type SliderProps } from './controls/Slider/Slider';
export { Tabs, type TabItem, type TabsProps } from './controls/Tabs/Tabs';
export { TextArea, type TextAreaProps } from './controls/TextArea/TextArea';
export { Toggle, type ToggleProps } from './controls/Toggle/Toggle';
export { Badge, type BadgeProps, type BadgeTone } from './feedback/Badge/Badge';
export { Callout, type CalloutProps, type CalloutTone } from './feedback/Callout/Callout';
export { EmptyState, type EmptyStateProps } from './feedback/EmptyState/EmptyState';
export { HelpTip, type HelpTipProps } from './feedback/HelpTip/HelpTip';
export {
  HelpCard,
  type HelpCardProps,
  type HelpCardTopic,
  type HelpMedia,
} from './feedback/HelpCard/HelpCard';
export { LoadingState, type LoadingStateProps } from './feedback/LoadingState/LoadingState';
export { Progress, type ProgressProps } from './feedback/Progress/Progress';
export { Prompt, type PromptProps } from './feedback/Prompt/Prompt';
export { Toast, type ToastProps } from './feedback/Toast/Toast';
export { Tooltip, type TooltipProps } from './feedback/Tooltip/Tooltip';
export {
  playGameCardRevealSound,
  playGameInteractionSound,
  playGameInteractionSoundForContext,
  type InteractionAudioContext,
  type InteractionSoundOptions,
} from './feedback/sound/interactionSound';
export {
  CollapsiblePanel,
  type CollapsiblePanelLabels,
  type CollapsiblePanelProps,
} from './containers/CollapsiblePanel/CollapsiblePanel';
export { Dialog, type DialogProps } from './containers/Dialog/Dialog';
export {
  HistoryPanel,
  type HistoryPanelProps,
  type UiHistoryEntry,
  type UiHistoryKind,
} from './containers/HistoryPanel/HistoryPanel';
export { HudActions, type HudActionsProps } from './containers/HudActions/HudActions';
export { Modal, type ModalProps } from './containers/Modal/Modal';
export { Panel, type PanelProps } from './containers/Panel/Panel';
export { Shell, type ShellProps } from './containers/Shell/Shell';
export { type SurfaceDensity, type SurfaceLayout } from './containers/shared/surfaceTypes';
export {
  FirstSessionOnboarding,
  type FirstSessionOnboardingProps,
  type FirstSessionOnboardingLabels,
  type FirstSessionOnboardingStep,
} from './game/FirstSessionOnboarding/FirstSessionOnboarding';
export { Avatar, type AvatarProps } from './game/Avatar/Avatar';
export {
  CollectibleCard,
  type CollectibleCardProps,
  type CollectibleCardRarity,
} from './game/CollectibleCard/CollectibleCard';
export {
  useGameCardOrientation,
  type CardTilt,
  type CardOrientationStatus,
} from './game/CollectibleCard/orientation';
export { CollectibleCardSlot } from './game/CollectibleCardSlot/CollectibleCardSlot';
export { FactList, type FactItem, type FactListProps } from './game/FactList/FactList';
export {
  MovementPad,
  type MovementAction,
  type MovementDirection,
  type MovementPadProps,
} from './game/MovementPad/MovementPad';
export { RadialMenu, type RadialMenuProps } from './game/RadialMenu/RadialMenu';
export { Splash, type SplashLine, type SplashProps } from './game/Splash/Splash';
export { StageTile, type StageTileProps } from './game/StageTile/StageTile';
export {
  MaterialSwatches,
  type MaterialSwatchesProps,
} from './controls/MaterialSwatches/MaterialSwatches';
export { GAME_ICON_NAMES, type IconName } from './icons/registry';
export type { IconData } from './icons/types';
export { Icon, type IconProps } from './icons/Icon/Icon';
export type {
  MaterialSwatch,
  MaterialPattern,
  MaterialLayout,
} from './controls/MaterialSwatches/types';

export type { UiHue } from './tokens/hue';
export { GAME_UI_STYLES, GAME_UI_DEFAULT_STYLE, type UiStyle, type UiTheme } from './tokens/styles';
