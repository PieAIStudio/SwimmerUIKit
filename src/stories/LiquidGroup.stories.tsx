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
}

function MorphScene({
  eyebrow,
  title,
  description,
  initialMerged,
  motion = 'auto',
}: MorphSceneProps): ReactNode {
  const [merged, setMerged] = useState(initialMerged);
  const firstX = merged ? 24 : -24;
  const secondX = merged ? -24 : 24;

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
          stroke="1px var(--game-ui-border-subtle)"
          style={{ width: '100%', height: '220px' }}
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
              ? 'Merged · filter still, content stays crisp'
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
