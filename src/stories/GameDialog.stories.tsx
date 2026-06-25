import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameDialog } from '../index';

const meta = {
  title: 'Clay/Surfaces/GameDialog',
  component: GameDialog,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '模态对话框(如开桌前的 Host Gate)。带 `role="dialog"` / `aria-modal` 语义,标题用 `title`,内容作为 children。',
      },
    },
  },
} satisfies Meta<typeof GameDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HostGate: Story = {
  args: {
    title: 'Host Gate',
    children: 'Only hosts see account and battery checks. Guests never do.',
  },
};
