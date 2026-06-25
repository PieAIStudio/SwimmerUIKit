import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameButton } from '../index';

const meta = {
  title: 'Clay/Controls/GameButton',
  component: GameButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '主操作按钮。黏土质感,通过 `variant` 切换强弱;`sound` prop 可选地接入交互音效(由宿主 App 注入音量设置,组件本身不依赖任何业务 store)。',
      },
    },
  },
} satisfies Meta<typeof GameButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary', children: 'Open my own table' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Join by code' },
};

export const WithSound: Story = {
  args: {
    variant: 'primary',
    children: 'Sound on click',
    sound: { enabled: true, masterVolume: 0.8, sfxVolume: 0.6 },
  },
};
