import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThemeReview } from '../../../preview/review/ThemeReview';

const meta = {
  title: 'Foundations/Droplet theme',
  component: ThemeReview,
  parameters: { layout: 'fullscreen' },
  render: (_args, context) => (
    <ThemeReview
      uiStyle={context.globals.uiStyle ?? 'pastel'}
      theme={context.globals.theme === 'dark' ? 'dark' : 'light'}
    />
  ),
} satisfies Meta<typeof ThemeReview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EverydayControls: Story = {};
