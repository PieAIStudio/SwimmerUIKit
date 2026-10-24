import { type ReactNode } from 'react';

import { Icon } from '../../../icons/Icon/Icon';

import { Badge } from '../../../feedback/Badge/Badge';

import { Button } from '../../../controls/Button/Button';

import { IconButton } from '../../../controls/IconButton/IconButton';

import { Panel } from '../../../containers/Panel/Panel';

import { RadialMenu } from '../../../game/RadialMenu/RadialMenu';

import { SegmentedControl } from '../../../controls/SegmentedControl/SegmentedControl';

import { Slider } from '../../../controls/Slider/Slider';

import { Tabs } from '../../../controls/Tabs/Tabs';

import { Toggle } from '../../../controls/Toggle/Toggle';

import { Tooltip } from '../../../feedback/Tooltip/Tooltip';
import { useCopy } from '../context';

export function ButtonStates(): ReactNode {
  const { buttons: b } = useCopy();
  return (
    <Panel title={b.panelTitle} tone="strong">
      <div className="game-ui-component-row">
        <Button variant="primary">{b.openTable}</Button>
        <Button variant="secondary">{b.useCode}</Button>
        <Button variant="ghost">{b.continueHost}</Button>
        <Button variant="success">{b.readyUp}</Button>
        <Button variant="danger">{b.leaveTable}</Button>
        <Button disabled variant="secondary">
          {b.waiting}
        </Button>
      </div>
      <div className="game-ui-component-row">
        <Tooltip label={b.settingsTip}>
          <IconButton label={b.settingsTip}>
            <Icon icon="settings" size="sm" />
          </IconButton>
        </Tooltip>
        <IconButton label={b.copyInvite}>
          <Icon icon="copy" size="sm" />
        </IconButton>
        <Badge tone="ai">{b.aiBadge}</Badge>
        <Badge tone="success">{b.readyBadge}</Badge>
        <Badge tone="warning">{b.hostGateBadge}</Badge>
      </div>
      <SegmentedControl
        activeId="live"
        label={b.segmentedLabel}
        options={[
          { id: 'daily', label: b.segDaily },
          { id: 'live', label: b.segLive },
          { id: 'tokens', label: b.segTokens },
        ]}
      />
      <Tabs
        activeId="portal"
        tabs={[
          { id: 'portal', label: b.tabsPortal },
          { id: 'vote', label: b.tabsVote },
          { id: 'history', label: b.tabsHistory },
        ]}
      />
      <RadialMenu
        items={[
          { id: 'wave', label: b.wave },
          { id: 'think', label: b.think },
          { id: 'doubt', label: b.doubt },
        ]}
        label={b.radialLabel}
      />
      <Slider label={b.sliderLabel} max={100} min={0} value={68} />
      <Toggle checked label={b.toggleLabel} />
    </Panel>
  );
}
