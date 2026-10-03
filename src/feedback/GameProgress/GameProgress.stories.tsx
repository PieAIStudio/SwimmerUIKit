import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';

import { GameButton, GameProgress } from '../../index';

const meta = {
  title: 'Swimmer/Display/GameProgress',
  component: GameProgress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '潮汐液面表示真实进度，数值变化时晃动600ms后静止；带ARIA progressbar语义，不使用滤镜或待机动画。',
      },
    },
  },
  args: { label: 'Reveal countdown', value: 64, showValue: true },
} satisfies Meta<typeof GameProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Battery: Story = { args: { label: 'Batteries', value: 14, max: 20 } };
export const Low: Story = { args: { label: 'Batteries', value: 3, max: 20 } };
export const CountLabel: Story = {
  args: {
    label: 'Lessons completed',
    value: 12,
    max: 210,
    valueLabel: '12 / 210 节',
  },
};

function MovingLeadingEdgeStory(): ReactNode {
  const [value, setValue] = useState(24);
  return (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '520px' }}>
      <GameProgress label="Lessons completed" max={100} showValue value={value} />
      <GameButton onClick={() => setValue((current) => Math.min(100, current + 18))}>
        Advance progress
      </GameButton>
    </div>
  );
}

export const MoveLeadingEdge: Story = {
  render: () => <MovingLeadingEdgeStory />,
};
