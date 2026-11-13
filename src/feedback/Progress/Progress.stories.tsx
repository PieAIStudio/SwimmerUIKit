import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';

import { Button, Progress } from '../../index';

const meta = {
  title: 'Swimmer/Display/Progress',
  component: Progress,
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
} satisfies Meta<typeof Progress>;

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
      <Progress label="Lessons completed" max={100} showValue value={value} />
      <Button onClick={() => setValue((current) => Math.min(100, current + 18))}>
        Advance progress
      </Button>
    </div>
  );
}

export const MoveLeadingEdge: Story = {
  render: () => <MovingLeadingEdgeStory />,
};
