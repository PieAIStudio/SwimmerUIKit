import '../src/showcase.css';
import { Badge, Button, Progress, SegmentedControl } from '@pieai/swimmer-ui-kit';
import {
  DemoPanel,
  FlowStrip,
  type ShowcaseDemoCopy,
  type ShowcaseDemoProps,
} from '@pieai/swimmer-ui-kit/showcase';
import kitManifest from './kit.json';

export const kit = kitManifest as ShowcaseDemoProps['kit'];

const fallbackDemoCopy: ShowcaseDemoCopy = {
  stageLabel: { en: 'UIKit component stage', zh: 'UIKit 组件舞台' },
  surfaceLabel: { en: 'Showcase surface', zh: '展示表面' },
  badge: { en: 'Control surface', zh: '控件表面' },
  controlsOption: { en: 'Controls', zh: '控件' },
  tokensOption: { en: 'Tokens', zh: '令牌' },
  buttonLabel: { en: 'Compose a panel', zh: '组合面板' },
  progressLabel: { en: 'Responsive budget', zh: '响应式预算' },
  flowLabel: { en: 'Demo flow', zh: '演示流程' },
  flow: [
    { label: { en: 'Choose', zh: '选择' }, detail: { en: 'tokens', zh: '令牌' } },
    { label: { en: 'Compose', zh: '组合' }, detail: { en: 'parts', zh: '部件' } },
    { label: { en: 'Ship', zh: '发布' }, detail: { en: 'page', zh: '页面' } },
  ],
};

export default function Demo({ kit, language }: ShowcaseDemoProps) {
  const copy = kit.demo ?? fallbackDemoCopy;

  return (
    <div className="kit-demo">
      <DemoPanel variant="stage" stageLabel={copy.stageLabel[language]}>
        <div className="kit-demo__heading">
          <Badge tone="ai">{copy.badge[language]}</Badge>
        </div>
        <SegmentedControl
          label={copy.surfaceLabel[language]}
          activeId="controls"
          options={[
            { id: 'controls', label: copy.controlsOption[language] },
            { id: 'tokens', label: copy.tokensOption[language] },
          ]}
        />
        <div className="kit-demo__surface">
          <Button variant="primary">{copy.buttonLabel[language]}</Button>
          <Progress label={copy.progressLabel[language]} value={72} showValue />
        </div>
      </DemoPanel>
      <FlowStrip ariaLabel={copy.flowLabel} steps={copy.flow} />
    </div>
  );
}
