import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { HelpTip } from './HelpTip';
import { Button } from '../../controls/Button/Button';
import { Modal } from '../../containers/Modal/Modal';

const meta = {
  title: 'Controls/HelpTip',
  component: HelpTip,
  args: {
    label: '备份说明',
    children: '下载一份作品副本到你的设备。之后可以从备份恢复，不会替换当前作品。',
  },
} satisfies Meta<typeof HelpTip>;
export default meta;
type Story = StoryObj<typeof meta>;

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
        <HelpTip label="备份说明">帮助支持鼠标、键盘和触屏。关闭帮助不会关闭这个面板。</HelpTip>
      </Modal>
    </>
  );
}
export const InsideDialog: Story = { render: () => <ModalExample /> };
