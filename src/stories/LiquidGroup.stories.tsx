import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';

import { GameButton, LiquidGroup } from '../index';
import '../preview.css';

const meta = {
  title: 'Clay/Effects/LiquidGroup',
  component: LiquidGroup,
  args: { children: null },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '一次性的庆祝、合并瞬间和转场用的液态合并原语。不要把它当常驻背景，不要放在正文文字背后，也不要放在导航上。',
      },
    },
  },
} satisfies Meta<typeof LiquidGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

interface MorphSceneProps {
  eyebrow: string;
  title: string;
  description: string;
  initialMerged: boolean;
  motion?: 'auto' | 'reduced';
  shadow?: string;
  stroke?: string;
  waviness?: number;
  wavinessFreq?: number;
}

function MorphScene({
  eyebrow,
  title,
  description,
  initialMerged,
  motion = 'auto',
  shadow,
  stroke = '1px solid var(--game-ui-border-subtle)',
  waviness,
  wavinessFreq,
}: MorphSceneProps): ReactNode {
  const [merged, setMerged] = useState(initialMerged);
  const firstX = merged ? 24 : -24;
  const secondX = merged ? -24 : 24;
  const textureProps = {
    ...(waviness === undefined ? {} : { waviness }),
    ...(wavinessFreq === undefined ? {} : { wavinessFreq }),
  };

  return (
    <article className="game-ui-liquid-gooey-card">
      <header className="game-ui-liquid-demo-header">
        <span className="game-ui-liquid-demo-kicker">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="game-ui-liquid-demo-stage">
        <LiquidGroup
          blur={10}
          className="game-ui-liquid-demo-group"
          contrast={18}
          filterPadding={28}
          motion={motion}
          {...(shadow ? { shadow } : {})}
          stroke={stroke}
          style={{ width: '100%', height: '220px' }}
          {...textureProps}
        >
          <LiquidGroup.Item
            radius={999}
            style={{
              position: 'absolute',
              top: '72px',
              left: 'calc(50% - 96px)',
              width: '76px',
              height: '76px',
            }}
            transition="bouncy"
            x={firstX}
          >
            <button className="game-ui-liquid-demo-orb" type="button">
              A
            </button>
          </LiquidGroup.Item>
          <LiquidGroup.Item
            radius={999}
            style={{
              position: 'absolute',
              top: '72px',
              left: 'calc(50% + 20px)',
              width: '120px',
              height: '76px',
            }}
            transition="bouncy"
            x={secondX}
          >
            <button className="game-ui-liquid-demo-capsule" type="button">
              Pill
            </button>
          </LiquidGroup.Item>
        </LiquidGroup>
      </div>
      <div className="game-ui-liquid-demo-controls">
        <GameButton onClick={() => setMerged((value) => !value)} variant="primary">
          {merged ? 'Split the drops' : 'Merge the drops'}
        </GameButton>
        <span className="game-ui-liquid-demo-status" aria-live="polite">
          {motion === 'reduced'
            ? 'Reduced motion · instant state change'
            : merged
              ? 'Merged · content cross-blurs while settling'
              : 'Separated · pull them together to reconnect'}
        </span>
      </div>
    </article>
  );
}

export const MergingPieces: Story = {
  render: () => (
    <MorphScene
      description="两个短促的交互元素靠近时共享一块剪影，适合庆祝合并或奖励结算。"
      eyebrow="Morph · connected"
      initialMerged
      title="Two drops, one moment"
      waviness={0}
      wavinessFreq={0.018}
    />
  ),
};

export const SeparatedPieces: Story = {
  render: () => (
    <MorphScene
      description="分开后拉丝自然断开；真实按钮仍在 DOM 中，焦点和命中区域不随滤镜改变。"
      eyebrow="Morph · separated"
      initialMerged={false}
      title="The thread lets go"
    />
  ),
};

export const ReducedMotion: Story = {
  render: () => (
    <MorphScene
      description="用组件级开关模拟 prefers-reduced-motion: reduce，保留形状但取消所有运动。"
      eyebrow="Accessibility · reduced"
      initialMerged
      motion="reduced"
      title="Instant, still, accessible"
    />
  ),
};

export const StrokeAndShadow: Story = {
  render: () => (
    <MorphScene
      description="轮廓线和阴影都属于融合后的剪影；子元素只保留可点击、可读的内容。"
      eyebrow="Surface · group-owned"
      initialMerged
      shadow="0 10px 22px color-mix(in srgb, var(--game-ui-accent) 30%, transparent)"
      stroke="2px solid var(--game-ui-accent)"
      title="One outline, one shadow"
    />
  ),
};

export const WavinessConservative: Story = {
  render: () => (
    <MorphScene
      description="3px 的长波只打破几何直线，适合存量组件的低风险质感升级。"
      eyebrow="Waviness · conservative · 3px"
      initialMerged={false}
      title="A soft liquid edge"
      waviness={3}
      wavinessFreq={0.022}
    />
  ),
};

export const WavinessDefault: Story = {
  render: () => (
    <MorphScene
      description="6px 的懒波让边缘和中间 neck 都脱离圆角矩形，但仍保持克制。"
      eyebrow="Waviness · default · 6px"
      initialMerged={false}
      title="The bridge turns fluid"
      waviness={6}
      wavinessFreq={0.018}
    />
  ),
};

export const WavinessBold: Story = {
  render: () => (
    <MorphScene
      description="10px 的长波把流体剪影推到前景，只适合明确的庆祝或奖励瞬间。"
      eyebrow="Waviness · bold · 10px"
      initialMerged={false}
      title="A fuller liquid silhouette"
      waviness={10}
      wavinessFreq={0.014}
    />
  ),
};

interface MorphKnobProps {
  shape: boolean;
  speed: number;
  bounce: number;
  contentBlur: number;
}

const morphKnobArgTypes = {
  shape: { control: 'boolean', description: 'Shape timeline on/off' },
  speed: { control: { max: 2, min: 0.25, step: 0.05 }, description: 'Morph tempo' },
  bounce: { control: { max: 1, min: 0, step: 0.05 }, description: 'Physics overshoot' },
  contentBlur: { control: { max: 14, min: 0, step: 0.5 }, description: 'Content blur in px' },
} as const;

function MorphKnobScene({ shape, speed, bounce, contentBlur }: MorphKnobProps): ReactNode {
  const [wide, setWide] = useState(false);
  const width = wide ? 176 : 92;
  const height = wide ? 84 : 60;
  const radius = wide ? 24 : 999;
  return (
    <article className="game-ui-liquid-gooey-card">
      <header className="game-ui-liquid-demo-header">
        <span className="game-ui-liquid-demo-kicker">Morph · shape + content</span>
        <h2>Watch the corner timeline</h2>
        <p>
          点击卡片在窄胶囊和宽面板之间切换：中心先走，尺寸随后跟上，圆角最后收锐；内容层的
          cross-blur 只在运动中出现。
        </p>
      </header>
      <div className="game-ui-liquid-demo-stage">
        <LiquidGroup
          className="game-ui-liquid-demo-group"
          contrast={18}
          filterPadding={28}
          style={{ height: '220px', width: '100%' }}
          waviness={0}
        >
          <LiquidGroup.Item
            data-testid="morph-knob-item"
            morph={{ bounce, contentBlur, shape, speed }}
            radius={radius}
            style={{
              height: `${height}px`,
              left: 'calc(50% - 88px)',
              position: 'absolute',
              top: '68px',
              width: `${width}px`,
            }}
          >
            <button
              className="game-ui-liquid-demo-morph-card"
              onClick={() => setWide((value) => !value)}
              type="button"
            >
              {wide ? 'Shape on' : 'Shape next'}
            </button>
          </LiquidGroup.Item>
        </LiquidGroup>
      </div>
      <div className="game-ui-liquid-demo-controls">
        <GameButton onClick={() => setWide((value) => !value)} variant="primary">
          {wide ? 'Make it compact' : 'Make it wide'}
        </GameButton>
        <span className="game-ui-liquid-demo-status" aria-live="polite">
          shape {shape ? 'on' : 'off'} · speed {speed} · bounce {bounce} · blur {contentBlur}px
        </span>
      </div>
    </article>
  );
}

export const MorphConservative: StoryObj<MorphKnobProps> = {
  argTypes: morphKnobArgTypes,
  args: { bounce: 0, contentBlur: 3, shape: false, speed: 0.7 },
  render: (args) => <MorphKnobScene {...args} />,
};

export const MorphDefault: StoryObj<MorphKnobProps> = {
  argTypes: morphKnobArgTypes,
  args: { bounce: 0.5, contentBlur: 7, shape: true, speed: 1 },
  render: (args) => <MorphKnobScene {...args} />,
};

export const MorphBold: StoryObj<MorphKnobProps> = {
  argTypes: morphKnobArgTypes,
  args: { bounce: 0.85, contentBlur: 12, shape: true, speed: 1.6 },
  render: (args) => <MorphKnobScene {...args} />,
};

export const ContentBlurOff: StoryObj<MorphKnobProps> = {
  argTypes: morphKnobArgTypes,
  args: { bounce: 0.5, contentBlur: 0, shape: true, speed: 1 },
  render: (args) => <MorphKnobScene {...args} />,
};

export const ContentBlurDefault: StoryObj<MorphKnobProps> = {
  argTypes: morphKnobArgTypes,
  args: { bounce: 0.5, contentBlur: 7, shape: true, speed: 1 },
  render: (args) => <MorphKnobScene {...args} />,
};

export const ContentBlurBold: StoryObj<MorphKnobProps> = {
  argTypes: morphKnobArgTypes,
  args: { bounce: 0.5, contentBlur: 12, shape: true, speed: 1 },
  render: (args) => <MorphKnobScene {...args} />,
};

interface BendKnobProps {
  vertical: number;
  horizontal: number;
}

const bendKnobArgTypes = {
  vertical: { control: { max: 1, min: 0, step: 0.05 }, description: 'Vertical bow strength' },
  horizontal: {
    control: { max: 1, min: 0, step: 0.05 },
    description: 'Horizontal cap deformation',
  },
} as const;

function BendKnobScene({ vertical, horizontal }: BendKnobProps): ReactNode {
  const [dragged, setDragged] = useState(false);
  return (
    <article className="game-ui-liquid-gooey-card">
      <header className="game-ui-liquid-demo-header">
        <span className="game-ui-liquid-demo-kicker">Bend · surface-glued</span>
        <h2>Speed bends the surface</h2>
        <p>
          横向和纵向拖动都让真实内容与剪影保持同一位置；文字不会甩出自己的卡片。内容可用
          <code>--lg-bend-x/y</code> 和 unitless 变量跟着倾斜。
        </p>
      </header>
      <div className="game-ui-liquid-demo-stage">
        <LiquidGroup
          className="game-ui-liquid-demo-group"
          contrast={18}
          filterPadding={28}
          style={{ height: '220px', width: '100%' }}
          waviness={0}
        >
          <LiquidGroup.Item
            bend={{ horizontal, vertical }}
            data-testid="bend-knob-item"
            effect="bend"
            style={{ left: 'calc(50% - 72px)', position: 'absolute', top: '76px' }}
          >
            <button
              className="game-ui-liquid-demo-bend-card"
              onClick={() => setDragged((value) => !value)}
              style={{
                transform: `translate(${dragged ? 150 : 0}px, ${dragged ? -22 : 0}px) rotate(calc(var(--lg-bend-yn, 0) * 0.35deg))`,
              }}
              type="button"
            >
              {dragged ? 'Bend back' : 'Bend me'}
            </button>
          </LiquidGroup.Item>
        </LiquidGroup>
      </div>
      <div className="game-ui-liquid-demo-controls">
        <GameButton onClick={() => setDragged((value) => !value)} variant="primary">
          {dragged ? 'Return the card' : 'Drag the card'}
        </GameButton>
        <span className="game-ui-liquid-demo-status" aria-live="polite">
          vertical {vertical} · horizontal {horizontal} · no tail / no lag
        </span>
      </div>
    </article>
  );
}

export const BendConservative: StoryObj<BendKnobProps> = {
  argTypes: bendKnobArgTypes,
  args: { horizontal: 0.15, vertical: 0.25 },
  render: (args) => <BendKnobScene {...args} />,
};

export const BendDefault: StoryObj<BendKnobProps> = {
  argTypes: bendKnobArgTypes,
  args: { horizontal: 0.35, vertical: 0.6 },
  render: (args) => <BendKnobScene {...args} />,
};

export const BendBold: StoryObj<BendKnobProps> = {
  argTypes: bendKnobArgTypes,
  args: { horizontal: 0.75, vertical: 0.95 },
  render: (args) => <BendKnobScene {...args} />,
};

export const AllEffectsBudget: Story = {
  render: () => (
    <article className="game-ui-liquid-gooey-card">
      <header className="game-ui-liquid-demo-header">
        <span className="game-ui-liquid-demo-kicker">Adoption · one budget</span>
        <h2>All adopted effects, one shared raster</h2>
        <p>
          下面同组展示 Morph contentBlur + shape 与 Bend；查看 group 的
          <code>data-liquid-filter-area</code> 和 <code>data-liquid-feature-padding</code>
          ，确认外扩已经计入 480,000px² 上限。
        </p>
      </header>
      <div className="game-ui-liquid-demo-stage">
        <LiquidGroup
          data-testid="all-effects-budget"
          className="game-ui-liquid-demo-group"
          style={{ height: '220px', width: '100%' }}
          waviness={0}
        >
          <LiquidGroup.Item
            morph={{ bounce: 0.5, contentBlur: 7, shape: true }}
            style={{
              height: '64px',
              left: '16%',
              position: 'absolute',
              top: '78px',
              width: '120px',
            }}
          >
            <span className="game-ui-liquid-demo-badge">Morph + blur</span>
          </LiquidGroup.Item>
          <LiquidGroup.Item
            bend={{ horizontal: 0.35, vertical: 0.6 }}
            effect="bend"
            style={{
              height: '64px',
              left: '58%',
              position: 'absolute',
              top: '78px',
              width: '120px',
            }}
          >
            <span className="game-ui-liquid-demo-badge">Bend</span>
          </LiquidGroup.Item>
        </LiquidGroup>
      </div>
      <div className="game-ui-liquid-demo-controls">
        <span className="game-ui-liquid-demo-status">
          Inspect the group attributes in DevTools · budget 480,000px²
        </span>
      </div>
    </article>
  ),
};
