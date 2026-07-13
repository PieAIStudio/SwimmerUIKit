import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameStageTile } from '../index';

const meta = {
  title: 'Clay/Surfaces/GameStageTile',
  component: GameStageTile,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '世界大厅里的"入口砖块":每块代表一个去处(Daily / Portal / Host Gate),`tone` 决定配色,`selected` 高亮当前选择。',
      },
    },
  },
} satisfies Meta<typeof GameStageTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Daily: Story = {
  args: {
    badge: 'solo',
    icon: 'scroll',
    kicker: 'Daily',
    selected: true,
    summary: 'Read one case, pick the AI, share the result.',
    title: 'Daily Turing Challenge',
    tone: 'daily',
  },
};

export const Portal: Story = {
  args: {
    badge: 'free guests',
    icon: 'portal',
    kicker: 'Portal',
    summary: 'Enter a code, resume a table, or open your own.',
    title: 'Tavern Portal',
    tone: 'portal',
  },
};
