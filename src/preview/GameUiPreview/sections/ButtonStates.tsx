import { type ReactNode } from 'react';

import { GameAssetIcon } from '../../../icons/GameAssetIcon/GameAssetIcon';

import { GameBadge } from '../../../feedback/GameBadge/GameBadge';

import { GameButton } from '../../../controls/GameButton/GameButton';

import { GameIconButton } from '../../../controls/GameIconButton/GameIconButton';

import { GamePanel } from '../../../containers/GamePanel/GamePanel';

import { GameRadialMenu } from '../../../game/GameRadialMenu/GameRadialMenu';

import { GameSegmentedControl } from '../../../controls/GameSegmentedControl/GameSegmentedControl';

import { GameSlider } from '../../../controls/GameSlider/GameSlider';

import { GameTabs } from '../../../controls/GameTabs/GameTabs';

import { GameToggle } from '../../../controls/GameToggle/GameToggle';

import { GameTooltip } from '../../../feedback/GameTooltip/GameTooltip';
import { useCopy } from '../context';

export function ButtonStates(): ReactNode {
  const { buttons: b } = useCopy();
  return (
    <GamePanel title={b.panelTitle} tone="strong">
      <div className="game-ui-component-row">
        <GameButton variant="primary">{b.openTable}</GameButton>
        <GameButton variant="secondary">{b.useCode}</GameButton>
        <GameButton variant="ghost">{b.continueHost}</GameButton>
        <GameButton variant="success">{b.readyUp}</GameButton>
        <GameButton variant="danger">{b.leaveTable}</GameButton>
        <GameButton disabled variant="secondary">
          {b.waiting}
        </GameButton>
      </div>
      <div className="game-ui-component-row">
        <GameTooltip label={b.settingsTip}>
          <GameIconButton label={b.settingsTip}>
            <GameAssetIcon icon="settings" size="sm" />
          </GameIconButton>
        </GameTooltip>
        <GameIconButton label={b.copyInvite}>
          <GameAssetIcon icon="copy" size="sm" />
        </GameIconButton>
        <GameBadge tone="ai">{b.aiBadge}</GameBadge>
        <GameBadge tone="success">{b.readyBadge}</GameBadge>
        <GameBadge tone="warning">{b.hostGateBadge}</GameBadge>
      </div>
      <GameSegmentedControl
        activeId="live"
        label={b.segmentedLabel}
        options={[
          { id: 'daily', label: b.segDaily },
          { id: 'live', label: b.segLive },
          { id: 'tokens', label: b.segTokens },
        ]}
      />
      <GameTabs
        activeId="portal"
        tabs={[
          { id: 'portal', label: b.tabsPortal },
          { id: 'vote', label: b.tabsVote },
          { id: 'history', label: b.tabsHistory },
        ]}
      />
      <GameRadialMenu
        items={[
          { id: 'wave', label: b.wave },
          { id: 'think', label: b.think },
          { id: 'doubt', label: b.doubt },
        ]}
        label={b.radialLabel}
      />
      <GameSlider label={b.sliderLabel} max={100} min={0} value={68} />
      <GameToggle checked label={b.toggleLabel} />
    </GamePanel>
  );
}
