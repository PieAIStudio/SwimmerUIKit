import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeedbackReview } from './FeedbackReview';
const meta = { title: 'Swimmer/Review/Feedback', component: FeedbackReview } satisfies Meta<
  typeof FeedbackReview
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const DisplayFamily: Story = {};
