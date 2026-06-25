import type { Meta, StoryObj } from '@storybook/react-vite';
import { GamePanel } from '../index';

const meta = {
  title: 'Clay/Surfaces/GamePanel',
  component: GamePanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '通用内容面板(分组容器)。`title` 给标题,`tone` 调整视觉强度,内容作为 children。',
      },
    },
  },
} satisfies Meta<typeof GamePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strong: Story = {
  args: {
    title: 'Buttons and controls',
    tone: 'strong',
    children: 'Panel content goes here — group related controls or copy inside one clay surface.',
  },
};
