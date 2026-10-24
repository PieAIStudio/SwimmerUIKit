import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '../../index';

const meta = {
  title: 'Swimmer/Forms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '原生 checkbox + 自定义平面水滴勾选框(隐藏原生框但保留可聚焦、可朗读)。与 Toggle 的区别:checkbox 是表单里的「选择」,toggle 是即时生效的「开关」。',
      },
    },
  },
  args: { label: 'Remember me on this device' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
