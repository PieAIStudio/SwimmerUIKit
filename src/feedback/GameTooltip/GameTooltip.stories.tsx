import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameButton, GameTooltip } from '../../index';

const meta = {
  title: 'Swimmer/Feedback/GameTooltip',
  component: GameTooltip,
  tags: ['autodocs'],
  args: {
    label: '保存到我的作品',
    children: <GameButton>保存</GameButton>,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '96px 24px 120px' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '为可聚焦的触发器补充简短说明。`align` 决定气泡与触发器哪一边对齐（center / start / end），`placement` 决定在上方或下方；`label` 中的换行会保留。重要信息不能只靠悬停看到。',
      },
    },
  },
} satisfies Meta<typeof GameTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AlignStart: Story = {
  name: 'Align start / 左边对齐',
  args: { align: 'start', label: '左边与按钮对齐，向右展开' },
};

export const AlignEnd: Story = {
  name: 'Align end / 右边对齐',
  args: { align: 'end', label: '右边与按钮对齐，向左展开' },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '96px 24px 120px' }}>
        <Story />
      </div>
    ),
  ],
};

export const PlacementBottom: Story = {
  name: 'Below the trigger / 下方',
  args: { placement: 'bottom', label: '显示在按钮下方' },
};

export const MultiLine: Story = {
  name: 'Multi-line label / 多行',
  args: { label: '第一行：保存的是草稿\n第二行：发布前可以继续修改' },
};

export const LongLabel: Story = {
  name: 'Long label / 长文字换行',
  args: {
    label:
      '这段说明比较长，会在最大宽度内换行，不会一直向右撑开成一整行，也不会超出视口两侧的安全距离。',
  },
};
