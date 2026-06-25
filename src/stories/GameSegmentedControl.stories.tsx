import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameSegmentedControl } from '../index';

const meta = {
  title: 'Clay/Controls/GameSegmentedControl',
  component: GameSegmentedControl,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '分段选择器:在少量互斥选项间切换,`activeId` 标记当前项。',
      },
    },
  },
} satisfies Meta<typeof GameSegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeId: 'live',
    label: 'Preview mode',
    options: [
      { id: 'daily', label: 'Daily' },
      { id: 'live', label: 'Live room' },
      { id: 'tokens', label: 'Tokens' },
    ],
  },
};
