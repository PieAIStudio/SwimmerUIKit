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

export const LiquidCta: Story = {
  name: 'Liquid CTA / 液体主按钮',
  tags: ['recommended', 'liquid'],
  args: { variant: 'primary', surface: 'liquid', children: '开始学习' },
  parameters: {
    docs: {
      description: {
        story:
          '直接用 GameButton，不手调 LiquidGroup。press 形态负责压扁与 wobbly 回弹；页面跳转、目标和过渡仍由产品拥有。',
      },
    },
  },
};

export const FullWidthLiquidCta: Story = {
  name: 'Full-width liquid CTA / 全宽主按钮',
  tags: ['recommended', 'liquid'],
  args: {
    variant: 'primary',
    surface: 'liquid',
    fullWidth: true,
    children: '进入课程 · Start learning',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 'min(320px, 100%)' }}>
        <Story />
      </div>
    ),
  ],
};

export const DisabledLiquidCta: Story = {
  name: 'Disabled CTA / 禁用后回到普通表面',
  tags: ['liquid'],
  args: {
    variant: 'primary',
    surface: 'liquid',
    fullWidth: true,
    disabled: true,
    children: '暂不可进入',
  },
};

export const WithSound: Story = {
  args: {
    variant: 'primary',
    children: 'Sound on click',
    sound: { enabled: true, masterVolume: 0.8, sfxVolume: 0.6 },
  },
};
