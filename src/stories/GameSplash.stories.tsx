import type { Meta, StoryObj } from '@storybook/react-vite';
import { GameSplash } from '../index';

const meta = {
  title: 'Clay/Display/GameSplash',
  component: GameSplash,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '开屏和转场屏：轮换的卖点句子（关键词亮起）、跟真实加载走的进度条、加载完才出现「点一下，开始」。转场模式只有一句话和进度条，不用点；配合 useGameSplashDelay 只在卡住超过 2 秒时出现。文字全部由产品传入。',
      },
    },
  },
  args: {
    title: 'University',
    lines: [
      { text: 'Ask AI and you get an answer; here you learn how to ask', highlight: 'how to ask' },
      { text: 'Every lesson comes with a real example', highlight: 'real example' },
      { text: 'Reviews arrive just before you would forget', highlight: 'before you would forget' },
    ],
    progress: 0.42,
    progressLabel: 'Preparing your island · 42%',
    ready: false,
    startLabel: 'Tap to start',
    onStart: () => {},
  },
} satisfies Meta<typeof GameSplash>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};
export const Ready: Story = { args: { progress: 1, progressLabel: 'Ready · 100%', ready: true } };
export const Transition: Story = {
  args: { mode: 'transition', progress: 0.7, progressLabel: 'Opening the island · 70%' },
};
