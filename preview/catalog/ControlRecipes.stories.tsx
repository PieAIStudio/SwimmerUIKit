import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Title,
  Description,
  Primary as PrimaryCanvas,
  Controls,
} from '@storybook/addon-docs/blocks';
import { CONTROL_RECIPES, ControlRecipe, recipeCode } from './recipes';
import './catalog.css';

const meta = {
  title: 'Start Here/Controls and Materials',
  component: ControlRecipe,
  tags: ['autodocs', 'recommended'],
  args: { recipe: 'button', uiStyle: 'pastel', state: 'ready', tone: 'primary' },
  argTypes: {
    recipe: { control: 'select', options: CONTROL_RECIPES.map((entry) => entry.id) },
    uiStyle: { control: 'select', options: ['candy', 'pastel', 'mist', 'grey', 'outline', 'ink'] },
    state: { control: 'select', options: ['ready', 'disabled', 'invalid'] },
    tone: { control: 'select', options: ['primary', 'secondary', 'success', 'danger', 'ghost'] },
  },
  parameters: {
    docs: {
      // Default Autodocs mounts every story via <Stories />. These stories are
      // alternative states of one budgeted material, not simultaneous widgets.
      // Keep one live canvas with controls; every named story stays in the tree.
      page: () => (
        <>
          <Title />
          <Description />
          <PrimaryCanvas />
          <Controls />
          <p>
            用参数选择控件、材质与状态；左侧仍保留每个命名示例。此页只运行一个示例，不同时占用二十多组液体预算。
          </p>
        </>
      ),
      description: {
        component:
          '与品牌展厅共用真实示例。选择用途、材质与状态。普通输入/文本等不液体化；下拉选项仍是系统原生菜单。',
      },
      source: {
        transform: (_code: string, context: { args: Parameters<typeof recipeCode>[0] }) =>
          recipeCode(context.args),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="kit-recipe-stack" style={{ maxWidth: 420 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ControlRecipe>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {};
export const Mist: Story = { args: { uiStyle: 'mist' } };
export const Disabled: Story = { args: { state: 'disabled' } };
export const Icon: Story = { args: { recipe: 'icon' } };
export const Toggle: Story = { args: { recipe: 'toggle' } };
export const Segmented: Story = { args: { recipe: 'segmented' } };
export const Progress: Story = { args: { recipe: 'progress' } };
export const Select: Story = { args: { recipe: 'select' } };
export const SelectInvalid: Story = { args: { recipe: 'select', state: 'invalid' } };
export const MistIcon: Story = { args: { recipe: 'icon', uiStyle: 'mist' } };
export const MistToggle: Story = { args: { recipe: 'toggle', uiStyle: 'mist' } };
export const MistSegmented: Story = { args: { recipe: 'segmented', uiStyle: 'mist' } };
export const MistProgress: Story = { args: { recipe: 'progress', uiStyle: 'mist' } };
export const MistSelect: Story = { args: { recipe: 'select', uiStyle: 'mist' } };
export const DisabledIcon: Story = { args: { recipe: 'icon', state: 'disabled' } };
export const DisabledToggle: Story = { args: { recipe: 'toggle', state: 'disabled' } };
export const DisabledSegmented: Story = { args: { recipe: 'segmented', state: 'disabled' } };
export const DisabledSelect: Story = { args: { recipe: 'select', state: 'disabled' } };
export const GreyProgress: Story = { args: { recipe: 'progress', uiStyle: 'grey' } };
export const GreySegmented: Story = { args: { recipe: 'segmented', uiStyle: 'grey' } };
export const Input: Story = { args: { recipe: 'input', uiStyle: 'grey' } };
export const InvalidInput: Story = {
  args: { recipe: 'input', uiStyle: 'grey', state: 'invalid' },
};
export const Textarea: Story = { args: { recipe: 'textarea', uiStyle: 'grey' } };
export const Checkbox: Story = { args: { recipe: 'checkbox', uiStyle: 'grey' } };
export const Slider: Story = { args: { recipe: 'slider', uiStyle: 'grey' } };
export const Feedback: Story = { args: { recipe: 'feedback', uiStyle: 'grey' } };
export const Modal: Story = { args: { recipe: 'modal', uiStyle: 'grey' } };
