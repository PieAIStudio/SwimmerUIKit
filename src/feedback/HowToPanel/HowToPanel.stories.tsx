import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { HowToPanel } from './HowToPanel';
import { WifiDrawing } from '../HelpLoop/HelpLoop.stories';
import { Button } from '../../controls/Button/Button';
import { Modal } from '../../containers/Modal/Modal';

const meta = {
  title: 'Feedback/HowToPanel',
  component: HowToPanel,
  args: {
    label: 'Connect two devices',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    steps: [
      {
        media: <WifiDrawing />,
        poster: <WifiDrawing step={2} />,
        caption: 'Join the same Wi-Fi on both devices.',
      },
      {
        media: <WifiDrawing step={1} />,
        poster: <WifiDrawing step={2} />,
        caption: 'Keep both devices nearby.',
      },
      {
        media: <WifiDrawing step={2} />,
        poster: <WifiDrawing step={2} />,
        caption: 'Confirm the connection on both devices.',
      },
    ],
  },
} satisfies Meta<typeof HowToPanel>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeSteps: Story = {
  render: (args) => (
    <div style={{ width: 'min(100%, 420px)' }}>
      <h2>Connect two devices</h2>
      <HowToPanel {...args} />
    </div>
  ),
};

function DialogExample(args: React.ComponentProps<typeof HowToPanel>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Show connection guide</Button>
      <Modal open={open} title="Connect two devices" onClose={() => setOpen(false)} size="sm">
        <HowToPanel {...args} />
      </Modal>
    </>
  );
}
export const InsideDialog: Story = { render: (args) => <DialogExample {...args} /> };
