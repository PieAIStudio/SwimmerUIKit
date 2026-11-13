import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Input } from '../../index';

const meta = {
  title: 'Swimmer/Forms/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '给输入框配上标签、提示与错误文本的可访问包裹层。输入框放在 `<label>` 内部,天然关联(点标签即聚焦);`error` 出现时整组切红并以 `role="alert"` 朗读。',
      },
    },
  },
  args: { label: 'Room code', children: <Input placeholder="74X8VB" /> },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHint: Story = { args: { hint: 'Ask the host for the 6-character code.' } };
export const Required: Story = { args: { required: true } };
export const WithError: Story = {
  args: { error: 'That code has expired.', children: <Input defaultValue="000000" invalid /> },
};
