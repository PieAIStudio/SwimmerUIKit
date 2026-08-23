import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties, ReactNode } from 'react';

import { GamePanel } from '../index';
import { LiquidMetalButton } from '../LiquidMetalButton';

const meta = {
  title: 'Clay/Controls/LiquidMetalButton',
  component: LiquidMetalButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '决策面专用 CTA（付款、注册、解锁、落地页）。默认 CSS 渲染器，满足 webgl2 / 未减动效 / 进入视口 / 上下文预算 时升级到 WebGL。不要用在每天反复看的干活面。一页超过两个，就是用错了地方。',
      },
    },
  },
} satisfies Meta<typeof LiquidMetalButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const panelStyle: CSSProperties = {
  padding: 48,
  minHeight: 220,
};

function Pair({ children }: { children: ReactNode }): ReactNode {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 48,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 56,
      }}
    >
      {children}
    </div>
  );
}

export const CssRenderer: Story = {
  args: { children: 'Unlock badge', renderer: 'css' },
  render: (args) => (
    <GamePanel title="CSS renderer" tone="strong">
      <div style={panelStyle}>
        <LiquidMetalButton {...args} />
      </div>
    </GamePanel>
  ),
};

export const WebGLRenderer: Story = {
  args: { children: 'Become a member', renderer: 'webgl' },
  render: (args) => (
    <GamePanel title="WebGL renderer" tone="strong">
      <div style={panelStyle}>
        <LiquidMetalButton {...args} />
      </div>
    </GamePanel>
  ),
};

export const CssAndWebGL: Story = {
  args: { children: 'Subscribe' },
  render: () => (
    <Pair>
      <GamePanel title="CSS · zero WebGL context" tone="strong">
        <div style={panelStyle}>
          <LiquidMetalButton renderer="css">Subscribe with CSS</LiquidMetalButton>
        </div>
      </GamePanel>
      <GamePanel title="WebGL · when the budget allows" tone="strong">
        <div style={panelStyle}>
          <LiquidMetalButton renderer="webgl">Subscribe with WebGL</LiquidMetalButton>
        </div>
      </GamePanel>
    </Pair>
  ),
};
