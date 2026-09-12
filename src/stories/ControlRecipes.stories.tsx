import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Title,
  Description,
  Primary as PrimaryCanvas,
  Controls,
} from '@storybook/addon-docs/blocks';
import { CONTROL_RECIPES, ControlRecipe, recipeCode } from '../../preview/catalog/recipes';
import '../../preview/catalog/catalog.css';

const meta = {
  title: 'Start Here/Controls and Materials',
  component: ControlRecipe,
  tags: ['autodocs', 'recommended'],
  args: { recipe: 'button', material: 'glossy', state: 'ready', tone: 'primary' },
  argTypes: {
    recipe: { control: 'select', options: CONTROL_RECIPES.map((entry) => entry.id) },
    material: { control: 'select', options: ['flat', 'matte', 'glossy'] },
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
export const Matte: Story = { args: { material: 'matte' } };
export const Disabled: Story = { args: { state: 'disabled' } };
export const Icon: Story = { args: { recipe: 'icon' } };
export const Toggle: Story = { args: { recipe: 'toggle' } };
export const Segmented: Story = { args: { recipe: 'segmented' } };
export const Progress: Story = { args: { recipe: 'progress' } };
export const Select: Story = { args: { recipe: 'select' } };
export const SelectInvalid: Story = { args: { recipe: 'select', state: 'invalid' } };
export const MatteIcon: Story = { args: { recipe: 'icon', material: 'matte' } };
export const MatteToggle: Story = { args: { recipe: 'toggle', material: 'matte' } };
export const MatteSegmented: Story = { args: { recipe: 'segmented', material: 'matte' } };
export const MatteProgress: Story = { args: { recipe: 'progress', material: 'matte' } };
export const MatteSelect: Story = { args: { recipe: 'select', material: 'matte' } };
export const DisabledIcon: Story = { args: { recipe: 'icon', state: 'disabled' } };
export const DisabledToggle: Story = { args: { recipe: 'toggle', state: 'disabled' } };
export const DisabledSegmented: Story = { args: { recipe: 'segmented', state: 'disabled' } };
export const DisabledSelect: Story = { args: { recipe: 'select', state: 'disabled' } };
export const FlatProgress: Story = { args: { recipe: 'progress', material: 'flat' } };
export const FlatSegmented: Story = { args: { recipe: 'segmented', material: 'flat' } };
export const Input: Story = { args: { recipe: 'input', material: 'flat' } };
export const InvalidInput: Story = {
  args: { recipe: 'input', material: 'flat', state: 'invalid' },
};
export const Textarea: Story = { args: { recipe: 'textarea', material: 'flat' } };
export const Checkbox: Story = { args: { recipe: 'checkbox', material: 'flat' } };
export const Slider: Story = { args: { recipe: 'slider', material: 'flat' } };
export const Feedback: Story = { args: { recipe: 'feedback', material: 'flat' } };
export const Modal: Story = { args: { recipe: 'modal', material: 'flat' } };
