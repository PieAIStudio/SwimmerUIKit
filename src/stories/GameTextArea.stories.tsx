import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameTextArea } from '../index';

const meta = {
  title: 'Clay/Forms/GameTextArea',
  component: GameTextArea,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '多行文本输入,与 GameInput 同款黏土描边。用于较长的输入,比如玩家写「判断」、反馈表单。',
      },
    },
  },
  args: { placeholder: '说说为什么觉得这个是真人…', rows: 3 },
} satisfies Meta<typeof GameTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true, defaultValue: '太短' } };
