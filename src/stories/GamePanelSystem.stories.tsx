import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import {
  GameButton,
  GameCollapsiblePanel,
  GameFactList,
  GameModal,
  GameWindowPanel,
} from '../index';

const meta = {
  title: 'Clay/Panel System/Overview',
  component: GameCollapsiblePanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '游戏面板系统:可伸缩面板(GameCollapsiblePanel)、可最小化/最大化的窗口' +
          '(GameWindowPanel)、基于原生 <dialog> 的真模态(GameModal)。全部零运行时' +
          '依赖:高度动画用 CSS grid-rows,模态的焦点陷阱/Esc/顶层渲染由浏览器原生提供。' +
          '想看暗色效果,给任意父元素加 data-game-ui-theme="night"。',
      },
    },
  },
} satisfies Meta<typeof GameCollapsiblePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsible: Story = {
  args: { title: 'Inventory', children: null },
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <GameCollapsiblePanel title="Inventory">
        <GameFactList
          facts={[
            { id: 'wood', label: 'Wood', value: '58' },
            { id: 'stone', label: 'Stone', value: '12' },
            { id: 'gold', label: 'Gold', value: '340' },
          ]}
          label="Resources"
        />
      </GameCollapsiblePanel>
      <GameCollapsiblePanel defaultOpen={false} title="Quest log (starts collapsed)">
        <p style={{ margin: 0 }}>Defeat the tavern AI without being voted out.</p>
      </GameCollapsiblePanel>
    </div>
  ),
};

function WindowDemo(): React.ReactNode {
  const [visible, setVisible] = useState(true);
  return (
    <div style={{ position: 'relative', minHeight: 420, display: 'grid', gap: 12, alignContent: 'start' }}>
      {visible ? (
        <GameWindowPanel
          footer={<GameButton variant="primary">Craft</GameButton>}
          onClose={() => setVisible(false)}
          title="Crafting bench"
        >
          <p style={{ margin: 0 }}>
            Try the titlebar buttons: minimize collapses this window into a chip,
            maximize fills the nearest positioned ancestor, close removes it.
          </p>
        </GameWindowPanel>
      ) : (
        <GameButton onClick={() => setVisible(true)} variant="secondary">
          Reopen window
        </GameButton>
      )}
    </div>
  );
}

export const WindowStates: Story = {
  args: { title: 'Window', children: null },
  render: () => <WindowDemo />,
};

function ModalDemo(): React.ReactNode {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <GameButton onClick={() => setOpen(true)} variant="primary">
        Open modal
      </GameButton>
      <GameModal
        footer={
          <>
            <GameButton onClick={() => setOpen(false)} variant="ghost">
              Cancel
            </GameButton>
            <GameButton onClick={() => setOpen(false)} variant="primary">
              Confirm
            </GameButton>
          </>
        }
        onClose={() => setOpen(false)}
        open={open}
        size="sm"
        title="Leave the room?"
      >
        <p style={{ margin: 0 }}>
          Native dialog: Esc closes, backdrop click closes, focus is trapped and
          returned automatically by the browser.
        </p>
      </GameModal>
    </div>
  );
}

export const Modal: Story = {
  args: { title: 'Modal', children: null },
  render: () => <ModalDemo />,
};

export const NightTheme: Story = {
  args: { title: 'Night', children: null },
  render: () => (
    <div data-game-ui-theme="night" style={{ display: 'grid', gap: 12, maxWidth: 420, padding: 16, borderRadius: 26, background: 'var(--game-ui-bg)' }}>
      <GameCollapsiblePanel title="Inventory (night)">
        <p style={{ margin: 0, color: 'var(--game-ui-text)' }}>
          The same components under the official night theme — only tokens changed.
        </p>
      </GameCollapsiblePanel>
      <GameWindowPanel title="Map (night)">
        <p style={{ margin: 0, color: 'var(--game-ui-text)' }}>World map placeholder.</p>
      </GameWindowPanel>
    </div>
  ),
};
