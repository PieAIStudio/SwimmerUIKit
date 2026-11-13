import { useState } from 'react';
import '../src/showcase.css';
import { Badge, Button, Progress, SegmentedControl } from '@pieai/swimmer-ui-kit';
import { DemoPanel, FlowStrip, type KitManifest } from '@pieai/swimmer-ui-kit/showcase';
import kitManifest from './kit.json';

export const kit = kitManifest as KitManifest;

export default function Demo() {
  const [surface, setSurface] = useState('controls');

  return (
    <div className="kit-demo">
      <DemoPanel variant="stage" stageLabel="UIKit component stage">
        <div className="kit-demo__heading">
          <Badge tone="ai">{surface === 'controls' ? 'Control surface' : 'Token surface'}</Badge>
        </div>
        <SegmentedControl
          label="Showcase surface"
          activeId={surface}
          options={[
            { id: 'controls', label: 'Controls' },
            { id: 'tokens', label: 'Tokens' },
          ]}
          onSelect={setSurface}
        />
        <div className="kit-demo__surface">
          <Button variant="primary">Compose a panel</Button>
          <Progress label="Responsive budget" value={72} showValue />
        </div>
      </DemoPanel>
      <FlowStrip
        steps={[
          { label: 'Choose', detail: 'tokens' },
          { label: 'Compose', detail: 'parts' },
          { label: 'Ship', detail: 'page' },
        ]}
      />
    </div>
  );
}
