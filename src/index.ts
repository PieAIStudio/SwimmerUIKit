// Public membership authority. Implementation modules import their owners
// directly, never this barrel. All existing names remain present during S1.
// Styles ship separately: importing CSS here would leak a side-effect import
// into bundled declarations. Products load the styles.css package leaf once.

// Theme tokens and their typed mirrors.
export {
  CLAY_ASSET_SIZE_TOKENS,
  CLAY_COLOR_TOKENS,
  CLAY_ELEVATION_TOKENS,
  CLAY_LAYER_TOKENS,
  CLAY_LIQUID_GOOEY_TOKENS,
  CLAY_LIQUID_METAL_TOKENS,
  CLAY_MOTION_TOKENS,
  CLAY_OVERLAY_GLASS_TOKENS,
  CLAY_RADIUS_TOKENS,
  CLAY_SCROLLBAR_TOKENS,
  CLAY_SEMANTIC_TOKENS,
  CLAY_SPACE_TOKENS,
  CLAY_TARGET_TOKENS,
  CLAY_TYPE_TOKENS,
  CLAY_UI_TOKENS,
  GAME_UI_LIQUID_METAL_TOKENS,
  GAME_UI_LIQUID_GOOEY_TOKENS,
  GAME_UI_OVERLAY,
  GAME_UI_OVERLAY_GLASS_TOKENS,
  GAME_UI_TARGETS,
  GAME_UI_THEME_CONTRACT,
  GAME_UI_TOKENS,
  type ClayTokenCategory,
} from './tokens/index';

// Liquid bodies, behavior vocabulary and host resource budgets.
export {
  DEFAULT_LIQUID_GOOEY_ANIMATION_BUDGET,
  DEFAULT_LIQUID_GOOEY_FILTER_AREA_BUDGET,
  getLiquidGooeyBudget,
  setLiquidGooeyBudget,
} from './liquid/budget';
export { type LiquidFinish } from './liquid/finish';
export {
  LIQUID_FORM_NAMES,
  LIQUID_FORMS,
  liquidFormGroup,
  liquidFormItem,
  type LiquidForm,
  type LiquidFormGroup,
  type LiquidFormItem,
  type LiquidFormKind,
  type LiquidFormSpec,
} from './liquid/forms';
export { type LiquidFill } from './liquid/LiquidGroup/fill';
export { LiquidGroup } from './liquid/LiquidGroup/LiquidGroup';
export { LiquidItem } from './liquid/LiquidGroup/LiquidItem';
export {
  type BendTuning,
  type LiquidGroupProps,
  type LiquidItemProps,
  type MorphTuning,
} from './liquid/LiquidGroup/types';
export {
  LiquidSurface,
  liquidFormSummary,
  type LiquidSurfaceProps,
} from './liquid/LiquidSurface/LiquidSurface';
export { LIQUID_GOOEY_WAVINESS_MAX_FRACTION } from './liquid/waviness';

// Advanced effects; separated physically here, public leaf arrives in S3.
export {
  DISSOLVE_DEFAULTS,
  IMAGE_MELT_DEFAULTS,
  type DissolveOptions,
  type DissolveValue,
  type ImageMeltOptions,
  resolveDissolveOptions,
} from './liquid-effects/melt/options';

// Native input, choice and action controls.
export {
  GameActionGrid,
  type GameActionGridProps,
  type GameActionIconLabelMode,
  type GameActionStyle,
  type GameUiAction,
} from './controls/GameActionGrid/GameActionGrid';
export {
  GameButton,
  type GameButtonProps,
  type GameButtonSurface,
  type GameButtonVariant,
} from './controls/GameButton/GameButton';
export { GameCheckbox, type GameCheckboxProps } from './controls/GameCheckbox/GameCheckbox';
export { GameField, type GameFieldProps } from './controls/GameField/GameField';
export { GameIconButton, type GameIconButtonProps } from './controls/GameIconButton/GameIconButton';
export { GameInput, type GameInputProps } from './controls/GameInput/GameInput';
export {
  GameLanguageMenu,
  type GameLanguageMenuProps,
} from './controls/GameLanguageMenu/GameLanguageMenu';
export { GameListRow, type GameListRowProps } from './controls/GameListRow/GameListRow';
export { GameOtpInput, type GameOtpInputProps } from './controls/GameOtpInput/GameOtpInput';
export {
  GameSegmentedControl,
  type GameSegmentedControlProps,
} from './controls/GameSegmentedControl/GameSegmentedControl';
export { GameSelect, type GameSelectProps } from './controls/GameSelect/GameSelect';
export { GameSlider, type GameSliderProps } from './controls/GameSlider/GameSlider';
export { GameTabs, type GameTabItem, type GameTabsProps } from './controls/GameTabs/GameTabs';
export { GameTextArea, type GameTextAreaProps } from './controls/GameTextArea/GameTextArea';
export { GameToggle, type GameToggleProps } from './controls/GameToggle/GameToggle';
export {
  DEFAULT_LIQUID_METAL_CONTEXT_BUDGET,
  getLiquidMetalContextBudget,
  setLiquidMetalContextBudget,
} from './controls/LiquidMetalButton/budget';
export {
  LiquidMetalButton,
  type LiquidMetalButtonProps,
  type LiquidMetalRendererMode,
} from './controls/LiquidMetalButton/LiquidMetalButton';

// Status, progress, notices and contextual help.
export { GameBadge, type GameBadgeProps, type GameBadgeTone } from './feedback/GameBadge/GameBadge';
export {
  GameCallout,
  type GameCalloutProps,
  type GameCalloutTone,
} from './feedback/GameCallout/GameCallout';
export { GameEmptyState, type GameEmptyStateProps } from './feedback/GameEmptyState/GameEmptyState';
export { GameHelpTip, type GameHelpTipProps } from './feedback/GameHelpTip/GameHelpTip';
export {
  GameLoadingState,
  type GameLoadingStateProps,
} from './feedback/GameLoadingState/GameLoadingState';
export { GameProgress, type GameProgressProps } from './feedback/GameProgress/GameProgress';
export { GamePrompt, type GamePromptProps } from './feedback/GamePrompt/GamePrompt';
export { GameToast, type GameToastProps } from './feedback/GameToast/GameToast';
export { GameTooltip, type GameTooltipProps } from './feedback/GameTooltip/GameTooltip';
export {
  playGameCardRevealSound,
  playGameCardRevealSoundForContext,
  playGameInteractionSound,
  playGameInteractionSoundForContext,
  type GameInteractionAudioContext,
  type GameInteractionAudioParam,
  type GameInteractionGainNode,
  type GameInteractionOscillatorNode,
  type GameInteractionSoundOptions,
} from './feedback/sound/interactionSound';

// Panels, dialogs, shells and their presentation-only data.
export {
  GameCollapsiblePanel,
  type GameCollapsiblePanelLabels,
  type GameCollapsiblePanelProps,
} from './containers/GameCollapsiblePanel/GameCollapsiblePanel';
export { GameDialog, type GameDialogProps } from './containers/GameDialog/GameDialog';
export {
  GameHistoryPanel,
  type GameHistoryPanelProps,
  type GameUiHistoryEntry,
  type GameUiHistoryKind,
} from './containers/GameHistoryPanel/GameHistoryPanel';
export {
  GameHudActions,
  type GameHudActionsProps,
} from './containers/GameHudActions/GameHudActions';
export { GameModal, type GameModalProps } from './containers/GameModal/GameModal';
export { GamePanel, type GamePanelProps } from './containers/GamePanel/GamePanel';
export {
  GameSceneHudLayout,
  GameShell,
  type GameSceneHudLayoutProps,
  type GameShellProps,
} from './containers/GameShell/GameShell';
export {
  GameWindowPanel,
  type GameWindowPanelLabels,
  type GameWindowPanelProps,
  type GameWindowState,
} from './containers/GameWindowPanel/GameWindowPanel';
export {
  type GameAssetCardLayout,
  type GameSurfaceDensity,
  type GameSurfaceLayout,
} from './containers/shared/surfaceTypes';

// Game-facing display and compositions; no game state or product runtime.
export {
  GameAssetCard,
  type GameAssetBadge,
  type GameAssetCardProps,
  type GameAssetFact,
  type GameAssetSource,
  type GameAssetStatus,
} from './game/assets/GameAssetCard/GameAssetCard';
export {
  GameAssetLibrary,
  type GameAssetGroup,
  type GameAssetLibraryProps,
} from './game/assets/GameAssetLibrary/GameAssetLibrary';
export {
  GameBeforeAfterToggle,
  type GameBeforeAfterToggleProps,
} from './game/construction/GameBeforeAfterToggle/GameBeforeAfterToggle';
export {
  GameCompactJobDrawer,
  type GameCompactJobDrawerProps,
} from './game/construction/GameCompactJobDrawer/GameCompactJobDrawer';
export {
  GameConstructionApprovalBar,
  type GameConstructionApprovalBarProps,
} from './game/construction/GameConstructionApprovalBar/GameConstructionApprovalBar';
export {
  GameConstructionJobCard,
  type GameConstructionJobCardProps,
} from './game/construction/GameConstructionJobCard/GameConstructionJobCard';
export {
  GameConstructionProgress,
  type GameConstructionProgressProps,
} from './game/construction/GameConstructionProgress/GameConstructionProgress';
export {
  GameContractorPanel,
  type GameContractorPanelProps,
} from './game/construction/GameContractorPanel/GameContractorPanel';
export {
  GameRobotCrewStatus,
  type GameRobotCrewStatusProps,
} from './game/construction/GameRobotCrewStatus/GameRobotCrewStatus';
export {
  type GameBeforeAfterView,
  type GameConstructionAction,
  type GameConstructionActionId,
  type GameConstructionBadge,
  type GameConstructionFact,
  type GameConstructionJob,
  type GameConstructionJobStatus,
  type GameConstructionPreviewPane,
  type GameConstructionProgressStep,
  type GameConstructionProgressStepStatus,
  type GameConstructionProviderMode,
  type GameConstructionValidationTone,
  type GameConstructionValidationWarning,
  type GameConstructionVariant,
  type GameRobotCrewMember,
  type GameRobotCrewMemberStatus,
} from './game/construction/model';
export {
  FirstSessionHud,
  type FirstSessionHudIconSlots,
  type FirstSessionHudLabels,
  type FirstSessionHudProps,
} from './game/FirstSessionHud/FirstSessionHud';
export {
  FirstSessionOnboarding,
  type FirstSessionOnboardingLabels,
  type FirstSessionOnboardingProps,
  type FirstSessionOnboardingStep,
} from './game/FirstSessionOnboarding/FirstSessionOnboarding';
export { GameAvatar, type GameAvatarProps } from './game/GameAvatar/GameAvatar';
export {
  GameCardFan,
  type GameCardFanCard,
  type GameCardFanProps,
} from './game/GameCardFan/GameCardFan';
export {
  GameCollectibleCard,
  type GameCollectibleCardProps,
  type GameCollectibleCardRarity,
} from './game/GameCollectibleCard/GameCollectibleCard';
export {
  useGameCardOrientation,
  type GameCardTilt,
  type GameCardOrientationStatus,
} from './game/GameCollectibleCard/orientation';
export { GameCollectibleCardSlot } from './game/GameCollectibleCardSlot/GameCollectibleCardSlot';
export {
  GameFactList,
  GameStatList,
  type GameFactItem,
  type GameFactListProps,
  type GameStatListProps,
} from './game/GameFactList/GameFactList';
export { GameHud, type GameHudItem, type GameHudProps } from './game/GameHud/GameHud';
export {
  GameMovementPad,
  type GameMovementAction,
  type GameMovementDirection,
  type GameMovementPadProps,
} from './game/GameMovementPad/GameMovementPad';
export {
  GameOrientationGate,
  type GameOrientationGateProps,
} from './game/GameOrientationGate/GameOrientationGate';
export { GameRadialMenu, type GameRadialMenuProps } from './game/GameRadialMenu/GameRadialMenu';
export {
  GameSplash,
  useGameSplashDelay,
  type GameSplashLine,
  type GameSplashProps,
} from './game/GameSplash/GameSplash';
export { GameStageTile, type GameStageTileProps } from './game/GameStageTile/GameStageTile';
export {
  GameObjectToolbar,
  GamePlacementToolbar,
  type GameObjectToolbarProps,
  type GamePlacementToolbarProps,
} from './game/placement/GamePlacementToolbar/GamePlacementToolbar';
export {
  GameBrushControls,
  type GameBrushControlsProps,
} from './game/terrain/GameBrushControls/GameBrushControls';
export {
  GameBuildLibrary,
  type GameBuildLibraryProps,
} from './game/terrain/GameBuildLibrary/GameBuildLibrary';
export {
  GameCompactGameDrawer,
  type GameCompactGameDrawerProps,
} from './game/terrain/GameCompactGameDrawer/GameCompactGameDrawer';
export {
  GameMaterialSwatches,
  type GameMaterialSwatchesProps,
} from './game/terrain/GameMaterialSwatches/GameMaterialSwatches';
export {
  GameTerrainBuildToolbox,
  type GameTerrainBuildToolboxProps,
} from './game/terrain/GameTerrainBuildToolbox/GameTerrainBuildToolbox';
export {
  GameTerrainModeControl,
  type GameTerrainModeControlProps,
} from './game/terrain/GameTerrainModeControl/GameTerrainModeControl';
export {
  GameTerrainToolStrip,
  type GameTerrainToolStripProps,
} from './game/terrain/GameTerrainToolStrip/GameTerrainToolStrip';
export {
  GameUndoRedoActions,
  type GameUndoRedoActionsProps,
} from './game/terrain/GameUndoRedoActions/GameUndoRedoActions';
export {
  type GameBrushControlLabels,
  type GameBrushControlState,
  type GameBuildCategory,
  type GameBuildCategoryId,
  type GameBuildItem,
  type GameBuildItemStatus,
  type GameTerrainMaterialPattern,
  type GameTerrainMaterialSwatch,
  type GameTerrainBuildModeId,
  type GameTerrainBuildModeOption,
  type GameTerrainBuildVariant,
  type GameTerrainToolCompactLabelMode,
  type GameTerrainStatusState,
  type GameTerrainStatusTone,
  type GameTerrainToolId,
  type GameTerrainToolOption,
  type GameUndoRedoState,
} from './game/terrain/model';

// Public icon catalogs and asset resolution; paths remain unchanged.
export {
  CLAY_ASSETS,
  CLAY_ASSET_BASE_PATH,
  CLAY_GAME_SPRITES,
  CLAY_GAME_SPRITE_NAMES,
  CLAY_ICON_NAMES,
  CLAY_ICON_VARIANTS,
  acknowledgeClayPlaceholders,
  getClayAssetBasePath,
  getClayIconPath,
  getClayIconStyles,
  getClaySourceAssetPath,
  setClayAssetBasePath,
  setClayAssetMode,
  getClayAssetMode,
  type ClayAssetGroup,
  type ClayAssetMode,
  type ClayGameSpriteName,
  type ClayIconName,
  type ClayIconResolveOptions,
  type ClayIconStyle,
} from './icons/assets';
export { getClayCatalogPaths } from './icons/catalog';
export { GameAssetIcon, type GameAssetIconProps } from './icons/GameAssetIcon/GameAssetIcon';

// Showcase support; the dedicated preview leaf arrives in S3.
export { GameUiPreview, type GameUiPreviewProps } from './preview/GameUiPreview/GameUiPreview';
export { GAME_UI_PREVIEW_MESSAGES } from './preview/GameUiPreview/previewStates';
