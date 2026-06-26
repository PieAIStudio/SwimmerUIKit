import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameProgress } from '../index';

const meta = {
  title: 'Clay/Display/GameProgress',
  component: GameProgress,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '线性进度 / 计量条,带 ARIA `progressbar` 语义(valuenow/min/max)。`tone` 切换强调、成功、警告、危险配色。',
      },
    },
  },
  args: { label: 'Reveal countdown', value: 64, showValue: true },
} satisfies Meta<typeof GameProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Battery: Story = { args: { label: 'Batteries', value: 14, max: 20, tone: 'success' } };
export const Low: Story = { args: { label: 'Batteries', value: 3, max: 20, tone: 'danger' } };
