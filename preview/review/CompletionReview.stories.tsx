import type { Meta, StoryObj } from '@storybook/react-vite';
import { CompletionControls } from './CompletionReview';

const meta = { title: 'Swimmer/Review/Completion', component: CompletionControls } satisfies Meta<
  typeof CompletionControls
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Controls: Story = {};
