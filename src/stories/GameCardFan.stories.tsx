import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameCardFan } from '../index';

const meta = {
  title: 'Clay/Surfaces/GameCardFan',
  component: GameCardFan,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '身份揭示时的"扇形牌阵":把若干角色卡以扇形展开,每张卡有 kicker / title / icon。',
      },
    },
  },
} satisfies Meta<typeof GameCardFan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RoleReveal: Story = {
  args: {
    label: 'Reveal card fan',
    cards: [
      { id: 'human', icon: 'home', kicker: 'Human', title: 'Mika' },
      { id: 'ai', icon: 'ai', kicker: 'AI', title: 'River' },
      { id: 'sympathizer', icon: 'crown', kicker: 'Sympathizer', title: 'Noa' },
    ],
  },
};
