import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge, Button, PageSurface, Panel as BasePanel } from '../../index';

const meta = {
  title: 'Swimmer/Tool shell/PageSurface',
  component: PageSurface,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '无状态的工具页骨架。宿主提供页面文案、数据和动作；组件只固定标题区、内容区、可选侧栏和底部槽位。',
      },
    },
  },
} satisfies Meta<typeof PageSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Slots: Story = {
  args: {
    eyebrow: 'Workspace',
    title: 'A page with deliberate slots',
    description: 'The same frame can carry home, results, review, complete or settings content.',
    children: (
      <BasePanel>
        <h2 style={{ margin: 0, fontSize: 'var(--swimmer-font-title)' }}>Content slot</h2>
        <p style={{ margin: 0, color: 'var(--swimmer-text-muted)' }}>
          Children remain host-owned. The frame does not know about routes or business state.
        </p>
      </BasePanel>
    ),
    aside: (
      <>
        <Badge tone="success">Ready</Badge>
        <Badge>Host data</Badge>
      </>
    ),
    footer: <Button>Secondary action</Button>,
    primaryAction: <Button variant="primary">Continue</Button>,
    layout: 'split',
  },
};
