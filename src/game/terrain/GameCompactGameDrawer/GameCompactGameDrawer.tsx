import type { ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameButton } from '../../../controls/GameButton/GameButton';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';

import type { ClayIconName } from '../../../icons/assets';
import { type GameTerrainBuildVariant } from '../model';

export interface GameCompactGameDrawerProps {
  children: ReactNode;
  className?: string;
  closeIcon?: ClayIconName;
  closeLabel?: string;
  disabled?: boolean;
  label: string;
  onOpenChange?: ((open: boolean) => void) | undefined;
  open: boolean;
  panelId?: string;
  title: string;
  triggerIcon?: ClayIconName;
  triggerLabel?: string;
  variant?: GameTerrainBuildVariant;
  'data-testid'?: string | undefined;
}

export function GameCompactGameDrawer({
  children,
  className,
  closeIcon = 'close',
  closeLabel = 'Close tools',
  disabled = false,
  label,
  onOpenChange,
  open,
  panelId: providedPanelId,
  title,
  triggerIcon = 'settings',
  triggerLabel = 'Tools',
  variant = 'mobile',
  'data-testid': testId,
}: GameCompactGameDrawerProps): ReactNode {
  const classes = ['game-ui-compact-game-drawer', className].filter(Boolean).join(' ');
  const panelId =
    providedPanelId ?? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'tools'}-drawer-panel`;
  return (
    <aside
      aria-label={label}
      className={classes}
      data-open={open ? 'true' : 'false'}
      data-ui-hook="compact-game-drawer"
      data-variant={variant}
      data-testid={testId}
    >
      <GameButton
        aria-controls={panelId}
        aria-expanded={open}
        className="game-ui-compact-game-drawer-trigger"
        disabled={disabled}
        onClick={onOpenChange ? () => onOpenChange(!open) : undefined}
        type="button"
        variant="secondary"
      >
        <GameAssetIcon icon={open ? closeIcon : triggerIcon} size="sm" style="line" />
        {open ? closeLabel : triggerLabel}
      </GameButton>
      <div
        aria-hidden={!open}
        className="game-ui-compact-game-drawer-panel"
        data-drawer-panel="true"
        id={panelId}
      >
        <GamePanel title={title} tone="strong">
          {children}
        </GamePanel>
      </div>
    </aside>
  );
}
