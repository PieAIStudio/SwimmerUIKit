import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { GameHelpTip } from '../GameHelpTip';
import { GameButton } from '../GameButton';
import { GameModal } from '../GamePanelSystem';

const meta = {
  title: 'Controls/GameHelpTip',
  component: GameHelpTip,
  args: {
    label: '备份说明',
    children: '下载一份作品副本到你的设备。之后可以从备份恢复，不会替换当前作品。',
  },
} satisfies Meta<typeof GameHelpTip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BesideTitle: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <h3>备份与恢复</h3>
      <GameHelpTip {...args} />
    </div>
  ),
};

function ModalExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <GameButton onClick={() => setOpen(true)}>打开示例</GameButton>
      <GameModal open={open} title="作品设置" onClose={() => setOpen(false)}>
        <span>备份与恢复</span>
        <GameHelpTip label="备份说明">
          帮助支持鼠标、键盘和触屏。关闭帮助不会关闭这个面板。
        </GameHelpTip>
      </GameModal>
    </>
  );
}
export const InsideDialog: Story = { render: () => <ModalExample /> };
