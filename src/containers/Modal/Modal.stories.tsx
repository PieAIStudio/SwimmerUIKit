import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button, CollapsiblePanel, FactList, Modal as ModalComponent } from '../../index';
import { WindowPanel } from '../WindowPanel/WindowPanel';

const meta = {
  title: 'Swimmer/Panel System/Overview',
  component: CollapsiblePanel,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '游戏面板系统:可伸缩面板(CollapsiblePanel)、可最小化/最大化的窗口' +
          '(WindowPanel)、基于原生 <dialog> 的真模态(Modal)。全部零运行时' +
          '依赖:高度动画用 CSS grid-rows,模态的焦点陷阱/Esc/顶层渲染由浏览器原生提供。' +
          '想看暗色效果,给任意父元素加 data-game-ui-theme="dark"。',
      },
    },
  },
} satisfies Meta<typeof CollapsiblePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsible: Story = {
  args: { title: 'Inventory', children: null },
  render: () => (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
      <CollapsiblePanel title="Inventory">
        <FactList
          facts={[
            { id: 'wood', label: 'Wood', value: '58' },
            { id: 'stone', label: 'Stone', value: '12' },
            { id: 'gold', label: 'Gold', value: '340' },
          ]}
          label="Resources"
        />
      </CollapsiblePanel>
      <CollapsiblePanel defaultOpen={false} title="Quest log (starts collapsed)">
        <p style={{ margin: 0 }}>Defeat the tavern AI without being voted out.</p>
      </CollapsiblePanel>
    </div>
  ),
};

function WindowDemo(): React.ReactNode {
  const [visible, setVisible] = useState(true);
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 420,
        display: 'grid',
        gap: 12,
        alignContent: 'start',
      }}
    >
      {visible ? (
        <WindowPanel
          footer={<Button variant="primary">Craft</Button>}
          onClose={() => setVisible(false)}
          title="Crafting bench"
        >
          <p style={{ margin: 0 }}>
            Try the titlebar buttons: minimize collapses this window into a chip, maximize fills the
            nearest positioned ancestor, close removes it.
          </p>
        </WindowPanel>
      ) : (
        <Button onClick={() => setVisible(true)} variant="secondary">
          Reopen window
        </Button>
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
      <Button onClick={() => setOpen(true)} variant="primary">
        Open modal
      </Button>
      <ModalComponent
        footer={
          <>
            <Button onClick={() => setOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)} variant="primary">
              Confirm
            </Button>
          </>
        }
        onClose={() => setOpen(false)}
        open={open}
        size="sm"
        title="Leave the room?"
      >
        <p style={{ margin: 0 }}>
          Native dialog: Esc closes, backdrop click closes, focus is trapped and returned
          automatically by the browser.
        </p>
      </ModalComponent>
    </div>
  );
}

export const Modal: Story = {
  args: { title: 'Modal', children: null },
  render: () => <ModalDemo />,
};

function ModalBottomSheetDemo(): React.ReactNode {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setOpen(true)} variant="primary">
        Open action sheet
      </Button>
      <ModalComponent
        footer={
          <Button onClick={() => setOpen(false)} variant="primary">
            Done
          </Button>
        }
        onClose={() => setOpen(false)}
        open={open}
        position="bottom"
        title="Choose an emote"
      >
        <p style={{ margin: 0 }}>
          Same native &lt;dialog&gt; as the centered modal — Esc, backdrop click, and focus trap all
          still come free. Only placement/shape/entrance change.
        </p>
      </ModalComponent>
    </div>
  );
}

export const ModalBottomSheet: Story = {
  args: { title: 'Modal (bottom sheet)', children: null },
  render: () => <ModalBottomSheetDemo />,
};

export const DarkTheme: Story = {
  args: { title: 'Dark', children: null },
  render: () => (
    <div
      data-game-ui-theme="dark"
      style={{
        display: 'grid',
        gap: 12,
        maxWidth: 420,
        padding: 16,
        borderRadius: 26,
        background: 'var(--swimmer-game-bg)',
      }}
    >
      {/* Human-facing fixture copy stays unchanged for S3 pixel comparison.
          The actual theme attribute and toolbar value above are dark. */}
      <CollapsiblePanel title="Inventory (dark)">
        <p style={{ margin: 0, color: 'var(--swimmer-game-text)' }}>
          The same components under the official dark theme — only tokens changed.
        </p>
      </CollapsiblePanel>
      <WindowPanel title="Map (dark)">
        <p style={{ margin: 0, color: 'var(--swimmer-game-text)' }}>World map placeholder.</p>
      </WindowPanel>
    </div>
  ),
};
