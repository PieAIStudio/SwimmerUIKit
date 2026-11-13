import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../index';

const meta = {
  title: 'Foundations/DropletSurface',
  component: Button,
  args: {
    children: 'Everyday control',
    variant: 'primary',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EverydayControls: Story = {};
