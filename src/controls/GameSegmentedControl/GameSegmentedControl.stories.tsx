import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type ReactNode } from 'react';

import { GameSegmentedControl } from '../../index';

const meta = {
  title: 'Swimmer/Controls/GameSegmentedControl',
  component: GameSegmentedControl,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '分段选择器:在少量互斥选项间切换,`activeId` 标记当前项。',
      },
    },
  },
} satisfies Meta<typeof GameSegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LongLabels: Story = {
  render: function LongLabelsStory(args) {
    const [activeId, setActiveId] = useState(args.activeId);
    return <GameSegmentedControl {...args} activeId={activeId} onSelect={setActiveId} />;
  },
  args: {
    activeId: 'describe',
    label: 'Party setup',
    options: [
      { id: 'describe', label: 'Describe the party you want to create' },
      { id: 'template', label: 'Start with a ready-made party template' },
      { id: 'import', label: 'Import an existing game configuration' },
    ],
  },
};

export const Default: Story = {
  args: {
    activeId: 'live',
    label: 'Preview mode',
    options: [
      { id: 'daily', label: 'Daily' },
      { id: 'live', label: 'Live room' },
      { id: 'tokens', label: 'Tokens' },
    ],
  },
};

function MoveIndicatorStory(): ReactNode {
  const [activeId, setActiveId] = useState('live');
  return (
    <GameSegmentedControl
      activeId={activeId}
      label="Preview mode"
      onSelect={setActiveId}
      options={[
        { id: 'daily', label: 'Daily' },
        { id: 'live', label: 'Live room' },
        { id: 'tokens', label: 'Tokens' },
      ]}
    />
  );
}

export const MoveIndicator: Story = {
  args: {
    activeId: 'live',
    label: 'Preview mode',
    options: [
      { id: 'daily', label: 'Daily' },
      { id: 'live', label: 'Live room' },
      { id: 'tokens', label: 'Tokens' },
    ],
  },
  render: () => <MoveIndicatorStory />,
};
