import { useState } from 'react';
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
  flowLabel: { en: 'Demo output', zh: '演示输出' },
  flow: [
    { label: { en: 'Track', zh: '轨道' }, detail: { en: 'neutral', zh: '中性' } },
    { label: { en: 'Fill', zh: '填充' }, detail: { en: 'teal', zh: '青色' } },
    { label: { en: 'Wrap', zh: '换行' }, detail: { en: 'responsive', zh: '响应式' } },
  ],
};

type Surface = 'controls' | 'tokens';

export default function Demo({ kit, language }: ShowcaseDemoProps) {
  const copy = kit.demo ?? fallbackDemoCopy;
  const [surface, setSurface] = useState<Surface>('controls');
  const [composed, setComposed] = useState(false);

  return (
    <div className="kit-demo">
      <DemoPanel variant="stage" stageLabel={copy.stageLabel[language]}>
        <div className="kit-demo__heading">
          <Badge tone="neutral">{copy.badge[language]}</Badge>
        </div>
        <SegmentedControl
          label={copy.surfaceLabel[language]}
          activeId={surface}
          onSelect={(id) => {
            if (id === 'controls' || id === 'tokens') setSurface(id);
          }}
          options={[
            { id: 'controls', label: copy.controlsOption[language] },
            { id: 'tokens', label: copy.tokensOption[language] },
          ]}
        />
        {surface === 'controls' ? (
          <div className="kit-demo__surface">
            <Button
              type="button"
              variant="primary"
              aria-pressed={composed}
              onClick={() => setComposed((value) => !value)}
            >
              {composed
                ? language === 'zh'
                  ? '面板已组合'
                  : 'Panel composed'
                : copy.buttonLabel[language]}
            </Button>
            <Progress
              className="kit-demo__progress"
              label={copy.progressLabel[language]}
              value={72}
              showValue
            />
          </div>
        ) : (
          <div
            className="kit-demo__tokens"
            aria-label={language === 'zh' ? '令牌样本' : 'Token samples'}
          >
            <div className="kit-demo__token">
              <span
                className="kit-demo__token-swatch kit-demo__token-swatch--surface"
                aria-hidden="true"
              />
              <span>
                <strong>{language === 'zh' ? '表面' : 'Surface'}</strong>
                <small>neutral</small>
              </span>
            </div>
            <div className="kit-demo__token">
              <span
                className="kit-demo__token-swatch kit-demo__token-swatch--accent"
                aria-hidden="true"
              />
              <span>
                <strong>{language === 'zh' ? '强调' : 'Accent'}</strong>
                <small>teal</small>
              </span>
            </div>
            <div className="kit-demo__token">
              <span
                className="kit-demo__token-swatch kit-demo__token-swatch--border"
                aria-hidden="true"
              />
              <span>
                <strong>{language === 'zh' ? '边框' : 'Border'}</strong>
                <small>subtle</small>
              </span>
            </div>
          </div>
        )}
        <div className="kit-demo__demo-output">
          <span className="kit-demo__demo-output-label">{copy.flowLabel[language]}</span>
          <FlowStrip ariaLabel={copy.flowLabel[language]} steps={copy.flow} />
        </div>
      </DemoPanel>
    </div>
  );
}
