import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { HelpTip } from './HelpTip';
import { Button } from '../../controls/Button/Button';
import { Modal } from '../../containers/Modal/Modal';
import { WifiDrawing } from '../HelpLoop/HelpLoop.stories';

const meta = {
  title: 'Controls/HelpTip',
  component: HelpTip,
  args: {
    label: '备份说明',
    children: '下载一份作品副本到你的设备。',
  },
} satisfies Meta<typeof HelpTip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AnimatedWiFi: Story = {
  args: {
    label: 'Connection help',
    children: '',
    caption: 'Join the same Wi-Fi on both devices.',
    media: <WifiDrawing />,
    poster: <WifiDrawing step={2} />,
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <h3>Connect two devices</h3>
      <HelpTip {...args} />
    </div>
  ),
};

export const BesideTitle: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <h3>备份与恢复</h3>
      <HelpTip {...args} />
    </div>
  ),
};

function ModalExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开示例</Button>
      <Modal open={open} title="作品设置" onClose={() => setOpen(false)}>
        <span>备份与恢复</span>
        <HelpTip
          label="Connection help"
          caption="Join the same Wi-Fi on both devices."
          media={<WifiDrawing />}
          poster={<WifiDrawing step={2} />}
        />
      </Modal>
    </>
  );
}
export const InsideDialog: Story = { render: () => <ModalExample /> };
