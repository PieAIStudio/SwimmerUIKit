import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameInput } from '../index';

const meta = {
  title: 'Clay/Forms/GameInput',
  component: GameInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '黏土风格的单行文本输入框 —— 对原生 `<input>` 的薄封装(转发 ref,方便聚焦,比如发送后重新聚焦聊天框)。`invalid` 切换到危险态描边。',
      },
    },
  },
  args: { placeholder: '74X8VB' },
} satisfies Meta<typeof GameInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'ab' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: '74X8VB' } };
