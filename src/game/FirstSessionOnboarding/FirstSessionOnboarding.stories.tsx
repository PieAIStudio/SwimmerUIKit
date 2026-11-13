import type { Meta, StoryObj } from '@storybook/react-vite';
import { FirstSessionOnboarding } from './FirstSessionOnboarding';
import { WifiDrawing } from '../../feedback/HelpLoop/HelpLoop.stories';

const meta = {
  title: 'Game/FirstSessionOnboarding',
  component: FirstSessionOnboarding,
  args: {
    open: true,
    onDismiss: () => {},
    labels: {
      badge: 'Welcome',
      title: 'Start together',
      body: 'A quick guide to connecting your devices.',
      start: 'Get started',
      skip: 'Skip for now',
      steps: [
        {
          title: 'Connect',
          body: 'Join the same Wi-Fi.',
          media: <WifiDrawing />,
          poster: <WifiDrawing step={2} />,
        },
        {
          title: 'Stay nearby',
          body: 'Keep both devices nearby.',
          media: <WifiDrawing step={1} />,
          poster: <WifiDrawing step={2} />,
        },
        {
          title: 'Confirm',
          body: 'Confirm on both devices.',
          media: <WifiDrawing step={2} />,
          poster: <WifiDrawing step={2} />,
        },
      ],
    },
  },
} satisfies Meta<typeof FirstSessionOnboarding>;
export default meta;
type Story = StoryObj<typeof meta>;
export const IllustratedSteps: Story = {};
export const TextOnly: Story = {
  args: {
    labels: {
      ...meta.args.labels,
      steps: meta.args.labels.steps.map(({ title, body }) => ({ title, body })),
    },
  },
};
