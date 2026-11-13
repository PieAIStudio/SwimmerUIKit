import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, EmptyState } from '../../index';

const meta = {
  title: 'Swimmer/Display/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '空列表 / 空状态占位:图标 + 标题 + 说明 + 可选行动按钮。用于「还没有牌桌」「暂无历史」等场景。',
      },
    },
  },
  args: {
    icon: 'scroll',
    title: 'No open tables yet',
    description: 'Be the first to host. Guests join free through your invite.',
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = {
  args: { action: <Button variant="primary">Open my own table</Button> },
};
