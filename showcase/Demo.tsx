import { useState } from 'react';
import '../src/showcase.css';
import { Badge, Button, Progress, SegmentedControl } from '@pieai/swimmer-ui-kit';
import {
  DemoPanel,
  FlowStrip,
  type ShowcaseDemoCopy,
  type ShowcaseDemoProps,
} from '@pieai/swimmer-ui-kit/showcase';
import {
  SpriteIcon,
  spriteIconFromManifest,
  type SpriteIconState,
} from '@pieai/swimmer-ui-kit/tool-worlds';
import filesAct96 from '../src/icons/SpriteIcon/fixtures/files/act-96.webp';
import filesAct192 from '../src/icons/SpriteIcon/fixtures/files/act-192.webp';
import filesManifest from '../src/icons/SpriteIcon/fixtures/files/manifest.json';
import filesStill96 from '../src/icons/SpriteIcon/fixtures/files/still-96.webp';
import filesStill192 from '../src/icons/SpriteIcon/fixtures/files/still-192.webp';
import filesStill512 from '../src/icons/SpriteIcon/fixtures/files/still-512.webp';
import kitManifest from './kit.json';

export const kit = kitManifest as ShowcaseDemoProps['kit'];

const FILES_ASSETS: Record<string, string> = {
  'still-96.webp': filesStill96,
  'still-192.webp': filesStill192,
  'still-512.webp': filesStill512,
  'act-96.webp': filesAct96,
  'act-192.webp': filesAct192,
};

const FILES_SPRITE = spriteIconFromManifest(filesManifest, (file) => FILES_ASSETS[file] ?? file);

const SPRITE_SIZES = [28, 64, 128] as const;

const SPRITE_COPY = {
  en: {
    option: 'Sprites',
    badge: '3D SpriteIcon',
    play: 'Play act',
    playing: 'Playing…',
    light: 'Light ground',
    dark: 'Dark ground',
    tiers: '96 / 192 / 512',
    actionLabel: 'Play files act clip at',
  },
  zh: {
    option: '帧图标',
    badge: '3D SpriteIcon',
    play: '播放动作',
    playing: '播放中…',
    light: '浅色底面',
    dark: '深色底面',
    tiers: '96 / 192 / 512',
    actionLabel: '播放文件夹动作帧，尺寸',
  },
} as const;

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

type Surface = 'sprites' | 'controls' | 'tokens';

export default function Demo({ kit, language }: ShowcaseDemoProps) {
  const copy = kit.demo ?? fallbackDemoCopy;
  const spriteCopy = SPRITE_COPY[language];
  const [surface, setSurface] = useState<Surface>('sprites');
  const [composed, setComposed] = useState(false);
  const [spriteState, setSpriteState] = useState<SpriteIconState | undefined>(undefined);
  const flow =
    surface === 'sprites'
      ? [
          {
            label: { en: 'Sheet', zh: '帧表' },
            detail: { en: '21f @ 15fps', zh: '21帧 @ 15fps' },
          },
          {
            label: { en: 'Tiers', zh: '档位' },
            detail: { en: '96 / 192 / 512', zh: '96 / 192 / 512' },
          },
          {
            label: { en: 'State', zh: '状态' },
            detail:
              spriteState === 'act'
                ? { en: 'act -> rest', zh: 'act -> 静止' }
                : { en: 'rest still', zh: '静止帧' },
          },
        ]
      : composed
        ? copy.flow.map((step, index) =>
            index === 1 ? { ...step, detail: { en: 'composed', zh: '已组合' } } : step,
          )
        : copy.flow;

  return (
    <div className="kit-demo">
      <DemoPanel variant="stage" stageLabel={copy.stageLabel[language]}>
        <div className="kit-demo__heading">
          <Badge tone="neutral">
            {surface === 'sprites' ? spriteCopy.badge : copy.badge[language]}
          </Badge>
          {surface === 'sprites' ? (
            <Button
              size="sm"
              type="button"
              variant="primary"
              aria-pressed={spriteState === 'act'}
              onClick={() => setSpriteState((prev) => (prev === 'act' ? undefined : 'act'))}
            >
              {spriteState === 'act' ? spriteCopy.playing : spriteCopy.play}
            </Button>
          ) : null}
        </div>
        <SegmentedControl
          label={copy.surfaceLabel[language]}
          activeId={surface}
          onSelect={(id) => {
            if (id === 'sprites' || id === 'controls' || id === 'tokens') setSurface(id);
          }}
          options={[
            { id: 'sprites', label: spriteCopy.option },
            { id: 'controls', label: copy.controlsOption[language] },
            { id: 'tokens', label: copy.tokensOption[language] },
          ]}
        />
        {surface === 'sprites' ? (
          <div className="kit-demo__sprites">
            {(
              [
                { theme: 'light', title: spriteCopy.light },
                { theme: 'dark', title: spriteCopy.dark },
              ] as const
            ).map((ground) => (
              <section
                key={ground.theme}
                className={`kit-demo__sprite-surface kit-demo__sprite-surface--${ground.theme}`}
                data-game-ui-theme={ground.theme}
              >
                <div className="kit-demo__sprite-head">
                  <span>{ground.title}</span>
                  <span className="kit-demo__sprite-meta">{spriteCopy.tiers}</span>
                </div>
                <div className="kit-demo__sprite-row">
                  {SPRITE_SIZES.map((iconSize) => (
                    <button
                      key={`${ground.theme}-${iconSize}`}
                      aria-label={`${spriteCopy.actionLabel} ${iconSize}px`}
                      className="kit-demo__sprite-item"
                      type="button"
                      onClick={() => setSpriteState('act')}
                    >
                      <SpriteIcon
                        icon={FILES_SPRITE}
                        size={iconSize}
                        state={spriteState}
                        onClipEnd={() => setSpriteState(undefined)}
                      />
                      <span className="kit-demo__sprite-meta">{iconSize} px</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : surface === 'controls' ? (
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
            aria-label={language === 'zh' ? '令牌条带' : 'Token swatches'}
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
        <div
          className="kit-demo__demo-output"
          data-state={composed || spriteState === 'act' ? 'ready' : 'idle'}
        >
          <span className="kit-demo__demo-output-label">{copy.flowLabel[language]}</span>
          <FlowStrip ariaLabel={copy.flowLabel[language]} steps={flow} />
        </div>
      </DemoPanel>
    </div>
  );
}
