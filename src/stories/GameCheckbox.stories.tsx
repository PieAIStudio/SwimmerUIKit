import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameCheckbox } from '../index';

const meta = {
  title: 'Clay/Forms/GameCheckbox',
  component: GameCheckbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '原生 checkbox + 自定义黏土勾选框(隐藏原生框但保留可聚焦、可朗读)。与 GameToggle 的区别:checkbox 是表单里的「选择」,toggle 是即时生效的「开关」。',
      },
    },
  },
  args: { label: 'Remember me on this device' },
} satisfies Meta<typeof GameCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
