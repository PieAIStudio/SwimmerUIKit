import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameAvatar } from '../index';

const meta = {
  title: 'Clay/Display/GameAvatar',
  component: GameAvatar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '玩家头像:有图就显图,无图自动回退到姓名首字母;可选在线状态点(online / busy / away)。',
      },
    },
  },
  args: { name: 'Mika Ono' },
} satisfies Meta<typeof GameAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const Online: Story = { args: { status: 'online' } };
export const Large: Story = { args: { size: 'lg', status: 'busy' } };
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <GameAvatar key={size} name="River" size={size} status="online" />
      ))}
    </div>
  ),
};
