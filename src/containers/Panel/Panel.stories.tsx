import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from '../../index';

const meta = {
  title: 'Swimmer/Surfaces/Panel',
  component: Panel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '通用内容面板(分组容器)。`title` 给标题,`tone` 调整视觉强度,内容作为 children。',
      },
    },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strong: Story = {
  args: {
    title: 'Buttons and controls',
    tone: 'strong',
    children: 'Panel content goes here — group related controls or copy inside one flat surface.',
  },
};
